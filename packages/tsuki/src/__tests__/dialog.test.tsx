/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import { ConfigProvider, Dialog, Portal, TsukiProvider } from '..'
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

it('keeps an uncontrolled Dialog mounted through exit and invokes confirm, beforeClose, afterOpen, and afterClose', async () => {
  const store: RegistryStore = {}
  const events: string[] = []

  await render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog
        defaultVisible
        title="Delete?"
        message="This cannot be undone."
        showCancelButton
        afterOpen={() => events.push('afterOpen')}
        afterClose={() => events.push('afterClose')}
        onConfirm={() => events.push('confirm')}
        beforeClose={(reason) => {
          events.push(`before:${reason}`)
        }}
      />
    </TsukiProvider>,
  )

  const registry = requireRegistry(store)
  const entry = registry.getSnapshot()[0]
  expect(screen.getByTestId('dialog-container')).toBeTruthy()
  expect(entry.mask).toBeTruthy()

  await act(async () => {
    expect(registry.completeEnter(entry.id, entry.generation)).toBe(true)
  })
  expect(events).toEqual(['afterOpen'])

  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))

  expect(events).toEqual(['afterOpen', 'confirm', 'before:confirm'])
  expect(registry.getSnapshot()[0]).toMatchObject({
    id: entry.id,
    visible: false,
    phase: 'exiting',
  })
  expect(screen.getByTestId('dialog-container')).toBeTruthy()

  const exiting = registry.getSnapshot()[0]
  await act(async () => {
    expect(registry.completeExit(entry.id, exiting.generation)).toBe(true)
  })
  expect(events).toEqual(['afterOpen', 'confirm', 'before:confirm', 'afterClose'])
  expect(registry.getSnapshot()).toEqual([])
  expect(screen.queryByTestId('dialog-container')).toBeNull()
})

it('keeps a controlled Dialog open when its parent declines a close request', async () => {
  const store: RegistryStore = {}
  const onVisibleChange = jest.fn()

  await render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog visible onVisibleChange={onVisibleChange} title="Controlled" />
    </TsukiProvider>,
  )
  const registry = requireRegistry(store)
  const firstId = registry.getSnapshot()[0].id

  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))

  expect(onVisibleChange).toHaveBeenCalledWith(false)
  expect(registry.getSnapshot()[0]).toMatchObject({ id: firstId, visible: true, phase: 'entering' })
  expect(screen.getByTestId('dialog-container')).toBeTruthy()
})

it('locks duplicate submissions, Back, and overlay taps while async beforeClose is pending and honors false', async () => {
  const store: RegistryStore = {}
  let finishCheck!: (allowed: boolean) => void
  const beforeClose = jest.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finishCheck = resolve
      }),
  )

  await render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog defaultVisible closeOnPressOverlay beforeClose={beforeClose} title="Async check" />
    </TsukiProvider>,
  )

  const registry = requireRegistry(store)
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState.busy).toBe(true)
  expect(registry.getSnapshot()[0].busy).toBe(true)

  // Duplicate button tap, Android Back, and mask tap must all be blocked while busy.
  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  const mask = registry.getSnapshot()[0].mask as ReactElement<{ closeOnPress: () => void }>
  await act(async () => mask.props.closeOnPress())
  expect(beforeClose).toHaveBeenCalledTimes(1)
  expect(registry.getSnapshot()[0]).toMatchObject({ visible: true, phase: 'entering' })

  await act(async () => finishCheck(false))
  expect(screen.getByTestId('dialog-container')).toBeTruthy()
  expect(registry.getSnapshot()[0]).toMatchObject({
    visible: true,
    phase: 'entering',
    busy: false,
  })
  expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState.busy).not.toBe(true)
})

it('routes closeOnPressOverlay and Back through beforeClose with distinct reasons', async () => {
  const store: RegistryStore = {}
  const onCancel = jest.fn()
  const beforeClose = jest.fn((reason: string) => reason !== 'back')

  await render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog
        defaultVisible
        showCancelButton
        closeOnPressOverlay
        onCancel={onCancel}
        beforeClose={beforeClose}
      />
    </TsukiProvider>,
  )
  const registry = requireRegistry(store)
  const entry = registry.getSnapshot()[0]

  // Back returns false from beforeClose -> stays open without entering exiting phase.
  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(beforeClose).toHaveBeenLastCalledWith('back')
  expect(registry.getSnapshot()[0]).toMatchObject({
    id: entry.id,
    phase: 'entering',
    visible: true,
  })

  // Overlay tap passes beforeClose('overlay') -> closes cleanly without calling onCancel.
  const mask = registry.getSnapshot()[0].mask as ReactElement<{
    closeOnClick: boolean
    closeOnPress: () => void
  }>
  expect(mask.props.closeOnClick).toBe(true)
  await act(async () => mask.props.closeOnPress())

  expect(onCancel).not.toHaveBeenCalled()
  expect(beforeClose).toHaveBeenLastCalledWith('overlay')
  expect(registry.getSnapshot()[0]).toMatchObject({ id: entry.id, phase: 'exiting' })
})

it('keeps a controlled Dialog open when Android Back is declined and respects closeOnBack=false', async () => {
  const store: RegistryStore = {}
  const onVisibleChange = jest.fn()

  const view = await render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog visible onVisibleChange={onVisibleChange} title="Back behavior" />
    </TsukiProvider>,
  )
  const registry = requireRegistry(store)
  const id = registry.getSnapshot()[0].id

  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(onVisibleChange).toHaveBeenCalledWith(false)
  expect(registry.getSnapshot()[0]).toMatchObject({ id, visible: true, phase: 'entering' })

  onVisibleChange.mockClear()
  await view.rerender(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      <Dialog visible closeOnBack={false} onVisibleChange={onVisibleChange} title="Back locked" />
    </TsukiProvider>,
  )
  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(onVisibleChange).not.toHaveBeenCalled()
})

it('uses NativeWind theme classes so className and classNames override default Dialog appearance', async () => {
  const view = await render(
    <TsukiProvider scheme="dark">
      <ConfigProvider
        theme={{
          components: {
            Dialog: { width: 280, borderRadius: 20, backgroundColor: '#123456' },
          },
        }}
      >
        <Dialog
          defaultVisible
          className="bg-red-500 rounded-3xl"
          classNames={{ container: 'bg-blue-500', mask: 'bg-black/80' }}
          message="Ignored message"
          title="Custom content"
          width={300}
          footer={<Text testID="custom-dialog-footer">Custom action</Text>}
        >
          <Text testID="custom-dialog-body">Custom body</Text>
        </Dialog>
      </ConfigProvider>
    </TsukiProvider>,
  )

  const container = screen.getByTestId('dialog-container')
  expect(container.props.className).toContain('bg-red-500')
  expect(container.props.className).toContain('rounded-3xl')
  expect(container.props.className).not.toContain('bg-blue-500')
  expect(container.props.className).not.toContain('bg-tsuki-dialog-background')
  expect(StyleSheet.flatten(container.props.style)).toMatchObject({ width: 300 })
  expect(StyleSheet.flatten(container.props.style).backgroundColor).toBeUndefined()
  expect(StyleSheet.flatten(container.props.style).borderRadius).toBeUndefined()
  expect(container.props.accessibilityViewIsModal).toBeUndefined()

  const maskProps = testNodeProps(view, 'dialog-mask')
  expect(maskProps.className).toContain('bg-black/80')
  expect(maskProps.style).toBeUndefined()
  expect(screen.getByTestId('custom-dialog-body')).toBeTruthy()
  expect(screen.queryByText('Ignored message')).toBeNull()
  expect(screen.getByTestId('custom-dialog-footer')).toBeTruthy()
  expect(screen.queryByTestId('dialog-confirm-button')).toBeNull()
})

it('uses semantic Button text classes for default action labels', async () => {
  await render(
    <TsukiProvider scheme="dark">
      <Dialog defaultVisible title="Dark actions" showCancelButton />
    </TsukiProvider>,
  )

  expect(screen.getByText('取消').props.className).toContain('text-tsuki-foreground')
  expect(screen.getByText('确认').props.className).toContain('text-tsuki-foreground')
})

it('isolates lower Portal accessibility while keeping a Portal above the modal accessible', async () => {
  const store: RegistryStore = {}

  function Harness() {
    const [visible, setVisible] = useState(false)
    return (
      <>
        <RegistryCapture store={store} />
        <Portal>
          <Text testID="lower-dialog-portal">Lower Portal</Text>
        </Portal>
        <Pressable testID="open-mixed-dialog" onPress={() => setVisible(true)}>
          <Text>Open</Text>
        </Pressable>
        <Dialog visible={visible} onVisibleChange={setVisible} title="Modal" />
        {visible ? (
          <Portal>
            <Text testID="upper-dialog-portal">Upper Portal</Text>
          </Portal>
        ) : null}
      </>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByTestId('open-mixed-dialog'))

  const registry = requireRegistry(store)
  const dialogEntry = registry.getSnapshot()[0]
  const lowerPortal = registry.getPortalSnapshot().find((entry) => entry.content != null)!
  expect(lowerPortal.order).toBeLessThan(dialogEntry.order)
  expect(testNodeProps(view, `tsuki-portal-layer-${lowerPortal.id}`)).toMatchObject({
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants',
  })
  expect(
    testNodeProps(view, `tsuki-overlay-layer-${dialogEntry.id}`).accessibilityViewIsModal,
  ).toBe(false)
  const upperPortal = registry.getPortalSnapshot().find((entry) => entry.id !== lowerPortal.id)!
  expect(upperPortal.order).toBeGreaterThan(dialogEntry.order)
  expect(testNodeProps(view, `tsuki-portal-layer-${upperPortal.id}`)).toMatchObject({
    accessibilityElementsHidden: false,
    importantForAccessibility: 'auto',
  })
  expect(screen.getByTestId('upper-dialog-portal')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('dialog-confirm-button'))
  const exiting = registry.getSnapshot()[0]
  await act(async () => {
    expect(registry.completeExit(dialogEntry.id, exiting.generation)).toBe(true)
  })
  expect(
    testNodeProps(view, `tsuki-portal-layer-${lowerPortal.id}`).importantForAccessibility,
  ).toBe('auto')
})

function RegistryCapture({ store }: { store: RegistryStore }) {
  store.registry = useOverlayRuntime().registry
  return null
}

function requireRegistry(store: RegistryStore) {
  if (!store.registry) throw new Error('The test did not capture a Root OverlayRegistry.')
  return store.registry
}

function testNodeProps(view: TestView, testID: string) {
  const node = testNodes(view, testID)[0]
  if (!node) throw new Error(`Could not find rendered node ${testID}.`)
  return node
}

function testNodes(view: TestView, testID: string | RegExp) {
  const found: Record<string, unknown>[] = []
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== 'object') return
    const node = value as { props?: Record<string, unknown>; children?: unknown }
    if (
      typeof node.props?.testID === 'string' &&
      (typeof testID === 'string' ? node.props.testID === testID : testID.test(node.props.testID))
    ) {
      found.push(node.props)
    }
    visit(node.children)
  }
  visit(view.toJSON())
  return found
}

interface RegistryStore {
  registry?: OverlayRegistry
}

interface TestView {
  toJSON(): unknown
}
