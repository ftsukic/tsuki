/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { Component, StrictMode, useState } from 'react'
import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { ConfigProvider, TsukiProvider, useTsukiTheme } from '..'
import { OverlayPortal } from '../overlay/overlay-portal'
import type { OverlayController, OverlayHandle } from '../overlay/controller'
import { useOverlayController } from '../overlay/useOverlayController'
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

it('opens beside a declarative Portal and preserves ID, order, and exit lifecycle on update/close', async () => {
  const store: ControllerStore = {}

  await render(
    <TsukiProvider scheme="light">
      <OverlayPortal backBehavior="consume" visible>
        <Text testID="declarative-entry">Declarative entry</Text>
      </OverlayPortal>
      <ControllerCapture store={store} />
    </TsukiProvider>,
  )

  const { controller, registry } = requireController(store)
  const declarativeId = registry.getSnapshot()[0].id
  let handle!: OverlayHandle
  await act(async () => {
    handle = controller.open({
      content: <StatefulImperativeContent revision="v1" />,
      backBehavior: 'consume',
    })
  })
  const initial = registry.getSnapshot().find((entry) => entry.id === handle.id)
  expect(initial).toMatchObject({ phase: 'entering', visible: true })
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([declarativeId, handle.id])

  await fireEvent.press(screen.getByTestId('imperative-content-counter'))
  expect(screen.getByTestId('imperative-content-value').props.children).toEqual([
    'v1',
    ' count ',
    1,
  ])
  await act(async () => {
    expect(handle.update({ content: <StatefulImperativeContent revision="v2" /> })).toBe(true)
  })
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([declarativeId, handle.id])
  expect(screen.getByTestId('imperative-content-value').props.children).toEqual([
    'v2',
    ' count ',
    1,
  ])

  const enteringGeneration = registry.getSnapshot()[1].generation
  await act(async () => {
    expect(handle.close()).toBe(true)
    expect(handle.close()).toBe(false)
  })
  const exiting = registry.getSnapshot()[1]
  expect(exiting).toMatchObject({ id: handle.id, phase: 'exiting', visible: false })
  expect(exiting.generation).toBeGreaterThan(enteringGeneration)
  expect(registry.completeEnter(handle.id, enteringGeneration)).toBe(false)

  const exitGeneration = exiting.generation
  await act(async () => {
    expect(handle.update({ content: <StatefulImperativeContent revision="v3" /> })).toBe(true)
  })
  expect(registry.getSnapshot()[1]).toMatchObject({ id: handle.id, phase: 'exiting' })
  expect(registry.getSnapshot()[1].generation).toBe(exitGeneration)
  expect(screen.getByTestId('imperative-content-value').props.children).toEqual([
    'v3',
    ' count ',
    1,
  ])

  await act(async () => {
    expect(registry.completeExit(handle.id, exitGeneration)).toBe(true)
  })
  expect(handle.update({ content: <Text>Stale</Text> })).toBe(false)
  expect(handle.close()).toBe(false)
  expect(registry.completeExit(handle.id, exitGeneration)).toBe(false)
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([declarativeId])

  let replacement!: OverlayHandle
  await act(async () => {
    replacement = controller.open({ content: <Text>New entry</Text>, backBehavior: 'consume' })
  })
  expect(replacement.id).not.toBe(handle.id)
  expect(handle.update({ content: <Text>Must stay stale</Text> })).toBe(false)
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([declarativeId, replacement.id])
})

it('captures nested Theme for tree calls and the latest Root Theme for explicit root controllers', async () => {
  const store: ThemeControllerStore = {}

  function ThemeHarness() {
    const [scheme, setScheme] = useState<'light' | 'dark'>('light')
    const [primary, setPrimary] = useState('#e11d48')
    return (
      <TsukiProvider scheme={scheme}>
        <Pressable testID="controller-change-root-theme" onPress={() => setScheme('dark')}>
          <Text>Dark root</Text>
        </Pressable>
        <Pressable testID="controller-change-nested-theme" onPress={() => setPrimary('#16a34a')}>
          <Text>Green nested</Text>
        </Pressable>
        <ConfigProvider theme={{ semantic: { colorPrimary: primary } }}>
          <ThemeControllerCapture store={store} />
        </ConfigProvider>
      </TsukiProvider>
    )
  }

  await render(<ThemeHarness />)
  const { currentController, rootController, registry } = requireThemeControllers(store)
  let currentHandle!: OverlayHandle
  let rootHandle!: OverlayHandle
  await act(async () => {
    currentHandle = currentController.open({
      content: <ThemeLabel testID="current-controller-theme" />,
      backBehavior: 'consume',
    })
    rootHandle = rootController.open({
      content: <ThemeLabel testID="root-controller-theme" />,
      backBehavior: 'consume',
    })
  })

  expect(
    registry.getSnapshot().find((entry) => entry.id === currentHandle.id)?.theme,
  ).toMatchObject({
    scheme: 'light',
    semantic: { colorPrimary: '#e11d48' },
  })
  expect(registry.getSnapshot().find((entry) => entry.id === rootHandle.id)?.theme).toMatchObject({
    scheme: 'light',
    semantic: { colorPrimary: '#055FFD' },
  })

  await fireEvent.press(screen.getByTestId('controller-change-nested-theme'))
  expect(screen.getByTestId('current-controller-theme').props.children).toEqual([
    'light',
    ' | ',
    '#16a34a',
  ])
  expect(screen.getByTestId('root-controller-theme').props.children).toEqual([
    'light',
    ' | ',
    '#055FFD',
  ])

  await fireEvent.press(screen.getByTestId('controller-change-root-theme'))
  expect(screen.getByTestId('current-controller-theme').props.children).toEqual([
    'dark',
    ' | ',
    '#16a34a',
  ])
  expect(screen.getByTestId('root-controller-theme').props.children).toEqual([
    'dark',
    ' | ',
    '#4D8DFF',
  ])
})

it('isolates controllers across Roots and expires old handles when their Root is disposed', async () => {
  const left: ControllerStore = {}
  const right: ControllerStore = {}

  function Harness() {
    const [showLeft, setShowLeft] = useState(true)
    return (
      <>
        <Pressable testID="controller-dispose-left-root" onPress={() => setShowLeft(false)}>
          <Text>Dispose left</Text>
        </Pressable>
        {showLeft ? (
          <TsukiProvider scheme="light">
            <ControllerCapture store={left} />
          </TsukiProvider>
        ) : null}
        <TsukiProvider scheme="dark">
          <ControllerCapture store={right} />
        </TsukiProvider>
      </>
    )
  }

  await render(<Harness />)
  const leftController = requireController(left)
  const rightController = requireController(right)
  let leftHandle!: OverlayHandle
  let rightHandle!: OverlayHandle
  await act(async () => {
    leftHandle = leftController.controller.open({
      content: <Text testID="left-root-content">Left v1</Text>,
      backBehavior: 'consume',
    })
    rightHandle = rightController.controller.open({
      content: <Text testID="right-root-content">Right v1</Text>,
      backBehavior: 'consume',
    })
  })
  expect(leftHandle.id).toBe(rightHandle.id)

  await act(async () => {
    expect(leftHandle.update({ content: <Text testID="left-root-content">Left v2</Text> })).toBe(
      true,
    )
  })
  expect(screen.getByTestId('left-root-content').props.children).toBe('Left v2')
  expect(screen.getByTestId('right-root-content').props.children).toBe('Right v1')

  await fireEvent.press(screen.getByTestId('controller-dispose-left-root'))
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

  expect(leftController.registry.getSnapshot()).toEqual([])
  expect(leftHandle.update({ content: <Text>Stale left</Text> })).toBe(false)
  expect(leftHandle.close()).toBe(false)
  await act(async () => {
    expect(rightHandle.update({ content: <Text testID="right-root-content">Right v2</Text> })).toBe(
      true,
    )
  })
  expect(screen.getByTestId('right-root-content').props.children).toBe('Right v2')
  expect(rightController.registry.getSnapshot()).toHaveLength(1)
})

it('orders multiple handles, lets only the top Entry respond to Back, and removes a middle Entry', async () => {
  const store: ControllerStore = {}
  const backCallbacks = [jest.fn(), jest.fn(), jest.fn()]

  await render(
    <TsukiProvider scheme="light">
      <ControllerCapture store={store} />
    </TsukiProvider>,
  )

  const { controller, registry } = requireController(store)
  const handles: OverlayHandle[] = []
  await act(async () => {
    backCallbacks.forEach((onBack, index) => {
      const handle = controller.open({
        content: <Text testID={`ordered-controller-${index + 1}`}>Layer {index + 1}</Text>,
        backBehavior: 'dismiss',
        onBack: () => {
          onBack()
          handle.close()
        },
      })
      handles.push(handle)
    })
  })

  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual(handles.map(({ id }) => id))
  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(backCallbacks[2]).toHaveBeenCalledTimes(1)
  expect(backCallbacks[0]).not.toHaveBeenCalled()
  expect(backCallbacks[1]).not.toHaveBeenCalled()
  expect(registry.getSnapshot().at(-1)).toMatchObject({ id: handles[2].id, phase: 'exiting' })

  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(backCallbacks[2]).toHaveBeenCalledTimes(1)
  expect(registry.getSnapshot()[0].phase).toBe('entering')

  const middle = registry.getSnapshot()[1]
  await act(async () => {
    expect(handles[1].close()).toBe(true)
  })
  const middleExit = registry.getSnapshot().find((entry) => entry.id === middle.id)!
  await act(async () => {
    expect(registry.completeExit(middleExit.id, middleExit.generation)).toBe(true)
  })
  expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([handles[0].id, handles[2].id])
  expect(handles[1].update({ content: <Text>Stale middle</Text> })).toBe(false)
})

it('uses StrictMode-safe ownership cleanup and invalidates commands after the hook owner unmounts', async () => {
  const store: ControllerStore = {}

  function Harness() {
    const [mounted, setMounted] = useState(true)
    return (
      <>
        <Pressable testID="controller-unmount-owner" onPress={() => setMounted(false)}>
          <Text>Unmount owner</Text>
        </Pressable>
        {mounted ? (
          <StrictMode>
            <ControllerCapture store={store} />
          </StrictMode>
        ) : null}
      </>
    )
  }

  await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )

  const { controller, registry } = requireController(store)
  let handle!: OverlayHandle
  await act(async () => {
    handle = controller.open({
      content: <Text testID="strict-controller-content">Strict controller content</Text>,
      backBehavior: 'consume',
    })
  })
  expect(registry.getSnapshot()).toHaveLength(1)

  await fireEvent.press(screen.getByTestId('controller-unmount-owner'))
  await act(async () => {
    await Promise.resolve()
  })

  const exiting = registry.getSnapshot()[0]
  expect(exiting).toMatchObject({ id: handle.id, phase: 'exiting', visible: false })
  expect(handle.update({ content: <Text>Too late</Text> })).toBe(false)
  expect(handle.close()).toBe(false)
  expect(() =>
    controller.open({ content: <Text>Too late</Text>, backBehavior: 'consume' }),
  ).toThrow('Cannot open an Overlay entry from an unmounted useOverlayController owner.')

  await act(async () => {
    expect(registry.completeExit(handle.id, exiting.generation)).toBe(true)
  })
  expect(registry.getSnapshot()).toEqual([])
})

it('fails clearly when there is no Root binding', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  await render(
    <ControllerErrorBoundary>
      <ControllerCapture store={{}} />
    </ControllerErrorBoundary>,
  )

  expect(screen.getByTestId('controller-context-error').props.children).toBe(
    'useOverlayController must be used inside a root TsukiProvider.',
  )
  error.mockRestore()
})

function ControllerCapture({
  store,
  scope,
}: {
  store: ControllerStore
  scope?: 'current' | 'root'
}) {
  store.controller = useOverlayController(scope)
  store.registry = useOverlayRuntime().registry
  return null
}

function ThemeControllerCapture({ store }: { store: ThemeControllerStore }) {
  store.currentController = useOverlayController()
  store.rootController = useOverlayController('root')
  store.registry = useOverlayRuntime().registry
  return null
}

function ThemeLabel({ testID }: { testID: string }) {
  const theme = useTsukiTheme()
  return (
    <Text testID={testID}>
      {theme.scheme} | {theme.semantic.colorPrimary}
    </Text>
  )
}

function StatefulImperativeContent({ revision }: { revision: string }) {
  const [count, setCount] = useState(0)
  return (
    <Pressable testID="imperative-content-counter" onPress={() => setCount((value) => value + 1)}>
      <Text testID="imperative-content-value">
        {revision} count {count}
      </Text>
    </Pressable>
  )
}

interface ControllerStore {
  controller?: OverlayController
  registry?: OverlayRegistry
}

interface ThemeControllerStore {
  currentController?: OverlayController
  rootController?: OverlayController
  registry?: OverlayRegistry
}

class ControllerErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  render() {
    return this.state.message ? (
      <Text testID="controller-context-error">{this.state.message}</Text>
    ) : (
      this.props.children
    )
  }
}

function requireController(store: ControllerStore) {
  if (!store.controller || !store.registry) {
    throw new Error('The test did not capture a Root OverlayController and Registry.')
  }
  return { controller: store.controller, registry: store.registry }
}

function requireThemeControllers(store: ThemeControllerStore) {
  if (!store.currentController || !store.rootController || !store.registry) {
    throw new Error('The test did not capture current and Root OverlayControllers.')
  }
  return {
    currentController: store.currentController,
    rootController: store.rootController,
    registry: store.registry,
  }
}
