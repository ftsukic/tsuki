/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { StrictMode, useState } from 'react'
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import {
  ConfigProvider,
  DialogServiceBridge,
  TsukiProvider,
  createDialogService,
  useDialog,
  useTsukiTheme,
} from '..'
import type { DialogHandle, DialogResult } from '..'
import { bindDialogService } from '../dialog/imperative'
import { useOverlayRuntime } from '../overlay/use-overlay-runtime'
import type { OverlayRegistry } from '../overlay/types'

jest.mock('../overlay/transition', () => {
  const React = jest.requireActual('react')
  return {
    OverlayEntryTransition: ({ entry }: { entry: { content: ReactNode; mask?: ReactNode } }) =>
      React.createElement(React.Fragment, null, entry.mask, entry.content),
  }
})

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

it('rejects asynchronously when called without a mounted bridge', async () => {
  const service = createDialogService()
  await expect(service.alert()).rejects.toThrow(
    'DialogService requires a mounted DialogServiceBridge inside TsukiProvider.',
  )
})

it('resolves structured DialogResult for confirm, cancel, and dismiss without rejecting on cancel', async () => {
  const service = createDialogService()
  const registryStore: RegistryStore = {}
  await render(
    <TsukiProvider scheme="light">
      <DialogServiceBridge service={service} />
      <RegistryCapture store={registryStore} />
    </TsukiProvider>,
  )

  let confirmResult!: Promise<DialogResult>
  await act(async () => {
    confirmResult = service.alert({ title: 'Saved' })
  })
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  expect(await confirmResult).toEqual({ action: 'confirm' })
  const confirmExit = requireRegistry(registryStore).getSnapshot()[0]
  expect(confirmExit.phase).toBe('exiting')
  await act(async () => {
    expect(
      requireRegistry(registryStore).completeExit(confirmExit.id, confirmExit.generation),
    ).toBe(true)
  })

  let cancelResult!: Promise<DialogResult>
  await act(async () => {
    cancelResult = service.confirm({ title: 'Delete?' })
  })
  await fireEvent.press(screen.getByTestId('dialog-cancel-button'))
  expect(await cancelResult).toEqual({ action: 'cancel' })
  const cancelExit = requireRegistry(registryStore).getSnapshot()[0]
  expect(cancelExit.phase).toBe('exiting')
  await act(async () => {
    expect(requireRegistry(registryStore).completeExit(cancelExit.id, cancelExit.generation)).toBe(
      true,
    )
  })

  let backResult!: Promise<DialogResult>
  await act(async () => {
    backResult = service.confirm({ title: 'Dismiss via Back' })
  })
  await act(async () => {
    expect(requireRegistry(registryStore).dispatchBack()).toBe(true)
  })
  expect(await backResult).toEqual({ action: 'dismiss', reason: 'back' })
})

it('supports live handle.update() and handle.close() via open()', async () => {
  const service = createDialogService()
  await render(
    <TsukiProvider scheme="light">
      <DialogServiceBridge service={service} />
    </TsukiProvider>,
  )

  let handle!: DialogHandle
  await act(async () => {
    handle = service.open({ title: 'Step 1', message: 'Loading...' })
  })
  expect(screen.getByText('Step 1')).toBeTruthy()
  expect(screen.getByText('Loading...')).toBeTruthy()

  await act(async () => {
    handle.update({ title: 'Step 2', message: 'Done!' })
  })
  expect(screen.getByText('Step 2')).toBeTruthy()
  expect(screen.getByText('Done!')).toBeTruthy()

  await act(async () => handle.close())
  expect(await handle.result).toEqual({ action: 'dismiss', reason: 'programmatic' })
})

it('supports in-tree useDialog() inheriting local ConfigProvider theme without a Bridge', async () => {
  const results: DialogResult[] = []

  function ThemeBody() {
    const theme = useTsukiTheme()
    return <Text testID="hook-dialog-theme">{theme.semantic.colorPrimary}</Text>
  }

  function Consumer() {
    const dialog = useDialog()
    return (
      <Pressable
        testID="open-hook-dialog"
        onPress={() => {
          void dialog
            .confirm({ title: 'From Hook', children: <ThemeBody /> })
            .then((result) => results.push(result))
        }}
      >
        <Text>Open</Text>
      </Pressable>
    )
  }

  await render(
    <TsukiProvider scheme="light">
      <ConfigProvider theme={{ semantic: { colorPrimary: '#7c3aed' } }}>
        <Consumer />
      </ConfigProvider>
    </TsukiProvider>,
  )

  await fireEvent.press(screen.getByTestId('open-hook-dialog'))
  expect(screen.getByText('From Hook')).toBeTruthy()
  expect(screen.getByTestId('hook-dialog-theme').props.children).toBe('#7c3aed')
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  expect(results).toEqual([{ action: 'confirm' }])
})

it('settles a replaced request immediately and isolates the new Entry from old async work', async () => {
  const service = createDialogService()
  const registryStore: RegistryStore = {}
  await render(
    <TsukiProvider scheme="light">
      <DialogServiceBridge service={service} />
      <RegistryCapture store={registryStore} />
    </TsukiProvider>,
  )

  let allowOldClose!: (allowed: boolean) => void
  let oldResult!: Promise<DialogResult>
  await act(async () => {
    oldResult = service.alert({
      title: 'Old request',
      beforeClose: () =>
        new Promise<boolean>((resolve) => {
          allowOldClose = resolve
        }),
    })
  })
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  const oldEntry = requireRegistry(registryStore).getSnapshot()[0]

  let newResult!: Promise<DialogResult>
  await act(async () => {
    newResult = service.alert({ title: 'New request' })
  })
  expect(await oldResult).toEqual({ action: 'dismiss', reason: 'programmatic' })
  const entries = requireRegistry(registryStore).getSnapshot()
  const replacement = entries.find((entry) => entry.id !== oldEntry.id)
  expect(replacement).toBeTruthy()
  expect(entries.find((entry) => entry.id === oldEntry.id)?.phase).toBe('exiting')
  expect(screen.getByText('New request')).toBeTruthy()

  await act(async () => {
    allowOldClose(true)
    await Promise.resolve()
  })
  expect(
    requireRegistry(registryStore)
      .getSnapshot()
      .some((entry) => entry.id === replacement?.id),
  ).toBe(true)
  await fireEvent.press(screen.getAllByTestId('dialog-confirm-button').at(-1)!)
  expect(await newResult).toEqual({ action: 'confirm' })

  const oldExit = requireRegistry(registryStore)
    .getSnapshot()
    .find((entry) => entry.id === oldEntry.id)
  if (oldExit) {
    await act(async () => {
      expect(requireRegistry(registryStore).completeExit(oldExit.id, oldExit.generation)).toBe(true)
    })
  }
  expect(
    requireRegistry(registryStore)
      .getSnapshot()
      .some((entry) => entry.id === replacement?.id),
  ).toBe(true)
})

it('resolves pending requests as programmatic dismiss on closeAll or Root unmount', async () => {
  const service = createDialogService()
  const registryStore: RegistryStore = {}

  function Harness() {
    const [rootMounted, setRootMounted] = useState(true)
    return (
      <>
        <Pressable testID="unmount-dialog-root" onPress={() => setRootMounted(false)} />
        {rootMounted ? (
          <TsukiProvider scheme="light">
            <DialogServiceBridge service={service} />
            <RegistryCapture store={registryStore} />
          </TsukiProvider>
        ) : null}
      </>
    )
  }

  await render(<Harness />)
  let closed!: Promise<DialogResult>
  await act(async () => {
    closed = service.alert({ title: 'Close me' })
  })
  await act(async () => service.closeAll())
  expect(await closed).toEqual({ action: 'dismiss', reason: 'programmatic' })

  let rootDestroyed!: Promise<DialogResult>
  await act(async () => {
    rootDestroyed = service.alert({ title: 'Root bound' })
  })
  await fireEvent.press(screen.getByTestId('unmount-dialog-root'))
  expect(await rootDestroyed).toEqual({ action: 'dismiss', reason: 'programmatic' })
  await expect(service.alert()).rejects.toThrow(/DialogService requires a mounted/)
})

it('keeps independent services scoped to separate Roots', async () => {
  const lightService = createDialogService()
  const darkService = createDialogService()
  const lightRegistry: RegistryStore = {}
  const darkRegistry: RegistryStore = {}

  await render(
    <>
      <TsukiProvider scheme="light">
        <DialogServiceBridge service={lightService} />
        <RegistryCapture store={lightRegistry} />
      </TsukiProvider>
      <TsukiProvider scheme="dark">
        <DialogServiceBridge service={darkService} />
        <RegistryCapture store={darkRegistry} />
      </TsukiProvider>
    </>,
  )

  let lightResult!: Promise<DialogResult>
  let darkResult!: Promise<DialogResult>
  await act(async () => {
    lightResult = lightService.alert({ title: 'Light Root' })
    darkResult = darkService.alert({ title: 'Dark Root' })
  })
  expect(screen.getByText('Light Root')).toBeTruthy()
  expect(screen.getByText('Dark Root')).toBeTruthy()
  expect(requireRegistry(lightRegistry)).not.toBe(requireRegistry(darkRegistry))
  expect(requireRegistry(lightRegistry).getSnapshot()).toHaveLength(1)
  expect(requireRegistry(darkRegistry).getSnapshot()).toHaveLength(1)

  await fireEvent.press(screen.getAllByTestId('dialog-confirm-button')[0])
  expect(await lightResult).toEqual({ action: 'confirm' })
  expect(requireRegistry(darkRegistry).getSnapshot()[0].visible).toBe(true)
  await fireEvent.press(screen.getAllByTestId('dialog-confirm-button')[1])
  expect(await darkResult).toEqual({ action: 'confirm' })
})

it('survives StrictMode effect replay', async () => {
  const service = createDialogService()
  const registryStore: RegistryStore = {}
  await render(
    <StrictMode>
      <TsukiProvider scheme="light">
        <DialogServiceBridge service={service} />
        <RegistryCapture store={registryStore} />
      </TsukiProvider>
    </StrictMode>,
  )

  let result!: Promise<DialogResult>
  await act(async () => {
    result = service.alert({ title: 'Strict Root' })
  })
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  expect(await result).toEqual({ action: 'confirm' })
  expect(requireRegistry(registryStore).getSnapshot()[0].phase).toBe('exiting')
})

it('rejects a second Root binding for the same service', () => {
  const service = createDialogService()
  const controller = { open: jest.fn() }
  const firstRoot = {} as OverlayRegistry
  const secondRoot = {} as OverlayRegistry
  bindDialogService(service, controller, firstRoot)

  expect(() => bindDialogService(service, controller, secondRoot)).toThrow(
    'A DialogService can only be bound to one TsukiProvider Root at a time.',
  )
})

function RegistryCapture({ store }: { store: RegistryStore }) {
  store.registry = useOverlayRuntime().registry
  return null
}

function requireRegistry(store: RegistryStore) {
  if (!store.registry) throw new Error('The test did not capture a Root OverlayRegistry.')
  return store.registry
}

interface RegistryStore {
  registry?: OverlayRegistry
}
