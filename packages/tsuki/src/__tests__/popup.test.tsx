/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { StrictMode, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { Dialog, Popup, Portal, TsukiProvider, ConfigProvider } from '..'
import { MOTION_PRESETS } from '../motion/presets'
import { createTransitionStyle } from '../overlay/transition/transition-style'
import { useOverlayRuntime } from '../overlay/use-overlay-runtime'
import {
  getPopupKeyboardOverlap,
  getPopupSafeAreaInset,
  getPopupWrapperStyle,
} from '../popup/style'
import type { OverlayRegistry } from '../overlay/types'
import type { PopupPosition } from '../popup/types'

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

it('does not mount before visible', async () => {
  const store: RegistryStore = {}
  await renderPopup(<Popup testID="lazy-popup">Lazy content</Popup>, store)
  expect(requireRegistry(store).getSnapshot()).toHaveLength(0)
  expect(screen.queryByTestId('lazy-popup-root')).toBeNull()
})

it('supports uncontrolled default visibility', async () => {
  const visibleStore: RegistryStore = {}
  await renderPopup(
    <Popup defaultVisible testID="default-popup">
      <Text>Default content</Text>
    </Popup>,
    visibleStore,
  )
  expect(requireRegistry(visibleStore).getSnapshot()).toHaveLength(1)
  expect(screen.getByTestId('default-popup-container')).toBeTruthy()
})

it('calls the overlay callback before one controlled visibility request', async () => {
  const store: RegistryStore = {}
  const events: string[] = []
  await renderPopup(
    <Popup
      closeOnPressOverlay
      visible
      onPressOverlay={() => events.push('overlay')}
      onVisibleChange={(nextVisible) => events.push(`visible:${nextVisible}`)}
    >
      <Text>Controlled content</Text>
    </Popup>,
    store,
  )

  const mask = requireRegistry(store).getSnapshot()[0].mask as ReactElement<{
    onPress: () => void
  }>
  await act(async () => mask.props.onPress())
  expect(events).toEqual(['overlay', 'visible:false'])
  expect(requireRegistry(store).getSnapshot()).toHaveLength(1)
  expect(screen.getByText('Controlled content')).toBeTruthy()
})

it('reports a non-closing overlay press', async () => {
  const onPressOverlay = jest.fn()
  const store: RegistryStore = {}
  await renderPopup(
    <Popup defaultVisible onPressOverlay={onPressOverlay}>
      <Text>Content</Text>
    </Popup>,
    store,
  )
  const mask = requireRegistry(store).getSnapshot()[0].mask as ReactElement<{
    onPress: () => void
  }>
  await act(async () => mask.props.onPress())
  expect(onPressOverlay).toHaveBeenCalledTimes(1)
  expect(requireRegistry(store).getSnapshot()[0].visible).toBe(true)
})

it('does not create a touch blocker when overlay is false', async () => {
  const noMaskStore: RegistryStore = {}
  await renderPopup(
    <Popup defaultVisible overlay={false} testID="unmasked-popup">
      <Pressable testID="unmasked-action">
        <Text>Underlying action</Text>
      </Pressable>
    </Popup>,
    noMaskStore,
  )
  expect(requireRegistry(noMaskStore).getSnapshot()[0].mask).toBeUndefined()
  expect(screen.getByTestId('unmasked-popup-root').props.pointerEvents).toBe('box-none')
  await fireEvent.press(screen.getByTestId('unmasked-action'))
})

it('maps five positions to directionally correct content transitions and fades the mask', async () => {
  const positions: Array<[PopupPosition, string, number]> = [
    ['center', 'scale-fade', 1],
    ['top', 'slide-down', -1],
    ['bottom', 'slide-up', 1],
    ['left', 'slide-right', -1],
    ['right', 'slide-left', 1],
  ]
  const store: RegistryStore = {}
  await renderPopup(
    <>
      {positions.map(([position]) => (
        <Popup key={position} defaultVisible position={position} />
      ))}
    </>,
    store,
  )

  const entries = requireRegistry(store).getSnapshot()
  expect(entries).toHaveLength(5)
  positions.forEach(([position, presetName, direction], index) => {
    expect(entries[index].transition?.content?.preset).toBe(presetName)
    expect(entries[index].transition?.mask?.preset).toBe('fade')
    const preset = MOTION_PRESETS[presetName as keyof typeof MOTION_PRESETS]
    const style = createTransitionStyle(0, preset, 400, 800, 'enter')
    const transform = style.transform?.[0]
    if (position === 'center') {
      expect(style.opacity).toBe(0)
      expect(transform).toMatchObject({ scale: expect.any(Number) })
    } else if (position === 'left' || position === 'right') {
      expect(transform).toEqual({ translateX: direction * 400 })
    } else {
      expect(transform).toEqual({ translateY: direction * 800 })
    }
  })
})

it('closes an uncontrolled Popup through the mask and retains its Entry through exit', async () => {
  const store: RegistryStore = {}
  const onVisibleChange = jest.fn()
  await renderPopup(
    <Popup defaultVisible closeOnPressOverlay onVisibleChange={onVisibleChange}>
      <Text>Retained content</Text>
    </Popup>,
    store,
  )
  const registry = requireRegistry(store)
  const id = registry.getSnapshot()[0].id
  const mask = requireRegistry(store).getSnapshot()[0].mask as ReactElement<{
    onPress: () => void
  }>
  await act(async () => mask.props.onPress())

  const exiting = registry.getSnapshot()[0]
  expect(exiting).toMatchObject({ id, visible: false, phase: 'exiting' })
  expect(onVisibleChange).toHaveBeenCalledTimes(1)
  expect(onVisibleChange).toHaveBeenCalledWith(false)
  expect(screen.getByText('Retained content')).toBeTruthy()
})

it('routes Back only to the top Popup and consumes repeated Back while exiting', async () => {
  const store: RegistryStore = {}
  const firstChange = jest.fn()
  const secondChange = jest.fn()

  function Harness() {
    const [firstVisible, setFirstVisible] = useState(true)
    const [secondVisible, setSecondVisible] = useState(true)
    return (
      <>
        <Popup
          visible={firstVisible}
          onVisibleChange={(next) => {
            firstChange(next)
            setFirstVisible(next)
          }}
        >
          <Text>First</Text>
        </Popup>
        <Popup
          visible={secondVisible}
          onVisibleChange={(next) => {
            secondChange(next)
            setSecondVisible(next)
          }}
        >
          <Text>Second</Text>
        </Popup>
      </>
    )
  }

  await renderPopup(<Harness />, store)
  const registry = requireRegistry(store)
  await act(async () => expect(registry.dispatchBack()).toBe(true))
  expect(secondChange).toHaveBeenCalledTimes(1)
  expect(firstChange).not.toHaveBeenCalled()
  expect(registry.getSnapshot()[1]).toMatchObject({ visible: false, phase: 'exiting' })
  await act(async () => expect(registry.dispatchBack()).toBe(true))
  expect(secondChange).toHaveBeenCalledTimes(1)
  expect(firstChange).not.toHaveBeenCalled()
})

it('restores a controlled Popup when its owner declines an Android Back request', async () => {
  const store: RegistryStore = {}
  const onVisibleChange = jest.fn()
  await renderPopup(
    <Popup visible onVisibleChange={onVisibleChange}>
      <Text>Still visible</Text>
    </Popup>,
    store,
  )

  const registry = requireRegistry(store)
  const id = registry.getSnapshot()[0].id
  await act(async () => expect(registry.dispatchBack()).toBe(true))

  expect(onVisibleChange).toHaveBeenCalledTimes(1)
  expect(onVisibleChange).toHaveBeenCalledWith(false)
  expect(registry.getSnapshot()[0]).toMatchObject({ id, visible: true, phase: 'entering' })
  expect(screen.getByText('Still visible')).toBeTruthy()
})

it('returns to Popup Back handling after a higher Dialog exits', async () => {
  const store: RegistryStore = {}
  const popupChange = jest.fn()
  const dialogChange = jest.fn()
  await renderPopup(
    <>
      <Popup visible onVisibleChange={popupChange}>
        <Text>Popup</Text>
      </Popup>
      <Dialog visible title="Dialog" onVisibleChange={dialogChange} />
    </>,
    store,
  )
  const registry = requireRegistry(store)
  const popupId = registry.getSnapshot()[0].id
  const dialogId = registry.getSnapshot()[1].id

  await act(async () => expect(registry.dispatchBack()).toBe(true))
  expect(dialogChange).toHaveBeenCalledTimes(1)
  expect(popupChange).not.toHaveBeenCalled()
  expect(registry.getSnapshot()[0]).toMatchObject({ id: popupId, visible: true })
  expect(registry.getSnapshot()[1]).toMatchObject({
    id: dialogId,
    phase: 'entering',
    visible: true,
  })
})

it('keeps Portal content in the same Root Host above a visible Popup', async () => {
  const store: RegistryStore = {}
  await renderPopup(
    <>
      <Popup defaultVisible>
        <Text>Popup content</Text>
      </Popup>
      <Portal>
        <Text testID="popup-sibling-portal">Portal content</Text>
      </Portal>
    </>,
    store,
  )

  expect(screen.getByText('Popup content')).toBeTruthy()
  expect(screen.getByTestId('popup-sibling-portal')).toBeTruthy()
  expect(requireRegistry(store).getSnapshot()).toHaveLength(1)
})

it('reopens during exit without allowing an old generation to remove the Popup', async () => {
  const store: RegistryStore = {}

  function Harness() {
    const [visible, setVisible] = useState(true)
    return (
      <Popup visible={visible} onVisibleChange={setVisible} testID="lifecycle-popup">
        <Text>Lifecycle content</Text>
        <Pressable testID="popup-hide" onPress={() => setVisible(false)}>
          <Text>Hide</Text>
        </Pressable>
        <Pressable testID="popup-show" onPress={() => setVisible(true)}>
          <Text>Show</Text>
        </Pressable>
      </Popup>
    )
  }

  await renderPopup(<Harness />, store)
  const registry = requireRegistry(store)
  const id = registry.getSnapshot()[0].id
  await fireEvent.press(screen.getByTestId('popup-hide'))
  const exiting = registry.getSnapshot()[0]
  expect(exiting.phase).toBe('exiting')
  expect(screen.getByText('Lifecycle content')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('popup-show'))
  const reopened = registry.getSnapshot()[0]
  expect(reopened).toMatchObject({ id, visible: true, phase: 'entering' })
  expect(reopened.generation).toBeGreaterThan(exiting.generation)
  expect(registry.completeExit(id, exiting.generation)).toBe(false)
  expect(screen.getByText('Lifecycle content')).toBeTruthy()
})

it('applies Popup NativeWind classes, directional round corners, scrollable opt-in, and closeable button', async () => {
  const view = await render(
    <TsukiProvider scheme="dark">
      <ConfigProvider
        theme={{
          components: {
            Popup: {
              backgroundColor: '#123456',
              overlayColor: 'rgba(1, 2, 3, 0.5)',
              borderRadius: 22,
              animationDuration: 360,
            },
          },
        }}
      >
        <Popup
          defaultVisible
          position="bottom"
          round
          closeable
          className="bg-emerald-500"
          classNames={{ container: 'bg-blue-500', mask: 'bg-black/70' }}
          testID="themed-popup"
        >
          <Text>Themed content</Text>
        </Popup>
      </ConfigProvider>
    </TsukiProvider>,
  )

  const container = screen.getByTestId('themed-popup-container')
  expect(container.props.className).toContain('rounded-t-tsuki-popup')
  expect(container.props.className).toContain('bg-emerald-500')
  expect(container.props.className).not.toContain('bg-blue-500')
  expect(container.props.className).not.toContain('bg-tsuki-popup-background')
  expect(getNodeProps(view, 'themed-popup-mask').className).toContain('bg-black/70')
  // Default scrollable=false renders children directly (no forced ScrollView).
  expect(screen.getByText('Themed content').parent).toBe(container)
  expect(screen.getByTestId('themed-popup-close')).toBeTruthy()
})

it('adds top and bottom safe-area spacers only for matching Popup positions', async () => {
  const insets = { top: 32, right: 0, bottom: 24, left: 0 }
  const store: RegistryStore = {}
  const view = await render(
    <TsukiProvider scheme="light">
      <SafeAreaInsetsContext.Provider value={insets}>
        <RegistryCapture store={store} />
        <Popup defaultVisible position="bottom" safeAreaInsetBottom testID="safe-popup">
          <Text>Safe content</Text>
        </Popup>
      </SafeAreaInsetsContext.Provider>
    </TsukiProvider>,
  )

  expect(getNodeProps(view, 'safe-popup-safe-area').style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 24 })]),
  )
  expect(getPopupSafeAreaInset('center', 24, false)).toBe(0)
  expect(getPopupSafeAreaInset('bottom', 24, true)).toBe(0)
  expect(getPopupKeyboardOverlap({ y: 40, height: 800 }, 500)).toBe(340)
  expect(getPopupKeyboardOverlap({ y: 0, height: 500 }, 500)).toBe(0)
  expect(getPopupWrapperStyle('bottom', 300).marginBottom).toBe(300)

  await view.rerender(
    <TsukiProvider scheme="light">
      <SafeAreaInsetsContext.Provider value={{ ...insets, bottom: 40 }}>
        <RegistryCapture store={store} />
        <Popup
          defaultVisible
          position="top"
          round
          scrollable
          safeAreaInsetTop
          safeAreaInsetBottom
          testID="safe-popup"
        >
          <Text>Safe content</Text>
        </Popup>
      </SafeAreaInsetsContext.Provider>
    </TsukiProvider>,
  )
  expect(screen.getByTestId('safe-popup-container').props.className).toContain(
    'rounded-b-tsuki-popup',
  )
  expect(getNodeProps(view, 'safe-popup-safe-area-top').style).toEqual(
    expect.arrayContaining([expect.objectContaining({ height: 32 })]),
  )
})

it('keeps Popup modal isolation separate from mask rendering', async () => {
  const view = await render(
    <TsukiProvider scheme="light">
      <Popup defaultVisible overlay={false} testID="modal-unmasked-popup">
        <Text>Modal content</Text>
      </Popup>
    </TsukiProvider>,
  )
  expect(
    getNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('no-hide-descendants')
})

it('allows accessibility through a non-modal Popup', async () => {
  const view = await render(
    <TsukiProvider scheme="light">
      <Popup defaultVisible modal={false} testID="nonmodal-popup">
        <Text>Non-modal content</Text>
      </Popup>
    </TsukiProvider>,
  )
  expect(
    getNodeProps(view, 'tsuki-overlay-page-accessibility-boundary').importantForAccessibility,
  ).toBe('auto')
})

it('keeps one Entry through StrictMode replay and releases it when the Root unmounts', async () => {
  const store: RegistryStore = {}
  const view = await render(
    <StrictMode>
      <TsukiProvider scheme="light">
        <RegistryCapture store={store} />
        <Popup defaultVisible>
          <Text>Strict content</Text>
        </Popup>
      </TsukiProvider>
    </StrictMode>,
  )
  expect(requireRegistry(store).getSnapshot()).toHaveLength(1)
  await view.unmount()
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
  expect(requireRegistry(store).getSnapshot()).toEqual([])
})

function renderPopup(children: ReactNode, store: RegistryStore = {}) {
  return render(
    <TsukiProvider scheme="light">
      <RegistryCapture store={store} />
      {children}
    </TsukiProvider>,
  )
}

function RegistryCapture({ store }: { store: RegistryStore }) {
  const { registry } = useOverlayRuntime()
  store.registry = registry
  return null
}

function requireRegistry(store: RegistryStore): OverlayRegistry {
  if (!store.registry) throw new Error('The Popup Overlay Registry was not captured.')
  return store.registry
}

function getNodeProps(view: { toJSON(): unknown }, testID: string): Record<string, unknown> {
  const visit = (value: unknown): Record<string, unknown> | undefined => {
    if (Array.isArray(value)) {
      for (const child of value) {
        const match = visit(child)
        if (match) return match
      }
      return undefined
    }
    if (!value || typeof value !== 'object') return undefined
    const node = value as { props?: Record<string, unknown>; children?: unknown }
    if (node.props?.testID === testID) return node.props
    return visit(node.children)
  }

  const props = visit(view.toJSON())
  if (!props) throw new Error(`Could not find rendered node ${testID}.`)
  return props
}

interface RegistryStore {
  registry?: OverlayRegistry
}
