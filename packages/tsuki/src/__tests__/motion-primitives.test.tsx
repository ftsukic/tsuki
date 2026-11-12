import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { ConfigProvider, MotionPressable, MotionView, TsukiProvider, Transition } from '..'
import { resolveSwipeOffset, resolveSwipeTarget } from '../motion/gesture'

describe('Motion primitives', () => {
  it('uses Reanimated for ordinary Web transitions', async () => {
    const platform = Object.getOwnPropertyDescriptor(Platform, 'OS')!
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' })
    try {
      const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
      await render(
        <Transition visible>
          <Text>Web transition</Text>
        </Transition>,
      )
      expect(timing).toHaveBeenCalledWith(1, expect.any(Object), expect.any(Function))
    } finally {
      Object.defineProperty(Platform, 'OS', platform)
    }
  })

  it('waits for the slide measurement before starting entrance', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    const entered = jest.fn()
    await render(
      <Transition visible name="slide-up" testID="measured-slide" onEntered={entered}>
        <Text>slide content</Text>
      </Transition>,
    )
    expect(timing).not.toHaveBeenCalled()
    expect(entered).not.toHaveBeenCalled()
    const node = screen.getByTestId('measured-slide', { includeHiddenElements: true })
    expect(StyleSheet.flatten(node.props.style).opacity).toBe(0)
    await act(async () => {
      node.props.onLayout({ nativeEvent: { layout: { width: 100, height: 64 } } })
    })
    expect(timing).toHaveBeenCalledWith(1, expect.any(Object), expect.any(Function))
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('keeps exiting children until completion and ignores a stale exit after re-entry', async () => {
    const completions: Array<(finished?: boolean) => void> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) completions.push(callback)
      return value
    })
    const events: string[] = []
    const tree = (visible: boolean) => (
      <Transition
        visible={visible}
        unmountOnExit
        testID="transition"
        onEnter={() => events.push('enter')}
        onEntered={() => events.push('entered')}
        onExit={() => events.push('exit')}
        onExited={() => events.push('exited')}
      >
        <Text>content</Text>
      </Transition>
    )
    const view = await render(tree(true))
    await act(async () => {
      completions[0](true)
      await Promise.resolve()
    })
    await view.rerender(tree(false))
    expect(
      screen.getByTestId('transition', { includeHiddenElements: true }).props.pointerEvents,
    ).toBe('none')
    expect(screen.getByText('content', { includeHiddenElements: true })).toBeTruthy()
    await view.rerender(tree(true))
    await act(async () => {
      completions[1](true)
      await Promise.resolve()
    })
    expect(screen.getByText('content')).toBeTruthy()
    expect(events).toEqual(['enter', 'entered', 'exit', 'enter'])
    await act(async () => {
      completions[2](true)
      await Promise.resolve()
    })
    await view.rerender(tree(false))
    await act(async () => {
      completions[3](true)
      await Promise.resolve()
    })
    expect(screen.queryByText('content', { includeHiddenElements: true })).toBeNull()
    expect(events).toEqual(['enter', 'entered', 'exit', 'enter', 'entered', 'exit', 'exited'])
  })

  it('does not emit exit completion for initially hidden content', async () => {
    const onExited = jest.fn()
    await render(
      <Transition visible={false} onExited={onExited}>
        <Text>hidden</Text>
      </Transition>,
    )
    expect(onExited).not.toHaveBeenCalled()
    expect(screen.queryByText('hidden')).toBeNull()
    expect(screen.getByText('hidden', { includeHiddenElements: true })).toBeTruthy()
  })

  it.each(['scale', 'slide-up'] as const)('hides a retained %s endpoint visually', async (name) => {
    await render(
      <Transition visible={false} name={name} testID="retained">
        <Text>retained</Text>
      </Transition>,
    )
    expect(
      StyleSheet.flatten(
        screen.getByTestId('retained', { includeHiddenElements: true }).props.style,
      ).opacity,
    ).toBe(0)
  })

  it('skips appearance when requested and still animates later exits', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    const view = await render(
      <Transition visible appear={false}>
        <Text>content</Text>
      </Transition>,
    )
    expect(timing).not.toHaveBeenCalled()
    await view.rerender(
      <Transition visible={false} appear={false}>
        <Text>content</Text>
      </Transition>,
    )
    expect(timing).toHaveBeenCalledWith(0, expect.any(Object), expect.any(Function))
  })

  it('inherits duration scale and allows an isolated nested configuration', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    await render(
      <ConfigProvider theme={{ motion: { durationScale: 2, reducedMotion: 'never' } }}>
        <Transition visible duration={140} />
        <ConfigProvider theme={{ inherit: false }}>
          <Transition visible duration={140} />
        </ConfigProvider>
      </ConfigProvider>,
    )
    expect(timing.mock.calls.map(([, config]) => config?.duration)).toEqual([280, 140])
  })

  it.each([{ enabled: false }, { reducedMotion: 'always' as const }, { durationScale: 0 }])(
    'settles timing, spring and exit callbacks through TsukiProvider policy %j',
    async (motion) => {
      const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
      const spring = jest.spyOn(Reanimated, 'withSpring').mockImplementation((value) => value)
      const onExited = jest.fn()
      const tree = (visible: boolean) => (
        <TsukiProvider gesture={false} motion={motion}>
          <Transition visible={visible} onExited={onExited} unmountOnExit>
            <Text>overlay</Text>
          </Transition>
          <MotionView animate={{ scale: 1 }} initial={{ scale: 0.9 }} spring="normal" />
        </TsukiProvider>
      )
      const view = await render(tree(true))
      await view.rerender(tree(false))
      expect(timing).not.toHaveBeenCalled()
      expect(spring).not.toHaveBeenCalled()
      expect(onExited).toHaveBeenCalledTimes(1)
      expect(screen.queryByText('overlay', { includeHiddenElements: true })).toBeNull()
    },
  )

  it('shares one accessibility listener across a MotionView and multiple transitions', async () => {
    const listener = jest.spyOn(AccessibilityInfo, 'addEventListener')
    await render(
      <>
        <MotionView animate={{ scale: 1, rotate: 90 }} />
        <Transition visible />
        <Transition visible />
      </>,
    )
    expect(
      listener.mock.calls.filter(([name]) => String(name) === 'reduceMotionChanged'),
    ).toHaveLength(1)
  })

  it('keeps press feedback and interaction callbacks when motion is disabled', async () => {
    const onPress = jest.fn()
    await render(
      <ConfigProvider theme={{ motion: { enabled: false } }}>
        <MotionPressable testID="press" testOnly_pressed onPress={onPress}>
          <Text>press</Text>
        </MotionPressable>
      </ConfigProvider>,
    )
    expect(StyleSheet.flatten(screen.getByTestId('press').props.style).transform).toEqual([
      { scale: 0.96 },
    ])
    fireEvent.press(screen.getByTestId('press'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('Swipe motion decisions', () => {
  it('uses distance or directional velocity and preserves half-width thresholds', () => {
    expect(resolveSwipeTarget(-60, 0, 80, 100)).toBe(-100)
    expect(resolveSwipeTarget(-10, -600, 80, 100)).toBe(-100)
    expect(resolveSwipeTarget(10, 600, 80, 100)).toBe(80)
    expect(resolveSwipeTarget(-40, 0, 80, 100)).toBe(0)
    expect(resolveSwipeTarget(10, 600, 0, 100)).toBe(0)
  })

  it('clamps by default and applies resistance only beyond an available action', () => {
    expect(resolveSwipeOffset(-140, 80, 100, false)).toBe(-100)
    expect(resolveSwipeOffset(-140, 80, 100, true)).toBe(-110)
    expect(resolveSwipeOffset(120, 80, 100, true)).toBe(90)
    expect(resolveSwipeOffset(120, 0, 100, true)).toBe(0)
  })
})
