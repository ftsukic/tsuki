/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { Component, StrictMode, createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { ConfigProvider, TsukiProvider, useTsukiTheme } from '..'
import { OverlayPortal } from '../overlay/overlay-portal'
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

it('does not mount while hidden and keeps one Entry while content, mask, and transition update', async () => {
  const registryStore: RegistryStore = { current: null }

  function Harness() {
    const [visible, setVisible] = useState(false)
    const [revision, setRevision] = useState(0)
    const transition = {
      content: { preset: revision === 0 ? ('fade' as const) : ('scale-fade' as const) },
    }

    return (
      <>
        <Pressable testID="show-portal" onPress={() => setVisible(true)}>
          <Text>Show</Text>
        </Pressable>
        <Pressable testID="update-portal" onPress={() => setRevision((value) => value + 1)}>
          <Text>Update</Text>
        </Pressable>
        <OverlayPortal
          backBehavior="consume"
          mask={<Text testID="portal-mask">Mask {revision}</Text>}
          transition={transition}
          visible={visible}
        >
          <Text testID="portal-content">Content {revision}</Text>
        </OverlayPortal>
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )

  const registry = requireRegistry(registryStore)
  const mount = jest.spyOn(registry, 'mount')
  expect(registry.getSnapshot()).toHaveLength(0)

  await fireEvent.press(screen.getByTestId('show-portal'))
  expect(mount).toHaveBeenCalledTimes(1)
  expect(registry.getSnapshot()).toHaveLength(1)
  const firstId = registry.getSnapshot()[0].id

  await fireEvent.press(screen.getByTestId('update-portal'))
  expect(mount).toHaveBeenCalledTimes(1)
  expect(registry.getSnapshot()).toHaveLength(1)
  expect(registry.getSnapshot()[0]).toMatchObject({
    id: firstId,
    transition: { content: { preset: 'scale-fade' } },
  })
  expect(screen.getByTestId('portal-content').props.children).toEqual(['Content ', 1])
  expect(screen.getByTestId('portal-mask').props.children).toEqual(['Mask ', 1])
})

it('keeps the Entry mounted through exit, reopens it in place, and rejects the old exit completion', async () => {
  const registryStore: RegistryStore = { current: null }

  function Harness() {
    const [visible, setVisible] = useState(true)
    return (
      <>
        <Pressable testID="hide-portal" onPress={() => setVisible(false)}>
          <Text>Hide</Text>
        </Pressable>
        <Pressable testID="reopen-portal" onPress={() => setVisible(true)}>
          <Text>Reopen</Text>
        </Pressable>
        <OverlayPortal backBehavior="consume" visible={visible}>
          <Text testID="retained-content">Retained during exit</Text>
        </OverlayPortal>
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )

  const registry = requireRegistry(registryStore)
  const id = registry.getSnapshot()[0].id
  const initialGeneration = registry.getSnapshot()[0].generation

  await fireEvent.press(screen.getByTestId('hide-portal'))
  const exiting = registry.getSnapshot()[0]
  expect(exiting).toMatchObject({ id, phase: 'exiting', visible: false })
  expect(screen.getByTestId('retained-content')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('reopen-portal'))
  const reopened = registry.getSnapshot()[0]
  expect(reopened).toMatchObject({ id, phase: 'entering', visible: true })
  expect(reopened.generation).toBeGreaterThan(exiting.generation)
  expect(reopened.generation).toBeGreaterThan(initialGeneration)
  expect(registry.completeExit(id, exiting.generation)).toBe(false)
  await act(async () => {
    expect(registry.completeEnter(id, reopened.generation)).toBe(true)
  })
  expect(screen.getByTestId('retained-content')).toBeTruthy()
})

it('reclaims an automatically removed ID and creates a fresh Entry on the next show', async () => {
  const registryStore: RegistryStore = { current: null }

  function Harness() {
    const [visible, setVisible] = useState(true)
    return (
      <>
        <Pressable testID="hide-then-complete" onPress={() => setVisible(false)}>
          <Text>Hide</Text>
        </Pressable>
        <Pressable testID="show-again" onPress={() => setVisible(true)}>
          <Text>Show</Text>
        </Pressable>
        <OverlayPortal backBehavior="consume" visible={visible}>
          <Text>Portal content</Text>
        </OverlayPortal>
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )

  const registry = requireRegistry(registryStore)
  const firstId = registry.getSnapshot()[0].id
  await fireEvent.press(screen.getByTestId('hide-then-complete'))
  const exit = registry.getSnapshot()[0]
  expect(exit.phase).toBe('exiting')
  await act(async () => {
    expect(registry.completeExit(firstId, exit.generation)).toBe(true)
  })
  expect(registry.getSnapshot()).toHaveLength(0)

  await fireEvent.press(screen.getByTestId('show-again'))
  expect(registry.getSnapshot()).toHaveLength(1)
  expect(registry.getSnapshot()[0].id).not.toBe(firstId)
  expect(screen.getByText('Portal content')).toBeTruthy()
})

it('routes dismiss Back through the controlled owner callback', async () => {
  const registryStore: RegistryStore = { current: null }
  const onClose = jest.fn()

  function Harness() {
    const [visible, setVisible] = useState(true)
    return (
      <>
        <Pressable testID="close-state" onPress={() => setVisible(false)}>
          <Text>Close</Text>
        </Pressable>
        <OverlayPortal
          backBehavior="dismiss"
          onBack={() => {
            onClose()
            setVisible(false)
          }}
          visible={visible}
        >
          <Text>Dismissible content</Text>
        </OverlayPortal>
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )

  const registry = requireRegistry(registryStore)
  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(registry.getSnapshot()[0].phase).toBe('exiting')
})

it('bridges Theme and explicit business Context updates without replacing Entries', async () => {
  const registryStore: RegistryStore = { current: null }
  const BusinessContext = createContext('outside')

  function BusinessContent() {
    const contextValue = useContext(BusinessContext)
    const theme = useTsukiTheme()
    return (
      <Text testID="business-context-theme">
        {contextValue}|{theme.scheme}|{theme.semantic.colorPrimary}
      </Text>
    )
  }

  function ContextBridgePortal({ visible }: { visible: boolean }) {
    const contextValue = useContext(BusinessContext)
    return (
      <OverlayPortal backBehavior="consume" visible={visible}>
        <BusinessContext.Provider value={contextValue}>
          <BusinessContent />
        </BusinessContext.Provider>
      </OverlayPortal>
    )
  }

  function NestedDarkTheme() {
    const theme = useTsukiTheme()
    return (
      <Text testID="nested-theme">
        {theme.scheme}|{theme.semantic.colorPrimary}
      </Text>
    )
  }

  function Harness() {
    const [scheme, setScheme] = useState<'light' | 'dark'>('light')
    const [primary, setPrimary] = useState('#2563eb')
    const [contextValue, setContextValue] = useState('Dialog state A')
    return (
      <TsukiProvider scheme={scheme}>
        <Pressable testID="change-root-theme" onPress={() => setScheme('dark')}>
          <Text>Change root theme</Text>
        </Pressable>
        <Pressable testID="change-config-theme" onPress={() => setPrimary('#e11d48')}>
          <Text>Change config theme</Text>
        </Pressable>
        <Pressable
          testID="change-business-context"
          onPress={() => setContextValue('Dialog state B')}
        >
          <Text>Change business context</Text>
        </Pressable>
        <ConfigProvider theme={{ semantic: { colorPrimary: primary } }}>
          <BusinessContext.Provider value={contextValue}>
            <ContextBridgePortal visible />
          </BusinessContext.Provider>
        </ConfigProvider>
        <TsukiProvider scheme="dark">
          <OverlayPortal backBehavior="consume" visible>
            <NestedDarkTheme />
          </OverlayPortal>
        </TsukiProvider>
        <RegistryCapture store={registryStore} />
      </TsukiProvider>
    )
  }

  await render(<Harness />)
  const registry = requireRegistry(registryStore)
  expect(registry.getSnapshot()).toHaveLength(2)
  const ids = registry.getSnapshot().map((entry) => entry.id)
  const generation = registry.getSnapshot()[0].generation
  expect(screen.getByTestId('business-context-theme').props.children).toEqual([
    'Dialog state A',
    '|',
    'light',
    '|',
    '#2563eb',
  ])
  expect(screen.getByTestId('nested-theme').props.children).toEqual(['dark', '|', '#4D8DFF'])

  await fireEvent.press(screen.getByTestId('change-business-context'))
  await fireEvent.press(screen.getByTestId('change-config-theme'))
  await fireEvent.press(screen.getByTestId('change-root-theme'))

  expect(screen.getByTestId('business-context-theme').props.children).toEqual([
    'Dialog state B',
    '|',
    'dark',
    '|',
    '#e11d48',
  ])
  expect(screen.getByTestId('nested-theme').props.children).toEqual(['dark', '|', '#4D8DFF'])
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual(ids)
  expect(registry.getSnapshot()[0].generation).toBe(generation)
})

it('keeps parallel Portals and their child state independent when a middle Entry exits', async () => {
  const registryStore: RegistryStore = { current: null }

  function Counter({ id }: { id: number }) {
    const [count, setCount] = useState(0)
    return (
      <Pressable testID={`portal-counter-${id}`} onPress={() => setCount((value) => value + 1)}>
        <Text testID={`portal-counter-value-${id}`}>{count}</Text>
      </Pressable>
    )
  }

  function Harness() {
    const [visible, setVisible] = useState([true, true, true])
    return (
      <>
        <Pressable testID="hide-middle-portal" onPress={() => setVisible([true, false, true])}>
          <Text>Hide middle</Text>
        </Pressable>
        {visible.map((isVisible, index) => (
          <OverlayPortal key={index} backBehavior="consume" visible={isVisible}>
            <Counter id={index + 1} />
          </OverlayPortal>
        ))}
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )
  const registry = requireRegistry(registryStore)
  const [firstId, middleId, thirdId] = registry.getSnapshot().map((entry) => entry.id)

  await fireEvent.press(screen.getByTestId('portal-counter-3'))
  expect(screen.getByTestId('portal-counter-value-3').props.children).toBe(1)
  await fireEvent.press(screen.getByTestId('hide-middle-portal'))
  const middle = registry.getSnapshot().find((entry) => entry.id === middleId)
  expect(middle?.phase).toBe('exiting')
  await act(async () => {
    expect(registry.completeExit(middleId, middle!.generation)).toBe(true)
  })

  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([firstId, thirdId])
  expect(screen.getByTestId('portal-counter-value-3').props.children).toBe(1)
})

it('replays StrictMode effects without duplicating Entries and cleans up a truly unmounted owner', async () => {
  const registryStore: RegistryStore = { current: null }

  function Harness() {
    const [mounted, setMounted] = useState(true)
    return (
      <>
        <Pressable testID="unmount-portal-owner" onPress={() => setMounted(false)}>
          <Text>Unmount owner</Text>
        </Pressable>
        {mounted ? (
          <StrictMode>
            <OverlayPortal backBehavior="consume" visible>
              <Text>Strict portal content</Text>
            </OverlayPortal>
          </StrictMode>
        ) : null}
      </>
    )
  }

  await renderRoot(
    <>
      <Harness />
      <RegistryCapture store={registryStore} />
    </>,
  )
  const registry = requireRegistry(registryStore)
  await act(async () => {
    await Promise.resolve()
  })
  expect(registry.getSnapshot()).toHaveLength(1)

  await fireEvent.press(screen.getByTestId('unmount-portal-owner'))
  await act(async () => {
    await Promise.resolve()
  })
  expect(registry.getSnapshot()).toEqual([])
})

it('fails clearly when mounted without a Root TsukiProvider', async () => {
  const logError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  await render(
    <OverlayErrorBoundary>
      <OverlayPortal backBehavior="consume" visible>
        <Text>Detached</Text>
      </OverlayPortal>
    </OverlayErrorBoundary>,
  )
  expect(screen.getByTestId('overlay-portal-context-error').props.children).toBe(
    'OverlayPortal must be used inside a root TsukiProvider.',
  )
  logError.mockRestore()
})

class OverlayErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  render() {
    return this.state.message ? (
      <Text testID="overlay-portal-context-error">{this.state.message}</Text>
    ) : (
      this.props.children
    )
  }
}

interface RegistryStore {
  current: OverlayRegistry | null
}

function RegistryCapture({ store }: { store: RegistryStore }) {
  const { registry } = useOverlayRuntime()
  store.current = registry
  return null
}

function renderRoot(children: ReactNode) {
  return render(
    <TsukiProvider
      scheme="light"
      theme={{ motion: { enabled: true, reducedMotion: 'always', durationScale: 1 } }}
    >
      {children}
      <RegistryDebug />
    </TsukiProvider>,
  )
}

function RegistryDebug() {
  const { entries } = useOverlayRuntime()
  return (
    <>
      <Text testID="registry-count">{entries.length}</Text>
      <Text testID="registry-phases">{entries.map((entry) => entry.phase).join(',')}</Text>
    </>
  )
}

function requireRegistry(store: RegistryStore) {
  if (!store.current) throw new Error('The test did not capture its Root OverlayRegistry.')
  return store.current
}
