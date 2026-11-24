/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { StrictMode, useRef, useState } from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react-native'
import { BackHandler, Platform, Pressable, Text } from 'react-native'
import { ConfigProvider, TsukiProvider, useTsukiTheme } from '..'
import { subscribeToOverlayBack } from '../overlay/back-adapter'
import { createOverlayRegistry } from '../overlay/registry'
import { useOverlayRuntime } from '../overlay/use-overlay-runtime'
import type { OverlayRegistry } from '../overlay/types'
import { getDefaultTheme } from '../theme/defaults'

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

function addEntry(
  registry: OverlayRegistry,
  options: {
    label?: string
    backBehavior?: 'dismiss' | 'consume' | 'passthrough'
    onBack?: () => void
  } = {},
) {
  return registry.mount({
    content: options.label ?? 'entry',
    backBehavior: options.backBehavior ?? 'consume',
    onBack: options.onBack,
    theme: getDefaultTheme('light'),
    themeScope: {},
  })
}

describe('OverlayRegistry', () => {
  it('preserves mount order when entries are updated', () => {
    const registry = createOverlayRegistry()
    const first = addEntry(registry, { label: 'first' })
    const second = addEntry(registry, { label: 'second' })
    const third = addEntry(registry, { label: 'third' })

    expect(registry.update(second, { content: 'updated second' })).toBe(true)
    expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([first, second, third])
    expect(registry.getSnapshot().map((entry) => entry.content)).toEqual([
      'first',
      'updated second',
      'third',
    ])
  })

  it('removes entries idempotently and releases the stored callback', () => {
    const registry = createOverlayRegistry()
    const onBack = jest.fn()
    const id = addEntry(registry, { backBehavior: 'dismiss', onBack })
    const before = registry.getSnapshot()

    expect(registry.unmount(id)).toBe(true)
    expect(registry.unmount(id)).toBe(false)
    expect(registry.getSnapshot()).not.toBe(before)
    expect(registry.getSnapshot()).toEqual([])
    expect(registry.dispatchBack()).toBe(false)
    expect(onBack).not.toHaveBeenCalled()
  })

  it('coordinates entry phases and rejects stale exit completions after reopening', () => {
    const registry = createOverlayRegistry()
    const id = addEntry(registry)
    const mounted = registry.getSnapshot()[0]

    expect(mounted).toMatchObject({ phase: 'entering', visible: true, generation: 1 })
    expect(registry.completeEnter(id, mounted.generation)).toBe(true)
    expect(registry.getSnapshot()[0].phase).toBe('entered')

    expect(registry.update(id, { visible: false })).toBe(true)
    const exiting = registry.getSnapshot()[0]
    expect(exiting).toMatchObject({
      phase: 'exiting',
      visible: false,
      closing: true,
      generation: 2,
    })
    const exitingSnapshot = registry.getSnapshot()
    const listener = jest.fn()
    registry.subscribe(listener)
    expect(registry.update(id, { visible: false })).toBe(true)
    expect(registry.getSnapshot()).toBe(exitingSnapshot)
    expect(listener).not.toHaveBeenCalled()

    expect(registry.update(id, { visible: true })).toBe(true)
    const reopened = registry.getSnapshot()[0]
    expect(reopened).toMatchObject({ id, phase: 'entering', visible: true, generation: 3 })
    expect(registry.completeExit(id, exiting.generation)).toBe(false)
    expect(registry.completeEnter(id, exiting.generation)).toBe(false)
    expect(registry.completeEnter(id, reopened.generation)).toBe(true)

    expect(registry.update(id, { visible: false })).toBe(true)
    const finalExit = registry.getSnapshot()[0]
    expect(registry.completeExit(id, finalExit.generation - 1)).toBe(false)
    expect(registry.getSnapshot()).toHaveLength(1)
    expect(registry.completeExit(id, finalExit.generation)).toBe(true)
    expect(registry.getSnapshot()).toEqual([])
  })

  it('does not publish an update when the entry values are unchanged', () => {
    const registry = createOverlayRegistry()
    const id = addEntry(registry)
    const listener = jest.fn()
    registry.subscribe(listener)
    const snapshot = registry.getSnapshot()

    expect(registry.update(id, { visible: true })).toBe(true)
    expect(registry.getSnapshot()).toBe(snapshot)
    expect(listener).not.toHaveBeenCalled()
  })

  it('routes Back to the owner without mutating phase first, and keeps an exiting entry as the Back target until exit completes', () => {
    const registry = createOverlayRegistry()
    const onEntered = jest.fn()
    const onExited = jest.fn()
    const onBack = jest.fn(() => {
      registry.update(id, { visible: false })
    })
    const id = registry.mount({
      content: 'overlay',
      backBehavior: 'dismiss',
      onBack,
      onEntered,
      onExited,
      theme: getDefaultTheme('light'),
      themeScope: {},
    })

    expect(registry.completeEnter(id, registry.getSnapshot()[0].generation)).toBe(true)
    expect(onEntered).toHaveBeenCalledTimes(1)

    expect(registry.dispatchBack()).toBe(true)
    const entry = registry.getSnapshot()[0]
    expect(entry).toMatchObject({ phase: 'exiting', closing: true })
    expect(registry.dispatchBack()).toBe(true)
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(registry.getSnapshot()).toHaveLength(1)
    expect(registry.completeExit(id, entry.generation)).toBe(true)
    expect(onExited).toHaveBeenCalledTimes(1)
    expect(registry.dispatchBack()).toBe(false)
  })

  it('keeps controlled entries open without exiting when onBack declines dismissal, and blocks Back while busy', () => {
    const registry = createOverlayRegistry()
    const declinedBack = jest.fn()
    const id = addEntry(registry, { backBehavior: 'dismiss', onBack: declinedBack })

    expect(registry.dispatchBack()).toBe(true)
    expect(declinedBack).toHaveBeenCalledTimes(1)
    expect(registry.getSnapshot()[0]).toMatchObject({ id, phase: 'entering', visible: true })

    expect(registry.update(id, { busy: true })).toBe(true)
    expect(registry.dispatchBack()).toBe(true)
    expect(declinedBack).toHaveBeenCalledTimes(1)
  })

  it('does not publish when a Theme scope receives equivalent resolved values', () => {
    const registry = createOverlayRegistry()
    const theme = getDefaultTheme('light')
    const themeScope = {}
    registry.mount({
      content: 'themed',
      backBehavior: 'consume',
      theme,
      themeScope,
    })
    const listener = jest.fn()
    registry.subscribe(listener)
    const snapshot = registry.getSnapshot()

    registry.updateThemeScope(themeScope, {
      ...theme,
      semantic: { ...theme.semantic },
      motion: { ...theme.motion },
      components: {
        Button: { ...theme.components.Button },
        Card: { ...theme.components.Card },
        Cell: { ...theme.components.Cell },
        Divider: { ...theme.components.Divider },
        Dialog: { ...theme.components.Dialog },
        Popup: { ...theme.components.Popup },
        Input: { ...theme.components.Input },
        Surface: { ...theme.components.Surface },
      },
    })

    expect(registry.getSnapshot()).toBe(snapshot)
    expect(listener).not.toHaveBeenCalled()
    registry.updateThemeScope(themeScope, {
      ...theme,
      semantic: { ...theme.semantic, colorPrimary: '#2563eb' },
    })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('queues entries before a Host registers and restores their original order', () => {
    const registry = createOverlayRegistry()
    const first = addEntry(registry, { label: 'first' })
    const second = addEntry(registry, { label: 'second' })
    const host = {}

    expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([first, second])
    const registration = registry.registerHost(host)
    expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([first, second])
    expect(registry.unregisterHost(registration)).toBe(true)
    expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([first, second])

    const restored = registry.registerHost(host)
    expect(registry.getSnapshot().map((entry) => entry.id)).toEqual([first, second])
    expect(registry.unregisterHost(restored)).toBe(true)
  })

  it('allows idempotent same-Host registration and protects a newer registration from stale cleanup', () => {
    const registry = createOverlayRegistry()
    const firstHost = {}
    const firstSetup = registry.registerHost(firstHost)
    const replaySetup = registry.registerHost(firstHost)

    expect(registry.unregisterHost(firstSetup)).toBe(false)
    expect(() => registry.registerHost({})).toThrow('only have one registered OverlayHost')
    expect(registry.unregisterHost(replaySetup)).toBe(true)

    const nextHost = {}
    const nextRegistration = registry.registerHost(nextHost)
    expect(registry.unregisterHost(replaySetup)).toBe(false)
    expect(() => registry.registerHost({})).toThrow('only have one registered OverlayHost')
    expect(registry.unregisterHost(nextRegistration)).toBe(true)
  })

  it('isolates entries, IDs, and Host ownership across Registries', () => {
    const first = createOverlayRegistry()
    const second = createOverlayRegistry()
    const firstId = addEntry(first, { label: 'first root' })
    const secondId = addEntry(second, { label: 'second root' })

    expect(firstId).toBe(1)
    expect(secondId).toBe(1)
    expect(first.getSnapshot().map((entry) => entry.content)).toEqual(['first root'])
    expect(second.getSnapshot().map((entry) => entry.content)).toEqual(['second root'])
    expect(() => first.registerHost({})).not.toThrow()
    expect(() => second.registerHost({})).not.toThrow()
  })

  it('dispatches dismiss to the top visible entry once and does not repeat while closing', () => {
    const registry = createOverlayRegistry()
    const lowerClose = jest.fn()
    const topClose = jest.fn(() => {
      registry.update(topId, { visible: false })
    })
    addEntry(registry, { backBehavior: 'dismiss', onBack: lowerClose })
    const topId = addEntry(registry, { backBehavior: 'dismiss', onBack: topClose })

    expect(registry.dispatchBack()).toBe(true)
    expect(topClose).toHaveBeenCalledTimes(1)
    expect(lowerClose).not.toHaveBeenCalled()
    expect(registry.getSnapshot().find((entry) => entry.id === topId)?.closing).toBe(true)
    expect(registry.dispatchBack()).toBe(true)
    expect(topClose).toHaveBeenCalledTimes(1)
    expect(lowerClose).not.toHaveBeenCalled()
  })

  it('consumes Back at the top entry without closing or scanning lower entries', () => {
    const registry = createOverlayRegistry()
    const lowerClose = jest.fn()
    addEntry(registry, { backBehavior: 'dismiss', onBack: lowerClose })
    const topId = addEntry(registry, { backBehavior: 'consume' })

    expect(registry.dispatchBack()).toBe(true)
    expect(lowerClose).not.toHaveBeenCalled()
    expect(registry.getSnapshot().some((entry) => entry.id === topId)).toBe(true)
  })

  it('passes Back through from the top entry without scanning lower entries', () => {
    const registry = createOverlayRegistry()
    const lowerClose = jest.fn()
    addEntry(registry, { backBehavior: 'dismiss', onBack: lowerClose })
    addEntry(registry, { backBehavior: 'passthrough' })

    expect(registry.dispatchBack()).toBe(false)
    expect(lowerClose).not.toHaveBeenCalled()
  })

  it('ignores hidden entries when choosing the Back target', () => {
    const registry = createOverlayRegistry()
    const hiddenClose = jest.fn()
    const visibleClose = jest.fn()
    registry.mount({
      content: 'hidden',
      backBehavior: 'dismiss',
      onBack: hiddenClose,
      visible: false,
      theme: getDefaultTheme('light'),
      themeScope: {},
    })
    addEntry(registry, { backBehavior: 'dismiss', onBack: visibleClose })

    expect(registry.dispatchBack()).toBe(true)
    expect(visibleClose).toHaveBeenCalledTimes(1)
    expect(hiddenClose).not.toHaveBeenCalled()
  })

  it('returns false with no visible entries and publishes Back results', () => {
    const registry = createOverlayRegistry()
    const listener = jest.fn()
    const unsubscribe = registry.subscribeBackResult(listener)

    expect(registry.dispatchBack()).toBe(false)
    expect(registry.getBackResultSnapshot()).toEqual({ count: 1, consumed: false })
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    expect(registry.dispatchBack()).toBe(false)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('Overlay Host and Providers', () => {
  it('renders one Host for the root Provider, reused by nested Providers and ConfigProvider', async () => {
    await render(
      <TsukiProvider scheme="light">
        <ConfigProvider theme={{ semantic: { colorPrimary: '#2563eb' } }}>
          <TsukiProvider scheme="dark">
            <Text>nested scope</Text>
          </TsukiProvider>
        </ConfigProvider>
      </TsukiProvider>,
    )

    expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
    expect(screen.getByText('nested scope')).toBeTruthy()
  })

  it('runs Mask and Content through Motion and waits for their Reduced Motion completions', async () => {
    function TransitionHarness() {
      const { entries, mount, update } = useOverlayRuntime()
      const idRef = useRef<number | null>(null)
      const current =
        idRef.current === null ? undefined : entries.find((entry) => entry.id === idRef.current)
      return (
        <>
          <Pressable
            testID="transition-open"
            onPress={() => {
              idRef.current = mount({
                content: <Text testID="transition-content">Content channel</Text>,
                mask: <Text testID="transition-mask">Mask channel</Text>,
                backBehavior: 'consume',
                transition: {
                  mask: { preset: 'fade', animation: { duration: 260 } },
                  content: { preset: 'scale-fade', animation: { type: 'spring' } },
                },
              })
            }}
          >
            <Text>Open</Text>
          </Pressable>
          <Pressable
            testID="transition-close"
            onPress={() => {
              if (idRef.current !== null) update(idRef.current, { visible: false })
            }}
          >
            <Text>Close</Text>
          </Pressable>
          <Text testID="transition-phase">{current?.phase ?? 'unmounted'}</Text>
        </>
      )
    }

    await render(
      <TsukiProvider
        scheme="light"
        theme={{ motion: { enabled: true, reducedMotion: 'always', durationScale: 1 } }}
      >
        <TransitionHarness />
      </TsukiProvider>,
    )

    await fireEvent.press(screen.getByTestId('transition-open'))
    expect(screen.getByTestId('transition-content')).toBeTruthy()
    expect(screen.getByTestId('transition-mask')).toBeTruthy()
    expect(screen.getByTestId('transition-phase').props.children).toBe('entered')
    await fireEvent.press(screen.getByTestId('transition-close'))
    expect(screen.queryByTestId('transition-content')).toBeNull()
    expect(screen.queryByTestId('transition-mask')).toBeNull()
    expect(screen.getByTestId('transition-phase').props.children).toBe('unmounted')
  })

  it('preserves an entry key and child state when a closing entry is reopened before the next render', async () => {
    function StatefulEntry() {
      const [count, setCount] = useState(0)
      return (
        <Pressable testID="stateful-entry-increment" onPress={() => setCount((value) => value + 1)}>
          <Text testID="stateful-entry-count">{count}</Text>
        </Pressable>
      )
    }

    function Harness() {
      const { entries, mount, update } = useOverlayRuntime()
      const idRef = useRef<number | null>(null)
      const current =
        idRef.current === null ? undefined : entries.find((entry) => entry.id === idRef.current)

      return (
        <>
          <Pressable
            testID="stateful-entry-open"
            onPress={() => {
              if (idRef.current === null) {
                idRef.current = mount({
                  content: <StatefulEntry />,
                  backBehavior: 'consume',
                  transition: { content: { preset: 'fade', animation: { duration: 0 } } },
                })
              }
            }}
          >
            <Text>Open</Text>
          </Pressable>
          <Pressable
            testID="stateful-entry-reopen"
            onPress={() => {
              if (idRef.current !== null) {
                update(idRef.current, { visible: false })
                update(idRef.current, { visible: true })
              }
            }}
          >
            <Text>Close then reopen</Text>
          </Pressable>
          <Text testID="stateful-entry-id">{current?.id ?? 'unmounted'}</Text>
          <Text testID="stateful-entry-generation">{current?.generation ?? '—'}</Text>
        </>
      )
    }

    await render(
      <TsukiProvider
        scheme="light"
        theme={{ motion: { enabled: true, reducedMotion: 'always', durationScale: 1 } }}
      >
        <Harness />
      </TsukiProvider>,
    )

    await fireEvent.press(screen.getByTestId('stateful-entry-open'))
    const id = screen.getByTestId('stateful-entry-id').props.children
    expect(screen.getByTestId('tsuki-overlay-layer-' + id)).toBeTruthy()
    await fireEvent.press(screen.getByTestId('stateful-entry-increment'))
    expect(screen.getByTestId('stateful-entry-count').props.children).toBe(1)

    await fireEvent.press(screen.getByTestId('stateful-entry-reopen'))
    expect(screen.getByTestId('stateful-entry-id').props.children).toBe(id)
    expect(screen.getByTestId('stateful-entry-generation').props.children).toBe(3)
    expect(screen.getByTestId('stateful-entry-count').props.children).toBe(1)
  })

  it('keeps current and root Theme scopes isolated and updates mounted entries after commit', async () => {
    function Harness() {
      const [scheme, setScheme] = useState<'light' | 'dark'>('light')
      const [primary, setPrimary] = useState('#2563eb')
      return (
        <TsukiProvider scheme={scheme} theme={{ semantic: { colorPrimary: '#2563eb' } }}>
          <Pressable testID="change-root-theme" onPress={() => setScheme('dark')}>
            <Text>change root</Text>
          </Pressable>
          <Pressable testID="change-config-theme" onPress={() => setPrimary('#e11d48')}>
            <Text>change config</Text>
          </Pressable>
          <ConfigProvider theme={{ semantic: { colorPrimary: primary } }}>
            <ConfigEntryTrigger />
          </ConfigProvider>
          <TsukiProvider scheme="dark">
            <NestedEntryTrigger />
          </TsukiProvider>
          <RootEntryTrigger />
        </TsukiProvider>
      )
    }

    await render(<Harness />)
    await fireEvent.press(screen.getByTestId('open-config-entry'))
    await fireEvent.press(screen.getByTestId('open-nested-entry'))
    await fireEvent.press(screen.getByTestId('open-root-entry'))
    expect(screen.getByTestId('entry-config').props.children).toBe('#2563eb')
    expect(screen.getByTestId('entry-nested').props.children).toBe('#4D8DFF')
    expect(screen.getByTestId('entry-root').props.children).toBe('#2563eb')
    expect(screen.getByTestId('entry-root-scheme').props.children).toBe('light')

    await fireEvent.press(screen.getByTestId('change-config-theme'))
    await fireEvent.press(screen.getByTestId('change-root-theme'))
    expect(screen.getByTestId('entry-config').props.children).toBe('#e11d48')
    expect(screen.getByTestId('entry-nested').props.children).toBe('#4D8DFF')
    expect(screen.getByTestId('entry-root').props.children).toBe('#2563eb')
    expect(screen.getByTestId('entry-root-scheme').props.children).toBe('dark')
  })

  it('keeps a mounted nested-scope entry on its last committed Theme after its caller unmounts', async () => {
    function Harness() {
      const [scheme, setScheme] = useState<'light' | 'dark'>('light')
      const [sourceMounted, setSourceMounted] = useState(true)
      return (
        <TsukiProvider scheme="light">
          <Pressable testID="change-nested-scheme" onPress={() => setScheme('dark')}>
            <Text>change nested</Text>
          </Pressable>
          <Pressable testID="unmount-source" onPress={() => setSourceMounted(false)}>
            <Text>unmount source</Text>
          </Pressable>
          {sourceMounted ? (
            <TsukiProvider scheme={scheme}>
              <NestedEntryTrigger />
            </TsukiProvider>
          ) : null}
        </TsukiProvider>
      )
    }

    await render(<Harness />)
    await fireEvent.press(screen.getByTestId('open-nested-entry'))
    await fireEvent.press(screen.getByTestId('change-nested-scheme'))
    expect(screen.getByTestId('entry-nested').props.children).toBe('#4D8DFF')
    await fireEvent.press(screen.getByTestId('unmount-source'))
    expect(screen.getByTestId('entry-nested').props.children).toBe('#4D8DFF')
    expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
  })

  it('disposes a Root Registry after its Provider unmounts', async () => {
    const registries: OverlayRegistry[] = []
    function Capture() {
      const { registry } = useOverlayRuntime()
      registries.push(registry)
      return null
    }

    const { container: firstContainer, unmount: unmountFirst } = await render(
      <TsukiProvider scheme="light">
        <Capture />
      </TsukiProvider>,
    )
    const firstRegistry = registries.at(-1)!
    const { container: secondContainer, unmount: unmountSecond } = await render(
      <TsukiProvider scheme="dark">
        <Capture />
      </TsukiProvider>,
    )
    const secondRegistry = registries.at(-1)!
    expect(firstRegistry).not.toBe(secondRegistry)
    expect(within(firstContainer).getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
    expect(within(secondContainer).getAllByTestId('tsuki-overlay-host')).toHaveLength(1)

    await unmountFirst()
    await Promise.resolve()
    expect(firstRegistry.getSnapshot()).toEqual([])
    expect(() => firstRegistry.registerHost({})).toThrow('Root has been disposed')
    await unmountSecond()
    await Promise.resolve()
    expect(secondRegistry.getSnapshot()).toEqual([])
    expect(() => secondRegistry.registerHost({})).toThrow('Root has been disposed')
  })

  it('releases and restores the single platform Back listener with Host registration', async () => {
    let activeSubscriptions = 0
    const remove = jest.fn(() => {
      activeSubscriptions -= 1
    })
    const add = jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => {
      activeSubscriptions += 1
      return { remove } as ReturnType<typeof BackHandler.addEventListener>
    })
    const platform = mockPlatform('android')
    function ToggleHost() {
      const { hostEnabled, setHostEnabled } = useOverlayRuntime()
      return (
        <Pressable testID="toggle-root-host" onPress={() => setHostEnabled(!hostEnabled)}>
          <Text>toggle host</Text>
        </Pressable>
      )
    }
    try {
      const view = await render(
        <TsukiProvider scheme="light">
          <ToggleHost />
        </TsukiProvider>,
      )
      expect(activeSubscriptions).toBe(1)
      await fireEvent.press(screen.getByTestId('toggle-root-host'))
      expect(activeSubscriptions).toBe(0)
      expect(screen.queryByTestId('tsuki-overlay-host')).toBeNull()
      await fireEvent.press(screen.getByTestId('toggle-root-host'))
      expect(activeSubscriptions).toBe(1)
      expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
      expect(add).toHaveBeenCalledTimes(2)
      await view.unmount()
      expect(activeSubscriptions).toBe(0)
      expect(remove).toHaveBeenCalledTimes(2)
    } finally {
      platform.restore()
    }
  })

  it('survives StrictMode effect replay with a single active Host registration', async () => {
    let activeSubscriptions = 0
    const remove = jest.fn(() => {
      activeSubscriptions -= 1
    })
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_eventName, _handler) => {
      activeSubscriptions += 1
      return { remove } as ReturnType<typeof BackHandler.addEventListener>
    })
    const platform = mockPlatform('android')
    let strictRegistry: OverlayRegistry | null = null
    function CaptureRegistry() {
      strictRegistry = useOverlayRuntime().registry
      return null
    }
    try {
      const view = await render(
        <StrictMode>
          <TsukiProvider scheme="light">
            <Text>Strict root</Text>
            <CaptureRegistry />
          </TsukiProvider>
        </StrictMode>,
      )
      expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
      expect(activeSubscriptions).toBe(1)
      const registry = strictRegistry!
      let id = 0
      await act(() => {
        id = registry.mount({
          content: <Text>Strict entry</Text>,
          backBehavior: 'consume',
          theme: getDefaultTheme('light'),
          themeScope: {},
        })
      })
      expect(registry.getSnapshot().find((entry) => entry.id === id)?.phase).toBe('entering')
      await view.unmount()
      await Promise.resolve()
      expect(activeSubscriptions).toBe(0)
      expect(remove).toHaveBeenCalled()
      expect(registry.getSnapshot()).toEqual([])
    } finally {
      platform.restore()
    }
  })
})

describe('Overlay Back adapter', () => {
  it('uses BackHandler on Android and Harmony and does not register on iOS', () => {
    const handler = jest.fn(() => true)
    const remove = jest.fn()
    const add = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockReturnValue({ remove } as ReturnType<typeof BackHandler.addEventListener>)

    for (const platformName of ['android', 'harmony']) {
      const platform = mockPlatform(platformName)
      const unsubscribe = subscribeToOverlayBack(handler)
      expect(add).toHaveBeenLastCalledWith('hardwareBackPress', handler)
      unsubscribe()
      unsubscribe()
      platform.restore()
    }

    const platform = mockPlatform('ios')
    const unsubscribe = subscribeToOverlayBack(handler)
    expect(add).toHaveBeenCalledTimes(2)
    unsubscribe()
    expect(remove).toHaveBeenCalledTimes(2)
    platform.restore()
  })
})

function ConfigEntryTrigger() {
  const runtime = useOverlayRuntime()
  return (
    <Pressable
      testID="open-config-entry"
      onPress={() =>
        runtime.mount({ content: <ThemeValue testID="entry-config" />, backBehavior: 'consume' })
      }
    >
      <Text>open config entry</Text>
    </Pressable>
  )
}

function NestedEntryTrigger() {
  const runtime = useOverlayRuntime()
  return (
    <Pressable
      testID="open-nested-entry"
      onPress={() =>
        runtime.mount({ content: <ThemeValue testID="entry-nested" />, backBehavior: 'consume' })
      }
    >
      <Text>open nested entry</Text>
    </Pressable>
  )
}

function RootEntryTrigger() {
  const runtime = useOverlayRuntime('root')
  return (
    <Pressable
      testID="open-root-entry"
      onPress={() =>
        runtime.mount({ content: <ThemeValue testID="entry-root" />, backBehavior: 'consume' })
      }
    >
      <Text>open root entry</Text>
    </Pressable>
  )
}

function ThemeValue({ testID }: { testID: string }) {
  const theme = useTsukiTheme()
  return (
    <>
      <Text testID={testID}>{theme.semantic.colorPrimary}</Text>
      <Text testID={testID + '-scheme'}>{theme.scheme}</Text>
    </>
  )
}

function mockPlatform(platformName: string) {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')
  Object.defineProperty(Platform, 'OS', { configurable: true, value: platformName })
  return {
    restore() {
      if (descriptor) Object.defineProperty(Platform, 'OS', descriptor)
      else Reflect.deleteProperty(Platform, 'OS')
    },
  }
}
