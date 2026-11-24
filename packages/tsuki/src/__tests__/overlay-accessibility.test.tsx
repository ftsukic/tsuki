/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { AccessibilityInfo, Pressable, Text, View } from 'react-native'
import { TsukiProvider } from '..'
import { OverlayPortal } from '../overlay/overlay-portal'
import { useOverlayController } from '../overlay/useOverlayController'
import { useOverlayRuntime } from '../overlay/use-overlay-runtime'
import type { OverlayRegistry } from '../overlay/types'

jest.mock('../overlay/transition', () => {
  return {
    OverlayEntryTransition: ({ entry }: { entry: { content: ReactNode } }) => entry.content,
  }
})

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

it('defaults to non-modal and changes accessibility config without replacing the Portal Entry', async () => {
  const store: RegistryStore = {}

  function Harness() {
    const [mode, setMode] = useState<'modal' | 'non-modal'>('non-modal')
    return (
      <>
        <RegistryCapture store={store} />
        <Pressable testID="toggle-modal-mode" onPress={() => setMode('modal')}>
          <Text>Modal</Text>
        </Pressable>
        <OverlayPortal accessibility={{ mode }} backBehavior="consume" visible>
          <Text>Portal content</Text>
        </OverlayPortal>
      </>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )

  const registry = requireRegistry(store)
  const firstId = registry.getSnapshot()[0].id
  expect(registry.getSnapshot()[0].accessibility.mode).toBe('non-modal')
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('auto')

  await fireEvent.press(screen.getByTestId('toggle-modal-mode'))
  expect(registry.getSnapshot()).toHaveLength(1)
  expect(registry.getSnapshot()[0]).toMatchObject({ id: firstId, accessibility: { mode: 'modal' } })
  expect(testNodeProps(view, `tsuki-overlay-layer-${firstId}`).accessible).toBe(false)
  expect(testNodeProps(view, `tsuki-overlay-layer-${firstId}`).importantForAccessibility).toBe(
    'auto',
  )
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('no-hide-descendants')
})

it('keeps page and exiting modal isolated until the matching transition completes, then restores focus', async () => {
  const sendFocus = mockScreenReader(true)
  const store: RegistryStore = {}

  function Harness() {
    const { mount, registry } = useOverlayRuntime()
    const triggerRef = useRef<View>(null)
    const initialRef = useRef<View>(null)
    store.registry = registry
    store.initialRef = initialRef
    store.triggerRef = triggerRef

    return (
      <>
        <Pressable ref={triggerRef} testID="focus-return-trigger">
          <Text>Open overlay</Text>
        </Pressable>
        <Pressable
          testID="focus-open-modal"
          onPress={() =>
            mount({
              accessibility: {
                mode: 'modal',
                initialFocusRef: initialRef,
                returnFocusRef: triggerRef,
              },
              backBehavior: 'consume',
              content: (
                <Pressable ref={initialRef} testID="focus-initial-target">
                  <Text>Initial target</Text>
                </Pressable>
              ),
            })
          }
        >
          <Text>Open modal</Text>
        </Pressable>
      </>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByTestId('focus-open-modal'))
  await resolveAccessibilityState()

  const registry = requireRegistry(store)
  const entry = registry.getSnapshot()[0]
  expect(sendFocus).not.toHaveBeenCalled()
  await markLayerReady(view, entry.id)
  await flushFocusFrame()
  expect(sendFocus).toHaveBeenNthCalledWith(1, store.initialRef?.current, 'focus')
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('no-hide-descendants')

  await act(async () => {
    expect(registry.update(entry.id, { visible: false })).toBe(true)
  })
  const exiting = registry.getSnapshot()[0]
  expect(exiting.phase).toBe('exiting')
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('no-hide-descendants')

  await act(async () => {
    expect(registry.completeExit(entry.id, exiting.generation)).toBe(true)
  })
  await flushFocusFrame()
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('auto')
  expect(sendFocus).toHaveBeenNthCalledWith(2, store.triggerRef?.current, 'focus')
})

it('cancels an initial focus request when an entering modal closes before layout', async () => {
  const sendFocus = mockScreenReader(true)
  const store: RegistryStore = {}

  function Harness() {
    const { mount, registry } = useOverlayRuntime()
    const initialRef = useRef<View>(null)
    store.registry = registry
    store.initialRef = initialRef
    return (
      <Pressable
        testID="quick-open-close"
        onPress={() => {
          const id = mount({
            accessibility: { mode: 'modal', initialFocusRef: initialRef },
            backBehavior: 'consume',
            content: <View ref={initialRef} testID="quick-focus-target" />,
          })
          registry.update(id, { visible: false })
        }}
      >
        <Text>Open then close</Text>
      </Pressable>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByTestId('quick-open-close'))
  await resolveAccessibilityState()
  const registry = requireRegistry(store)
  const exiting = registry.getSnapshot()[0]
  await markLayerReady(view, exiting.id)
  await flushFocusFrame()
  expect(sendFocus).not.toHaveBeenCalledWith(store.initialRef?.current, 'focus')
})

it('isolates lower modals, restores focus to the lower modal, and leaves higher non-modal entries accessible', async () => {
  const sendFocus = mockScreenReader(true)
  const store: RegistryStore = {}

  function Harness() {
    const { mount, registry } = useOverlayRuntime()
    const firstTarget = useRef<View>(null)
    const secondTarget = useRef<View>(null)
    const nonModalTarget = useRef<View>(null)
    store.registry = registry
    store.firstRef = firstTarget
    store.secondRef = secondTarget
    return (
      <>
        <Pressable
          testID="open-two-modals"
          onPress={() => {
            mount({
              accessibility: { mode: 'modal', initialFocusRef: firstTarget },
              backBehavior: 'consume',
              content: <View ref={firstTarget} testID="first-modal-focus" />,
            })
            mount({
              accessibility: { mode: 'modal', initialFocusRef: secondTarget },
              backBehavior: 'consume',
              content: <View ref={secondTarget} testID="second-modal-focus" />,
            })
            mount({
              accessibility: { mode: 'non-modal', initialFocusRef: nonModalTarget },
              backBehavior: 'consume',
              content: <View ref={nonModalTarget} testID="higher-nonmodal-focus" />,
            })
          }}
        >
          <Text>Open entries</Text>
        </Pressable>
      </>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByTestId('open-two-modals'))
  await resolveAccessibilityState()

  const registry = requireRegistry(store)
  const [first, second, third] = registry.getSnapshot()
  await markLayerReady(view, first.id)
  await markLayerReady(view, second.id)
  await flushFocusFrame()
  expect(sendFocus).toHaveBeenLastCalledWith(store.secondRef?.current, 'focus')
  expect(testNodeProps(view, `tsuki-overlay-layer-${first.id}`).importantForAccessibility).toBe(
    'no-hide-descendants',
  )
  expect(testNodeProps(view, `tsuki-overlay-layer-${second.id}`).importantForAccessibility).toBe(
    'auto',
  )
  expect(testNodeProps(view, `tsuki-overlay-layer-${third.id}`).importantForAccessibility).toBe(
    'auto',
  )

  await act(async () => {
    expect(registry.completeExit(second.id, second.generation + 1)).toBe(false)
    expect(registry.update(second.id, { visible: false })).toBe(true)
  })
  const secondExit = registry.getSnapshot().find((entry) => entry.id === second.id)!
  await act(async () => {
    expect(registry.completeExit(second.id, secondExit.generation)).toBe(true)
  })
  await flushFocusFrame()
  expect(sendFocus).toHaveBeenLastCalledWith(store.firstRef?.current, 'focus')
  expect(testNodeProps(view, `tsuki-overlay-layer-${third.id}`).importantForAccessibility).toBe(
    'auto',
  )
})

it('keeps focus and modal isolation scoped to each Root', async () => {
  const view = await render(
    <>
      <TsukiProvider scheme="light">
        <RootIsolationProbe testID="left-root-open" />
      </TsukiProvider>
      <TsukiProvider scheme="dark">
        <RootIsolationProbe testID="right-root-open" />
      </TsukiProvider>
    </>,
  )

  const boundaryProps = () =>
    testNodes(view, 'tsuki-overlay-page-accessibility-boundary').map(
      (boundary) => boundary.importantForAccessibility,
    )
  expect(boundaryProps()).toHaveLength(2)
  expect(boundaryProps()).toEqual(['auto', 'auto'])
  await fireEvent.press(screen.getByTestId('left-root-open'))
  expect(boundaryProps()).toEqual(['no-hide-descendants', 'auto'])
})

it('uses the same modal config path for imperative Controller entries', async () => {
  function Harness() {
    const controller = useOverlayController()
    const targetRef = useRef<View>(null)
    return (
      <Pressable
        testID="controller-open-modal"
        onPress={() =>
          controller.open({
            accessibility: { mode: 'modal', initialFocusRef: targetRef },
            backBehavior: 'consume',
            content: <View ref={targetRef} testID="controller-focus-target" />,
          })
        }
      >
        <Text>Open Controller modal</Text>
      </Pressable>
    )
  }

  const view = await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByTestId('controller-open-modal'))
  expect(
    testNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('no-hide-descendants')
})

function RootIsolationProbe({ testID }: { testID: string }) {
  const { mount } = useOverlayRuntime()
  const targetRef = useRef<View>(null)
  return (
    <Pressable
      testID={testID}
      onPress={() =>
        mount({
          accessibility: { mode: 'modal', initialFocusRef: targetRef },
          backBehavior: 'consume',
          content: <View ref={targetRef} />,
        })
      }
    >
      <Text>Open Root modal</Text>
    </Pressable>
  )
}

function RegistryCapture({ store }: { store: RegistryStore }) {
  const { registry } = useOverlayRuntime()
  store.registry = registry
  return null
}

function mockScreenReader(enabled: boolean) {
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(enabled)
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
    eventName: string,
    _listener: unknown,
  ) => {
    if (eventName !== 'screenReaderChanged') return { remove: jest.fn() }
    return { remove: jest.fn() }
  }) as unknown as typeof AccessibilityInfo.addEventListener)
  return jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => undefined)
}

async function resolveAccessibilityState() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function flushFocusFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

async function markLayerReady(view: TestView, id: number) {
  const onLayout = testNodeProps(view, `tsuki-overlay-layer-${id}`).onLayout
  if (typeof onLayout !== 'function') throw new Error(`Overlay layer ${id} has no layout handler.`)
  await act(async () => onLayout())
}

function requireRegistry(store: RegistryStore) {
  if (!store.registry) throw new Error('The Overlay Registry was not captured.')
  return store.registry
}

interface RegistryStore {
  registry?: OverlayRegistry
  initialRef?: RefObject<View | null>
  triggerRef?: RefObject<View | null>
  firstRef?: RefObject<View | null>
  secondRef?: RefObject<View | null>
}

interface TestView {
  toJSON(): unknown
}

function testNodeProps(view: TestView, testID: string) {
  const node = testNodes(view, testID)[0]
  if (!node) throw new Error(`Could not find rendered node ${testID}.`)
  return node
}

function testNodes(view: TestView, testID: string) {
  const found: Record<string, unknown>[] = []
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!value || typeof value !== 'object') return
    const node = value as { props?: Record<string, unknown>; children?: unknown }
    if (node.props?.testID === testID) found.push(node.props)
    visit(node.children)
  }

  visit(view.toJSON())
  return found
}
