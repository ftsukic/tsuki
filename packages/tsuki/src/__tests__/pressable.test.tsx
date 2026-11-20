import { fireEvent, render, screen, userEvent } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef, ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Pressable } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { Button, Cell, TsukiProvider, useTsukiTheme } from '..'
import { PRESS_FEEDBACK_PRESETS } from '../motion/presets'
import { PressableRuntime } from '../pressable/pressable'
import type { PressFeedback } from '../pressable/types'

/* eslint-disable testing-library/no-await-sync-events -- RNTL fireEvent uses async act in this suite. */
jest.mock(
  'nativewind',
  () => ({
    vars: (variables: Record<string, string | number>) => variables,
  }),
  { virtual: true },
)

const withTiming = Reanimated.withTiming as jest.Mock
const withSpring = Reanimated.withSpring as jest.Mock
const useAnimatedStyle = Reanimated.useAnimatedStyle as jest.Mock

function runtime(
  children: ReactNode,
  motion: {
    enabled?: boolean
    reducedMotion?: 'always' | 'never' | 'system'
    durationScale?: number
  } = { reducedMotion: 'never' },
) {
  return (
    <TsukiProvider scheme="light" theme={{ motion }}>
      {children}
    </TsukiProvider>
  )
}

function styleOf(node: { props: { style?: StyleProp<ViewStyle> } }) {
  return StyleSheet.flatten(node.props.style)
}

function animatedStyleUpdater(index = 0) {
  const updater = useAnimatedStyle.mock.calls[index]?.[0]

  if (typeof updater !== 'function') {
    throw new Error(`Expected animated style updater at index ${index}`)
  }

  return updater as () => ViewStyle
}

function backgroundFeedbackStyleUpdater(index = 1) {
  return animatedStyleUpdater(index)
}

function ThemedBackgroundPressable() {
  const { semantic } = useTsukiTheme()

  return (
    <PressableRuntime
      className="bg-[color:var(--theme-surface)]"
      feedback={{
        mode: 'background',
        idleColor: semantic.colorSurface,
        pressedColor: semantic.colorBorder,
      }}
      testID="themed-pressable"
    >
      <Text>Theme feedback</Text>
    </PressableRuntime>
  )
}

beforeEach(() => {
  withTiming.mockClear()
  withSpring.mockClear()
  useAnimatedStyle.mockClear()
  withTiming.mockImplementation((target: number) => target)
  withSpring.mockImplementation((target: number) => target)
})

it('preserves native event order and forwards hit and retention options', async () => {
  const events: string[] = []
  const user = userEvent.setup()
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        hitSlop={8}
        pressRetentionOffset={12}
        onPressIn={() => events.push('in')}
        onPressOut={() => events.push('out')}
        onPress={() => events.push('press')}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  const pressable = screen.getByTestId('pressable')
  expect(pressable.props.hitSlop).toBe(8)
  await user.press(pressable)
  expect(events).toEqual(['in', 'out', 'press'])
})

it('preserves disabled behavior and invokes press in/out without adding callbacks', async () => {
  const onPress = jest.fn()
  const onPressIn = jest.fn()
  const onPressOut = jest.fn()
  const user = userEvent.setup()
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        accessibilityRole="button"
        disabled
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text>Disabled</Text>
      </PressableRuntime>,
    ),
  )

  const pressable = screen.getByRole('button', { disabled: true })
  await user.press(pressable)
  expect(onPress).not.toHaveBeenCalled()
  expect(onPressIn).not.toHaveBeenCalled()
  expect(onPressOut).not.toHaveBeenCalled()
})

it('forwards long press and treats release without a press as cancellation', async () => {
  const events: string[] = []
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        onPressIn={() => events.push('in')}
        onLongPress={() => events.push('long')}
        onPressOut={() => events.push('out')}
        onPress={() => events.push('press')}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  const pressable = screen.getByTestId('pressable')
  await fireEvent(pressable, 'pressIn')
  await fireEvent(pressable, 'longPress')
  await fireEvent(pressable, 'pressOut')
  expect(events).toEqual(['in', 'long', 'out'])

  events.length = 0
  await fireEvent(pressable, 'pressIn')
  await fireEvent(pressable, 'pressOut')
  expect(events).toEqual(['in', 'out'])
})

it('handles quick consecutive press and release cycles', async () => {
  const events: string[] = []
  const user = userEvent.setup()
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        onPressIn={() => events.push('in')}
        onPressOut={() => events.push('out')}
        onPress={() => events.push('press')}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  const pressable = screen.getByTestId('pressable')
  await user.press(pressable)
  await user.press(pressable)
  expect(events).toEqual(['in', 'out', 'press', 'in', 'out', 'press'])
})

it('preserves testOnly_pressed and gives children and style the same pressed state', async () => {
  const states: Array<{ source: 'children' | 'style'; pressed: boolean }> = []
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        testOnly_pressed
        style={(state) => {
          states.push({ source: 'style', pressed: state.pressed })
          return { opacity: state.pressed ? 0.5 : 1 }
        }}
      >
        {(state) => {
          states.push({ source: 'children', pressed: state.pressed })
          return <View testID="pressed-state" accessibilityLabel={String(state.pressed)} />
        }}
      </PressableRuntime>,
    ),
  )

  expect(screen.getByTestId('pressed-state').props.accessibilityLabel).toBe('true')
  expect(states.some((state) => state.source === 'style' && state.pressed)).toBe(true)
  expect(states.some((state) => state.source === 'children' && state.pressed)).toBe(true)
  expect(states.at(-1)?.pressed).toBe(true)
})

it('forwards the native Pressable ref', async () => {
  const ref = createRef<ComponentRef<typeof Pressable>>()
  await render(
    runtime(
      <PressableRuntime ref={ref} testID="pressable">
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )
  expect(ref.current).not.toBeNull()
})

it('implements the five feedback modes', async () => {
  const cases: PressFeedback[] = [
    { mode: 'opacity' },
    { mode: 'scale' },
    { mode: 'background', idleColor: '#000000', pressedColor: '#ffffff' },
    { mode: 'overlay', color: '#ff0000' },
    { mode: 'none' },
  ]

  for (const feedback of cases) {
    const view = await render(
      runtime(
        <PressableRuntime testID="pressable" testOnly_pressed feedback={feedback}>
          <Text>Action</Text>
        </PressableRuntime>,
      ),
    )
    const rootStyle = styleOf(screen.getByTestId('pressable'))

    if (feedback.mode === 'opacity') expect(rootStyle.opacity).toBe(0.9)
    if (feedback.mode === 'scale') expect(rootStyle.transform).toEqual([{ scale: 0.98 }])
    if (feedback.mode === 'background') {
      const background = view.root?.queryAll(
        (instance) => instance.props.testID === 'tsuki-press-feedback-background',
      )[0]
      expect(background).toBeDefined()
      expect(rootStyle.backgroundColor).toBeUndefined()
      expect(styleOf(background!)).toMatchObject({ backgroundColor: '#ffffff', opacity: 1 })
    }
    if (feedback.mode === 'overlay') {
      const overlay = view.root?.queryAll(
        (instance) => instance.props.testID === 'tsuki-press-feedback-overlay',
      )[0]
      expect(overlay).toBeDefined()
      expect(StyleSheet.flatten(overlay?.props.style as StyleProp<ViewStyle>)).toMatchObject({
        position: 'absolute',
        backgroundColor: '#ff0000',
        opacity: 1,
      })
      expect(rootStyle.opacity).toBeUndefined()
    }
    if (feedback.mode === 'none') {
      expect(rootStyle.opacity).toBeUndefined()
      expect(rootStyle.transform).toBeUndefined()
      expect(rootStyle.backgroundColor).toBeUndefined()
    }

    await view.unmount()
  }

  expect(Object.keys(PRESS_FEEDBACK_PRESETS)).toEqual([
    'opacity',
    'scale',
    'background',
    'overlay',
    'none',
  ])
})

it('leaves the idle background to NativeWind and clears it after feedback', async () => {
  const view = await render(
    runtime(
      <PressableRuntime
        className="bg-[color:var(--theme-surface)]"
        feedback={{ mode: 'background', idleColor: '#000000', pressedColor: '#ffffff' }}
        testID="pressable"
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  const pressable = screen.getByTestId('pressable')
  const background = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(background).toBeDefined()
  expect(pressable.props.className).toContain('bg-[color:var(--theme-surface)]')
  expect(styleOf(pressable).backgroundColor).toBeUndefined()
  expect(backgroundFeedbackStyleUpdater()().opacity).toBe(0)
  expect(styleOf(background!).backgroundColor).toBe('#ffffff')

  await fireEvent(pressable, 'pressIn')
  expect(backgroundFeedbackStyleUpdater()().opacity).toBe(1)

  await fireEvent(pressable, 'pressOut')
  expect(backgroundFeedbackStyleUpdater()().opacity).toBe(0)
})

it('uses the latest theme colors while feedback is active', async () => {
  const view = await render(runtime(<ThemedBackgroundPressable />))
  const pressable = screen.getByTestId('themed-pressable')

  await fireEvent(pressable, 'pressIn')
  expect(backgroundFeedbackStyleUpdater()().opacity).toBe(1)
  const lightBackground = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(styleOf(lightBackground!).backgroundColor).toBe('#e5e7eb')

  await view.rerender(
    <TsukiProvider scheme="dark">
      <ThemedBackgroundPressable />
    </TsukiProvider>,
  )

  const latestFeedbackStyle = backgroundFeedbackStyleUpdater(useAnimatedStyle.mock.calls.length - 2)
  expect(latestFeedbackStyle().opacity).toBe(1)
  const darkBackground = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(styleOf(darkBackground!).backgroundColor).toBe('#374151')

  await fireEvent(pressable, 'pressOut')
  expect(latestFeedbackStyle().opacity).toBe(0)
})

it('interrupts and reverses an active feedback transition', async () => {
  const targets: number[] = []
  withTiming.mockImplementation((target: number) => {
    targets.push(target)
    return target
  })
  await render(
    runtime(
      <PressableRuntime testID="pressable" feedback={{ mode: 'opacity' }}>
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )
  const pressable = screen.getByTestId('pressable')
  await fireEvent(pressable, 'pressIn')
  await fireEvent(pressable, 'pressOut')
  expect(targets).toEqual([1, 0])
})

it('updates immediately for Reduced Motion, disabled Motion, and zero duration scale', async () => {
  const cases = [{ reducedMotion: 'always' as const }, { enabled: false }, { durationScale: 0 }]

  for (const motion of cases) {
    const view = await render(
      runtime(
        <PressableRuntime testID="pressable" feedback={{ mode: 'scale' }}>
          <Text>Action</Text>
        </PressableRuntime>,
        motion,
      ),
    )
    await fireEvent(screen.getByTestId('pressable'), 'pressIn')
    await view.rerender(
      runtime(
        <PressableRuntime testID="pressable" feedback={{ mode: 'scale' }}>
          <Text>Action</Text>
        </PressableRuntime>,
        motion,
      ),
    )
    expect(styleOf(screen.getByTestId('pressable')).transform).toEqual([{ scale: 0.98 }])
    expect(withSpring).not.toHaveBeenCalled()
    expect(withTiming).not.toHaveBeenCalled()
    await view.unmount()
  }
})

it('gives explicit native style priority over matching feedback properties', async () => {
  const view = await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        feedback={{ mode: 'scale' }}
        style={{ transform: [{ translateX: 4 }] }}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  expect(styleOf(screen.getByTestId('pressable')).transform).toEqual([{ translateX: 4 }])
  await view.rerender(
    runtime(
      <PressableRuntime testID="pressable" feedback={{ mode: 'opacity' }} style={{ opacity: 0.4 }}>
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )
  expect(styleOf(screen.getByTestId('pressable')).opacity).toBe(0.4)
  await view.rerender(
    runtime(
      <PressableRuntime
        testID="pressable"
        testOnly_pressed
        feedback={{ mode: 'background', idleColor: '#000000', pressedColor: '#ffffff' }}
        style={{ backgroundColor: '#ff0000' }}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )
  expect(styleOf(screen.getByTestId('pressable')).backgroundColor).toBe('#ff0000')
  expect(backgroundFeedbackStyleUpdater(useAnimatedStyle.mock.calls.length - 2)().opacity).toBe(0)
})

it('uses callback style state when resolving conflicts', async () => {
  const resolvedStates: Array<{ pressed: boolean; backgroundColor?: string }> = []
  const user = userEvent.setup()
  const style = (state: { pressed: boolean }) => {
    const backgroundColor = state.pressed ? '#ff0000' : undefined
    resolvedStates.push({ pressed: state.pressed, backgroundColor })
    return backgroundColor ? { backgroundColor } : undefined
  }
  await render(
    runtime(
      <PressableRuntime
        testID="pressable"
        feedback={{ mode: 'background', idleColor: '#000000', pressedColor: '#ffffff' }}
        style={style}
      >
        <Text>Action</Text>
      </PressableRuntime>,
    ),
  )

  await user.press(screen.getByTestId('pressable'))
  expect(resolvedStates).toContainEqual({ pressed: true, backgroundColor: '#ff0000' })
})

it('keeps Button feedback, style order, accessibility, and Cell feedback behavior', async () => {
  const user = userEvent.setup()
  const onPress = jest.fn()
  await render(
    runtime(
      <>
        <Button
          testID="button"
          className="custom-button bg-red-500"
          onPress={onPress}
          styles={{ root: { opacity: 0.7, backgroundColor: '#ff0000' } }}
          style={{ opacity: 0.8, backgroundColor: '#0000ff' }}
        >
          Save
        </Button>
        <Cell
          testID="cell"
          title="Settings"
          clickable
          testOnly_pressed
          divider
          className="bg-red-500"
          styles={{ root: { backgroundColor: '#ff0000' } }}
          style={{ backgroundColor: '#0000ff' }}
        />
        <Cell testID="plain-cell" title="Read only" />
      </>,
    ),
  )

  const button = screen.getByRole('button', { name: 'Save' })
  expect(button.props.className).toContain('custom-button')
  expect(styleOf(button).opacity).toBe(0.8)
  expect(styleOf(button).backgroundColor).toBe('#0000ff')
  expect(styleOf(button).transform).toEqual([{ scale: 1 }])
  await user.press(button)
  expect(onPress).toHaveBeenCalledTimes(1)

  const cell = screen.getByTestId('cell')
  expect(cell.props.accessibilityRole).toBe('button')
  expect(styleOf(cell).backgroundColor).toBe('#0000ff')
  expect(cell.props.className).toContain('bg-red-500')
  expect(backgroundFeedbackStyleUpdater(useAnimatedStyle.mock.calls.length - 2)().opacity).toBe(0)
  expect(screen.getByTestId('cell-divider')).toBeOnTheScreen()
  expect(screen.getByTestId('plain-cell').props.accessibilityRole).toBeUndefined()
})
