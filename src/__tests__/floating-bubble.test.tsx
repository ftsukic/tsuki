import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { AccessibilityInfo, Dimensions, StyleSheet, Text } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { FloatingBubble, Icon, Provider } from '..'
import type { FloatingBubbleProps, MotionConfig } from '..'
import { MAGNETIC_PRESET } from '../motion/presets'
import { sampleSpring } from '../motion/animation'
import {
  clampOffset,
  resolveBounds,
  resolveMagneticTarget,
} from '../floating-bubble/floating-bubble'

function TestProvider({ children }: { children: React.ReactNode }) {
  return <Provider theme={{ seed: { motion: false } }}>{children}</Provider>
}

async function layout(
  testID: string,
  width = 48,
  height = 48,
  viewport = Dimensions.get('window'),
) {
  const bubble = screen.getByTestId(testID, { includeHiddenElements: true })
  let layer = bubble.parent
  while (layer && !layer.props.onLayout) layer = layer.parent
  await act(async () => {
    layer?.props.onLayout({
      nativeEvent: { layout: { width: viewport.width, height: viewport.height, x: 0, y: 0 } },
    })
    bubble.props.onLayout({
      nativeEvent: { layout: { width, height, x: 0, y: 0 } },
    })
  })
}

async function drag(
  testID: string,
  translationX: number,
  translationY: number,
  velocityX = 0,
  velocityY = 0,
) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId(`${testID}-gesture`), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX, translationY },
      { translationX, translationY },
      { state: State.END, translationX, translationY, velocityX, velocityY },
    ])
  })
}

function getBubbleOffset(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(testID).props.style)
  const transform = style.transform as Array<Record<string, unknown>>
  const value = (key: string) => {
    const entry = transform.find((item) => key in item)?.[key]
    return entry && typeof entry === 'object' && '__getValue' in entry
      ? (entry as { __getValue: () => number }).__getValue()
      : entry
  }
  return { x: value('translateX'), y: value('translateY') }
}

async function beginDrag(testID: string, translationX = 20, translationY = 30) {
  const pan = getByGestureTestId(`${testID}-gesture`)
  await act(async () => {
    pan.handlers.onStart?.({} as never)
    pan.handlers.onUpdate?.({ translationX, translationY } as never)
  })
}

async function endDrag(testID: string, success = true) {
  const pan = getByGestureTestId(`${testID}-gesture`)
  await act(async () => {
    pan.handlers.onEnd?.({} as never, success)
    pan.handlers.onFinalize?.({} as never, success)
  })
}

function holdAnimations() {
  const completions: Array<(finished?: boolean) => void> = []
  const timing = jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
  const spring = jest
    .spyOn(Reanimated, 'withSpring')
    .mockImplementation((value, _config, callback) => {
      if (callback) completions.push(callback)
      return value
    })
  return { timing, spring, completions }
}

function animatedBubble(props: Partial<FloatingBubbleProps> = {}, motion: MotionConfig = {}) {
  return (
    <Provider motion={{ reducedMotion: 'never', ...motion }}>
      <FloatingBubble
        testID="animated"
        axis="xy"
        magnetic="x"
        defaultOffset={{ x: 100, y: 100 }}
        {...props}
      >
        <Text>磁吸</Text>
      </FloatingBubble>
    </Provider>
  )
}

describe('FloatingBubble', () => {
  afterEach(async () => {
    await cleanup()
    jest.restoreAllMocks()
  })

  it('is exported from the root and renders an accessible button', async () => {
    await render(
      <TestProvider>
        <FloatingBubble testID="default">
          <Text>帮助</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('default')
    expect(FloatingBubble).toBeTruthy()
    expect(screen.getByTestId('default').props.accessibilityRole).toBe('button')
  })

  it('keeps axis lock draggable-disabled while remaining pressable', async () => {
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble testID="locked" axis="lock" onPress={onPress}>
          <Text>锁定</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('locked')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('locked'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(() => getByGestureTestId('locked-gesture')).not.toThrow()
  })

  it('clamps controlled offsets when the measured bubble is laid out', async () => {
    const onOffsetChange = jest.fn()
    const viewport = Dimensions.get('window')
    await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled"
          axis="xy"
          offset={{ x: -100, y: 9999 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled', 60, 64)
    expect(onOffsetChange).not.toHaveBeenCalled()
    expect(
      clampOffset(
        { x: -100, y: 9999 },
        resolveBounds({
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          bubbleWidth: 60,
          bubbleHeight: 64,
          gap: 24,
        }),
      ),
    ).toEqual({
      x: 24,
      y: viewport.height - 64 - 24,
    })
  })

  it('synchronizes a changed controlled offset to the animated position', async () => {
    const onOffsetChange = jest.fn()
    const view = await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled-sync"
          axis="xy"
          offset={{ x: 80, y: 100 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled-sync')
    await view.rerender(
      <TestProvider>
        <FloatingBubble
          testID="controlled-sync"
          axis="xy"
          offset={{ x: 180, y: 260 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await drag('controlled-sync', 10, 20)
    expect(onOffsetChange).toHaveBeenLastCalledWith({ x: 190, y: 280 })
  })

  it('reconciles a controlled drag after the parent ignores the request', async () => {
    const onOffsetChange = jest.fn()
    const onOffsetChangeEnd = jest.fn()
    const view = await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled-ignore"
          axis="xy"
          offset={{ x: 100, y: 100 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled-ignore')
    await drag('controlled-ignore', 80, 60)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    await view.rerender(
      <TestProvider>
        <FloatingBubble
          testID="controlled-ignore"
          axis="xy"
          offset={{ x: 100, y: 100 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    expect(onOffsetChange).toHaveBeenCalledTimes(1)
    expect(onOffsetChange).toHaveBeenCalledWith({ x: 180, y: 160 })
    expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 180, y: 160 })
    await waitFor(() => expect(getBubbleOffset('controlled-ignore')).toEqual({ x: 100, y: 100 }))
  })

  it('keeps a controlled drag when the parent writes the target back', async () => {
    const onOffsetChangeEnd = jest.fn()

    function Controlled() {
      const [value, setValue] = React.useState({ x: 100, y: 100 })
      return (
        <FloatingBubble
          testID="controlled-writeback"
          axis="xy"
          offset={value}
          onOffsetChange={setValue}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      )
    }

    await render(
      <TestProvider>
        <Controlled />
      </TestProvider>,
    )
    await layout('controlled-writeback')
    await drag('controlled-writeback', 80, 60)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 180, y: 160 })
    await waitFor(() => expect(getBubbleOffset('controlled-writeback')).toEqual({ x: 180, y: 160 }))
  })

  it('keeps an uncontrolled drag at its settled target', async () => {
    const view = await render(
      <TestProvider>
        <FloatingBubble testID="uncontrolled" axis="xy" defaultOffset={{ x: 100, y: 100 }}>
          <Text>非控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('uncontrolled')
    await drag('uncontrolled', 80, 60)
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="uncontrolled" axis="xy" defaultOffset={{ x: 100, y: 100 }}>
          <Text>非控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await waitFor(() => expect(getBubbleOffset('uncontrolled')).toEqual({ x: 180, y: 160 }))
  })

  it('follows an external controlled offset update without a gesture', async () => {
    const view = await render(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 100, y: 100 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('external-offset')
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 200, y: 240 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 200, y: 240 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    expect(getBubbleOffset('external-offset')).toEqual({ x: 200, y: 240 })
  })

  it('uses the real bubble size and safe area in its drag bounds', async () => {
    const onOffsetChange = jest.fn()
    const viewport = Dimensions.get('window')
    await render(
      <TestProvider>
        <SafeAreaInsetsContext.Provider value={{ top: 20, right: 0, bottom: 12, left: 0 }}>
          <FloatingBubble
            testID="sized"
            axis="xy"
            defaultOffset={{ x: 24, y: 32 }}
            onOffsetChange={onOffsetChange}
          >
            <Text>自定义尺寸</Text>
          </FloatingBubble>
        </SafeAreaInsetsContext.Provider>
      </TestProvider>,
    )

    await layout('sized', 100, 80)
    await drag('sized', 9999, 9999)

    expect(onOffsetChange).toHaveBeenLastCalledWith({
      x: viewport.width - 100 - 24,
      y: viewport.height - 12 - 80 - 24,
    })
  })

  it('notifies the final position after magnetic x chooses the nearest edge', async () => {
    const onOffsetChange = jest.fn()
    const onOffsetChangeEnd = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble
          testID="magnetic"
          axis="xy"
          magnetic="x"
          defaultOffset={{ x: 100, y: 80 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>吸附</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('magnetic')
    await drag('magnetic', -40, 30)

    const viewport = Dimensions.get('window')
    expect(onOffsetChange).toHaveBeenLastCalledWith({
      x: 24,
      y: 110,
    })
    expect(onOffsetChangeEnd).toHaveBeenLastCalledWith({ x: 24, y: 110 })
    expect(
      resolveMagneticTarget(
        { x: 60, y: 110 },
        resolveBounds({
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          bubbleWidth: 48,
          bubbleHeight: 48,
          gap: 24,
        }),
        'x',
      ),
    ).toEqual({ x: 24, y: 110 })
  })

  it('fires onPress for a tap and not for an activated pan', async () => {
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble testID="interaction" axis="xy" onPress={onPress}>
          <Text>操作</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('interaction')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('interaction'))
    expect(onPress).toHaveBeenCalledTimes(1)

    await drag('interaction', 80, 40)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('hides the unpositioned button and restores caller accessibility and interaction after layout', async () => {
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble testID="not-ready" accessible accessibilityLabel="帮助" onPress={onPress}>
          <Text>帮助</Text>
        </FloatingBubble>
      </TestProvider>,
    )
    expect(screen.queryByRole('button')).toBeNull()
    const hidden = screen.getByTestId('not-ready', { includeHiddenElements: true })
    expect(hidden.props.pointerEvents).toBe('none')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(hidden)
    expect(onPress).not.toHaveBeenCalled()
    await layout('not-ready')
    expect(screen.getByRole('button', { name: '帮助' }).props.accessible).toBe(true)
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByTestId('not-ready'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('keeps root precedence and applies content and icon styles to their own regions', async () => {
    await render(
      <TestProvider>
        <FloatingBubble
          testID="semantic"
          style={{ backgroundColor: '#123456' }}
          styles={{
            root: { backgroundColor: '#abcdef' },
            content: { padding: 3 },
            icon: { padding: 2 },
          }}
          icon={<Text testID="semantic-icon">图标</Text>}
        />
      </TestProvider>,
    )
    await layout('semantic')
    expect(StyleSheet.flatten(screen.getByTestId('semantic').props.style).backgroundColor).toBe(
      '#123456',
    )
    const icon = screen.getByTestId('semantic-icon')
    expect(StyleSheet.flatten(icon.parent?.props.style).padding).toBe(2)
    expect(StyleSheet.flatten(icon.parent?.parent?.props.style).padding).toBe(3)
  })

  it('uses children including null without falling back to the icon', async () => {
    const tree = (children: React.ReactNode) => (
      <TestProvider>
        <FloatingBubble testID="content-choice" icon={<Text>备用图标</Text>}>
          {children}
        </FloatingBubble>
      </TestProvider>
    )
    const view = await render(tree(<Text>正文</Text>))
    await layout('content-choice')
    expect(screen.getByText('正文')).toBeTruthy()
    expect(screen.queryByText('备用图标')).toBeNull()
    await view.rerender(tree(null))
    expect(screen.queryByText('正文')).toBeNull()
    expect(screen.queryByText('备用图标')).toBeNull()
  })

  it('defaults direct icon props from tokens while preserving explicit props and children', async () => {
    const tree = (content: Partial<FloatingBubbleProps>) => (
      <Provider theme={{ components: { FloatingBubble: { color: '#ff1234', iconSize: 30 } } }}>
        <FloatingBubble testID="icon-token" {...content} />
      </Provider>
    )
    const view = await render(
      tree({ icon: <Icon testID="token-svg" name="CustomerServiceOutlined" /> }),
    )
    await layout('icon-token')
    expect(screen.getByTestId('token-svg').props).toMatchObject({
      width: 30,
      height: 30,
      fill: '#ff1234',
    })
    await view.rerender(
      tree({
        icon: <Icon testID="token-svg" name="CustomerServiceOutlined" size={18} color="#123456" />,
      }),
    )
    expect(screen.getByTestId('token-svg').props).toMatchObject({ width: 18, fill: '#123456' })
    await view.rerender(
      tree({
        children: (
          <Icon testID="token-svg" name="CustomerServiceOutlined" size={16} color="#654321" />
        ),
      }),
    )
    expect(screen.getByTestId('token-svg').props).toMatchObject({ width: 16, fill: '#654321' })
  })

  it.each<MotionConfig>([{ enabled: false }, { reducedMotion: 'always' }, { durationScale: 0 }])(
    'settles immediately under the motion policy %j',
    async (motion) => {
      const { timing, spring } = holdAnimations()
      const onOffsetChange = jest.fn()
      await render(animatedBubble({ onOffsetChange }, motion))
      await layout('animated')
      timing.mockClear()
      spring.mockClear()
      await drag('animated', -40, 30)
      expect(timing).not.toHaveBeenCalled()
      expect(spring).not.toHaveBeenCalled()
      expect(onOffsetChange).toHaveBeenCalledTimes(1)
      expect(onOffsetChange).toHaveBeenCalledWith({ x: 24, y: 130 })
    },
  )

  it('scales magnetic spring speed and notifies once only after completion', async () => {
    const { spring, completions } = holdAnimations()
    const onOffsetChange = jest.fn()
    const onOffsetChangeEnd = jest.fn()
    await render(
      <Provider
        motion={{ reducedMotion: 'never', durationScale: 2 }}
        theme={{ components: { FloatingBubble: { animationDuration: 180 } } }}
      >
        <FloatingBubble
          testID="animated"
          axis="xy"
          magnetic="x"
          defaultOffset={{ x: 100, y: 100 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        />
      </Provider>,
    )
    await layout('animated')
    await drag('animated', -40, 30)
    expect(spring).toHaveBeenLastCalledWith(
      24,
      expect.objectContaining({ damping: 25, stiffness: expect.closeTo(600 / 1.44), mass: 0.8 }),
      expect.any(Function),
    )
    expect(onOffsetChange).not.toHaveBeenCalled()
    await act(async () => {
      completions[0](true)
      completions[0](true)
    })
    expect(onOffsetChange).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 24, y: 130 })
  })

  it('respects system Reduced Motion for magnetic settling', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const { timing, spring } = holdAnimations()
    const onOffsetChange = jest.fn()
    await render(animatedBubble({ onOffsetChange }, { reducedMotion: 'system' }))
    await layout('animated')
    timing.mockClear()
    spring.mockClear()
    await drag('animated', -40, 30)
    expect(timing).not.toHaveBeenCalled()
    expect(spring).not.toHaveBeenCalled()
    expect(onOffsetChange).toHaveBeenCalledWith({ x: 24, y: 130 })
  })

  it('reaches the edge quickly, rebounds slightly, and settles with the magnetic preset', () => {
    expect(sampleSpring(150, 0, 100, MAGNETIC_PRESET).value).toBeGreaterThan(100)
    expect(sampleSpring(150, 0, 100, MAGNETIC_PRESET).value).toBeLessThan(106)
    expect(sampleSpring(600, 0, 100, MAGNETIC_PRESET)).toEqual({ value: 100, finished: true })
  })

  it('uses the released axis velocity and caps excessive flicks', async () => {
    const { spring } = holdAnimations()
    await render(animatedBubble())
    await layout('animated')
    await drag('animated', -40, 30, -10000, 500)
    expect(spring).toHaveBeenLastCalledWith(
      24,
      expect.objectContaining({ velocity: -1000 }),
      expect.any(Function),
    )
  })

  it('does not carry horizontal velocity when only vertical dragging is enabled', async () => {
    const { spring } = holdAnimations()
    await render(animatedBubble({ axis: 'y' }))
    await layout('animated')
    await drag('animated', 0, 30, 700, 500)
    expect(spring).toHaveBeenLastCalledWith(
      24,
      expect.objectContaining({ velocity: 0 }),
      expect.any(Function),
    )
  })

  it('measures the nearest portal area and reclamps after that area shrinks', async () => {
    await render(
      <TestProvider>
        <SafeAreaInsetsContext.Provider value={{ top: 10, right: 0, bottom: 12, left: 0 }}>
          <FloatingBubble testID="local-area" axis="xy" />
        </SafeAreaInsetsContext.Provider>
      </TestProvider>,
    )
    await layout('local-area', 48, 48, { ...Dimensions.get('window'), width: 220, height: 320 })
    expect(getBubbleOffset('local-area')).toEqual({ x: 148, y: 236 })
    await layout('local-area', 48, 48, { ...Dimensions.get('window'), width: 160, height: 200 })
    // A drag reads the clamped shared position, independent of Jest's static style snapshot.
    await beginDrag('local-area', 0, 0)
    expect(getBubbleOffset('local-area')).toEqual({ x: 88, y: 116 })
  })

  it('keeps a spring overshoot inside the visible viewport while allowing movement into the gap', async () => {
    const { spring } = holdAnimations()
    spring.mockImplementation(() => -50)
    const view = await render(animatedBubble())
    await layout('animated')
    await drag('animated', -40, 30)
    await view.rerender(animatedBubble())
    expect(getBubbleOffset('animated')).toEqual({ x: 0, y: 130 })
    spring.mockImplementation(() => 20)
    await beginDrag('animated', 80, 0)
    await endDrag('animated')
    expect(getBubbleOffset('animated').x).toBe(20)
  })

  it.each([false, true])(
    'reconciles controlled magnetic completion when parent writeback is %s',
    async (writeback) => {
      const { completions } = holdAnimations()
      const onOffsetChange = jest.fn()
      const onOffsetChangeEnd = jest.fn()
      function Controlled() {
        const [offset, setOffset] = React.useState({ x: 100, y: 100 })
        return animatedBubble({
          offset,
          onOffsetChange: (next) => {
            onOffsetChange(next)
            if (writeback) setOffset(next)
          },
          onOffsetChangeEnd,
        })
      }
      const view = await render(<Controlled />)
      await layout('animated')
      await drag('animated', -40, 30)
      expect(onOffsetChange).not.toHaveBeenCalled()
      await act(async () => {
        completions[0](true)
      })
      expect(onOffsetChange).toHaveBeenCalledTimes(1)
      expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
      // Refresh the static Jest animated-style snapshot after reconciliation.
      await view.rerender(<Controlled />)
      expect(getBubbleOffset('animated')).toEqual(
        writeback ? { x: 24, y: 130 } : { x: 100, y: 100 },
      )
    },
  )

  it('does not notify an unfinished magnetic animation', async () => {
    const { completions } = holdAnimations()
    const onOffsetChangeEnd = jest.fn()
    await render(animatedBubble({ onOffsetChangeEnd }))
    await layout('animated')
    await drag('animated', -40, 30)
    await act(async () => {
      completions[0](false)
    })
    expect(onOffsetChangeEnd).not.toHaveBeenCalled()
  })

  it('commits vertical magnetic settling without changing the horizontal position', async () => {
    const { completions } = holdAnimations()
    const onOffsetChangeEnd = jest.fn()
    await render(animatedBubble({ magnetic: 'y', onOffsetChangeEnd }))
    await layout('animated')
    await drag('animated', 20, -40)
    await act(async () => {
      completions[0](true)
    })
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 120, y: 24 })
  })

  it('cancels both axes before a new drag and rejects the previous magnetic completion', async () => {
    const { completions } = holdAnimations()
    const cancel = jest.spyOn(Reanimated, 'cancelAnimation')
    const onOffsetChange = jest.fn()
    await render(animatedBubble({ onOffsetChange }))
    await layout('animated')
    await drag('animated', -40, 30)
    cancel.mockClear()
    await beginDrag('animated')
    expect(cancel).toHaveBeenCalledTimes(2)
    await act(async () => {
      completions[0](true)
    })
    expect(onOffsetChange).not.toHaveBeenCalled()
    await endDrag('animated')
    await act(async () => {
      completions[1](true)
    })
    expect(onOffsetChange).toHaveBeenCalledTimes(1)
  })

  it.each(['offset', 'bounds', 'disabled', 'lock', 'unmount'] as const)(
    'invalidates magnetic completion after %s changes',
    async (change) => {
      const { completions } = holdAnimations()
      const onOffsetChange = jest.fn()
      const view = await render(animatedBubble({ onOffsetChange }))
      await layout('animated')
      await drag('animated', -40, 30)
      if (change === 'bounds') await layout('animated', 80, 80)
      else if (change === 'unmount') await view.unmount()
      else
        await view.rerender(
          animatedBubble({
            onOffsetChange,
            ...(change === 'offset'
              ? { offset: { x: 200, y: 240 } }
              : change === 'disabled'
                ? { disabled: true }
                : { axis: 'lock' }),
          }),
        )
      await act(async () => {
        completions[0](true)
      })
      expect(onOffsetChange).not.toHaveBeenCalled()
      if (change === 'offset') {
        await view.rerender(animatedBubble({ onOffsetChange, offset: { x: 200, y: 240 } }))
        expect(getBubbleOffset('animated')).toEqual({ x: 200, y: 240 })
      }
    },
  )

  it('rejects an old completion already queued on RN when an external offset replaces it', async () => {
    const { completions } = holdAnimations()
    const onOffsetChange = jest.fn()
    const queued: Array<() => void> = []
    const originalSchedule = Worklets.scheduleOnRN
    let hold = false
    const schedule = jest.spyOn(Worklets, 'scheduleOnRN').mockImplementation((fun, ...args) => {
      if (hold) queued.push(() => fun(...args))
      else originalSchedule(fun, ...args)
    })
    const view = await render(animatedBubble({ onOffsetChange }))
    await layout('animated')
    await drag('animated', -40, 30)
    hold = true
    await act(async () => {
      completions[0](true)
    })
    expect(queued).toHaveLength(1)
    await view.rerender(animatedBubble({ onOffsetChange, offset: { x: 200, y: 240 } }))
    await act(async () => {
      queued.forEach((run) => run())
    })
    schedule.mockRestore()
    expect(onOffsetChange).not.toHaveBeenCalled()
    await view.rerender(animatedBubble({ onOffsetChange, offset: { x: 200, y: 240 } }))
    expect(getBubbleOffset('animated')).toEqual({ x: 200, y: 240 })
  })

  it.each(['cancel', 'disabled', 'lock'] as const)(
    'clears dragging and commits the moved position once on %s',
    async (ending) => {
      const onOffsetChange = jest.fn()
      const style = jest.fn(({ state }: { state: { dragging: boolean } }) => ({
        root: { borderWidth: state.dragging ? 2 : 0 },
      }))
      const view = await render(animatedBubble({ styles: style, onOffsetChange }))
      await layout('animated')
      await beginDrag('animated')
      expect(style).toHaveBeenLastCalledWith(expect.objectContaining({ state: { dragging: true } }))
      if (ending === 'cancel') await endDrag('animated', false)
      else
        await view.rerender(
          animatedBubble({
            styles: style,
            onOffsetChange,
            ...(ending === 'disabled' ? { disabled: true } : { axis: 'lock' }),
          }),
        )
      expect(style).toHaveBeenLastCalledWith(
        expect.objectContaining({ state: { dragging: false } }),
      )
      expect(onOffsetChange).toHaveBeenCalledTimes(1)
      expect(onOffsetChange).toHaveBeenCalledWith({ x: 120, y: 130 })
    },
  )

  it('resolves a too-small viewport to a single non-negative position', () => {
    const bounds = resolveBounds({
      viewportWidth: 40,
      viewportHeight: 50,
      bubbleWidth: 80,
      bubbleHeight: 90,
      gap: 24,
      topInset: 20,
      bottomInset: 12,
    })

    expect(bounds).toEqual({ minX: 24, maxX: 24, minY: 44, maxY: 44 })
  })

  it('recomputes and reclamps the position when the viewport changes', () => {
    const firstBounds = resolveBounds({
      viewportWidth: 400,
      viewportHeight: 800,
      bubbleWidth: 48,
      bubbleHeight: 48,
      gap: 24,
    })
    const rotatedBounds = resolveBounds({
      viewportWidth: 800,
      viewportHeight: 400,
      bubbleWidth: 48,
      bubbleHeight: 48,
      gap: 24,
    })

    expect(clampOffset({ x: firstBounds.maxX, y: firstBounds.maxY }, rotatedBounds)).toEqual({
      x: 328,
      y: 328,
    })
  })
})
