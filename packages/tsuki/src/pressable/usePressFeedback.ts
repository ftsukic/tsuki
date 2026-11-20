import { useCallback, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { PRESS_FEEDBACK_PRESETS } from '../motion/presets'
import type { MotionAnimationOptions } from '../motion/types'
import { useMotionValue } from '../motion/useMotionValue'
import type { PressFeedback, PressStyleConflicts } from './types'

function getStyleConflicts(style: StyleProp<ViewStyle> | undefined): PressStyleConflicts {
  const flattened = StyleSheet.flatten(style)

  return {
    transform: flattened?.transform != null,
    opacity: flattened?.opacity != null,
    backgroundColor: flattened?.backgroundColor != null,
  }
}

function getInitialProgress(
  feedback: PressFeedback,
  disabled: boolean,
  testOnly_pressed: boolean | undefined,
): number {
  return !disabled && feedback.mode !== 'none' && testOnly_pressed === true ? 1 : 0
}

function getAnimationOptions(mode: PressFeedback['mode']): MotionAnimationOptions {
  const preset = PRESS_FEEDBACK_PRESETS[mode]

  return preset.motion.animation === 'spring' ? { type: 'spring' } : { duration: preset.duration }
}

export interface PressFeedbackController {
  progress: SharedValue<number>
  styleConflicts: SharedValue<PressStyleConflicts>
  onPressIn: () => void
  onPressOut: () => void
}

export function usePressFeedback(
  feedback: PressFeedback,
  disabled: boolean,
  testOnly_pressed: boolean | undefined,
  initialStyle: StyleProp<ViewStyle> | undefined,
): PressFeedbackController {
  const initialProgress = getInitialProgress(feedback, disabled, testOnly_pressed)
  const motionValue = useMotionValue(initialProgress)
  const styleConflicts = useSharedValue(getStyleConflicts(initialStyle))
  const pressedRef = useRef(false)

  const updateTarget = useCallback(
    (pressed: boolean) => {
      const target =
        !disabled && feedback.mode !== 'none' && (pressed || testOnly_pressed === true) ? 1 : 0
      motionValue.animateTo(target, getAnimationOptions(feedback.mode))
    },
    [disabled, feedback.mode, motionValue, testOnly_pressed],
  )

  const onPressIn = useCallback(() => {
    pressedRef.current = true
    updateTarget(true)
  }, [updateTarget])

  const onPressOut = useCallback(() => {
    pressedRef.current = false
    updateTarget(false)
  }, [updateTarget])

  const previousOptions = useRef({ disabled, testOnly_pressed, mode: feedback.mode })
  useEffect(() => {
    const previous = previousOptions.current
    if (
      previous.disabled === disabled &&
      previous.testOnly_pressed === testOnly_pressed &&
      previous.mode === feedback.mode
    ) {
      return
    }

    previousOptions.current = { disabled, testOnly_pressed, mode: feedback.mode }
    updateTarget(pressedRef.current)
  }, [disabled, feedback.mode, testOnly_pressed, updateTarget])

  return {
    progress: motionValue.value,
    styleConflicts,
    onPressIn,
    onPressOut,
  }
}

export function resolvePressStyleConflicts(
  style: StyleProp<ViewStyle> | undefined,
): PressStyleConflicts {
  return getStyleConflicts(style)
}
