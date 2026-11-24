/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { useContext, useEffect, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { Button, Popover, Tooltip, TsukiProvider } from '..'
import { OverlayRegistryContext } from '../overlay/context'
import type { OverlayRegistry } from '../overlay/types'
import { measureViewInWindow } from '../floating/measure'
import type { FloatingRect } from '../floating/types'

jest.mock('../overlay/transition', () => {
  const React = jest.requireActual('react')
  return {
    OverlayEntryTransition: ({ entry }: { entry: { content: ReactNode; mask?: ReactNode } }) =>
      React.createElement(React.Fragment, null, entry.mask, entry.content),
  }
})

jest.mock('../floating/measure', () => ({ measureViewInWindow: jest.fn() }))

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

type RenderedNode = {
  props: {
    testID?: string
    style?: StyleProp<ViewStyle>
    className?: string
    onLayout?: (event: LayoutChangeEvent) => void
  } & Record<string, unknown>
}

beforeEach(() => {
  jest.mocked(measureViewInWindow).mockImplementation((view) => {
    const testID = (view as unknown as { props?: { testID?: string } } | null)?.props?.testID
    const rect: FloatingRect =
      testID === 'tsuki-overlay-host'
        ? { x: 10, y: 50, width: 300, height: 400 }
        : { x: 30, y: 65, width: 40, height: 24 }
    return Promise.resolve(rect)
  })
})

it('opens a Tooltip through OverlayPortal with transition, outside-tap, and Back dismissal', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  const onVisibleChange = jest.fn()
  await renderTree(
    <TsukiProvider scheme="light">
      <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      <Tooltip
        accessibilityLabel="Sync hint"
        content="Syncs every five minutes"
        onVisibleChange={onVisibleChange}
        placement="top"
        testID="tooltip-trigger"
      >
        <Text>Sync</Text>
      </Tooltip>
    </TsukiProvider>,
  )

  const trigger = screen.getByRole('button', { name: 'Sync hint' })
  await fireEvent(trigger, 'longPress')
  await setLayout('tooltip-trigger', 40, 24)
  await setLayout('tsuki-tooltip-content', 140, 36)

  const registry = requireRegistry(registryStore)
  expect(onVisibleChange).toHaveBeenCalledWith(true)
  expect(registry.getSnapshot()).toHaveLength(1)
  expect(registry.getPortalSnapshot()).toHaveLength(0)

  await waitFor(() => {
    const bubbleStyle = StyleSheet.flatten(getNodeWithTestID('tsuki-tooltip-content').props.style)
    expect(bubbleStyle).toMatchObject({ left: 8, top: 47 })
  })
  expect(getNodeWithTestID('tsuki-tooltip-content').props.className).toContain(
    'bg-tsuki-foreground',
  )

  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  expect(registry.getSnapshot()[0].phase).toBe('exiting')
})

it('supports press-triggered Tooltip with asChild Button and outside press dismissal', async () => {
  const onButtonPress = jest.fn()
  const onVisibleChange = jest.fn()
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  await renderTree(
    <TsukiProvider scheme="light">
      <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      <Tooltip
        asChild
        content="Tap hint"
        onVisibleChange={onVisibleChange}
        testID="press-tooltip-trigger"
        trigger="press"
      >
        <Button onPress={onButtonPress}>Info</Button>
      </Tooltip>
    </TsukiProvider>,
  )

  await fireEvent.press(screen.getByRole('button', { name: 'Info' }))
  expect(onButtonPress).toHaveBeenCalledTimes(1)
  expect(onVisibleChange).toHaveBeenLastCalledWith(true)

  await fireEvent.press(
    screen.getByTestId('tsuki-tooltip-outside', { includeHiddenElements: true }),
  )
  expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  expect(requireRegistry(registryStore).getSnapshot()[0].phase).toBe('exiting')
})

it('supports Popover asChild with Button, closes on outside press and Back, and uses semantic theme classes', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  const onVisibleChange = jest.fn()
  const onButtonPress = jest.fn()

  await renderTree(
    <TsukiProvider scheme="light">
      <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      <Popover
        asChild
        content={<Text>Archive item</Text>}
        onVisibleChange={onVisibleChange}
        placement="bottom"
        testID="popover-trigger"
      >
        <Button onPress={onButtonPress}>More actions</Button>
      </Popover>
      <Pressable
        testID="simulate-android-back"
        onPress={() => registryStore.current?.dispatchBack()}
      >
        <Text>Back</Text>
      </Pressable>
    </TsukiProvider>,
  )

  await fireEvent.press(screen.getByRole('button', { name: 'More actions' }))
  expect(onButtonPress).toHaveBeenCalledTimes(1)
  await setLayout('popover-trigger', 40, 24)
  await setLayout('tsuki-popover-content', 120, 72)

  const registry = requireRegistry(registryStore)
  expect(onVisibleChange).toHaveBeenLastCalledWith(true)
  expect(registry.getSnapshot()).toHaveLength(1)
  expect(getNodeWithTestID('tsuki-popover-content').props.className).toContain(
    'bg-tsuki-surface-elevated',
  )

  await waitFor(() => {
    const bubbleStyle = StyleSheet.flatten(getNodeWithTestID('tsuki-popover-content').props.style)
    expect(bubbleStyle).toMatchObject({ left: 8, top: 47 })
  })

  await fireEvent.press(
    screen.getByTestId('tsuki-popover-outside', { includeHiddenElements: true }),
  )
  expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  expect(registry.getSnapshot()[0].phase).toBe('exiting')

  await fireEvent.press(screen.getByRole('button', { name: 'More actions' }))
  expect(registry.getSnapshot()[0].phase).toBe('entering')
  await fireEvent.press(screen.getByTestId('simulate-android-back'))
  expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  expect(registry.getSnapshot()[0].phase).toBe('exiting')
})

it('keeps controlled Popover open when Back is declined and freezes coordinates while exiting with inline collisionPadding', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  const onVisibleChange = jest.fn()
  const visibleState: { set: (value: boolean) => void } = { set: () => undefined }

  function Harness() {
    const [visible, setVisible] = useState(false)
    visibleState.set = setVisible
    return (
      <>
        <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
        <Popover
          collisionPadding={{ top: 12, bottom: 12 }}
          content={<Text>Controlled menu</Text>}
          onVisibleChange={onVisibleChange}
          testID="controlled-popover-trigger"
          visible={visible}
        >
          <Text>Open controlled menu</Text>
        </Popover>
      </>
    )
  }

  await renderTree(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await fireEvent.press(screen.getByRole('button'))
  expect(onVisibleChange).toHaveBeenCalledWith(true)
  expect(screen.queryByText('Controlled menu')).toBeNull()

  await act(async () => visibleState.set(true))
  await setLayout('controlled-popover-trigger', 40, 24)
  await setLayout('tsuki-popover-content', 120, 72)
  await screen.findByText('Controlled menu')

  const registry = requireRegistry(registryStore)
  const callsAfterOpen = jest.mocked(measureViewInWindow).mock.calls.length
  expect(callsAfterOpen).toBeLessThan(10)

  await act(async () => {
    expect(registry.dispatchBack()).toBe(true)
  })
  expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  expect(registry.getSnapshot()[0].phase).toBe('entering')

  const beforeCloseStyle = StyleSheet.flatten(
    getNodeWithTestID('tsuki-popover-content').props.style,
  )
  await act(async () => visibleState.set(false))
  expect(registry.getSnapshot()[0].phase).toBe('exiting')
  const duringExitStyle = StyleSheet.flatten(getNodeWithTestID('tsuki-popover-content').props.style)
  expect(duringExitStyle).toMatchObject({
    left: beforeCloseStyle.left,
    top: beforeCloseStyle.top,
  })
  expect(duringExitStyle.opacity).toBeUndefined()
})

async function setLayout(testID: string, width: number, height: number) {
  await act(async () => {
    getNodeWithTestID(testID).props.onLayout?.({
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    } as LayoutChangeEvent)
  })
}

function getNodeWithTestID(testID: string) {
  return screen.getByTestId(testID, { includeHiddenElements: true }) as unknown as RenderedNode
}

async function renderTree(children: ReactElement) {
  return render(children)
}

function RegistryCapture({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
  const registry = useContext(OverlayRegistryContext)
  if (!registry) throw new Error('RegistryCapture must be inside a TsukiProvider.')
  useEffect(() => {
    onRegistry(registry)
  }, [onRegistry, registry])
  return null
}

function requireRegistry(store: { current: OverlayRegistry | null }) {
  if (!store.current)
    throw new Error('Expected the floating component to resolve its root Registry.')
  return store.current
}
