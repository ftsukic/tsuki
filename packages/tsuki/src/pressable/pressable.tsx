import { createElement, forwardRef, useCallback } from 'react'
import type { ComponentRef, ReactNode, Ref, RefAttributes } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type {
  GestureResponderEvent,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { createAnimatedComponent, useAnimatedStyle } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { PRESS_FEEDBACK_PRESETS } from '../motion/presets'
import { resolvePressStyleConflicts, usePressFeedback } from './usePressFeedback'
import type { PressStyleConflicts, PressableRuntimeProps } from './types'

interface NativePressableHostProps extends Omit<PressableProps, 'children' | 'style'> {
  children?: PressableProps['children']
  backgroundFeedback?: ReactNode
  className?: string
  feedbackOverlay?: ReactNode
  pressableStyle?: PressableProps['style']
  style?: StyleProp<ViewStyle>
  styleConflicts: SharedValue<PressStyleConflicts>
}

const NativePressableHost = forwardRef<ComponentRef<typeof Pressable>, NativePressableHostProps>(
  function NativePressableHost(
    {
      backgroundFeedback,
      children,
      className,
      feedbackOverlay,
      pressableStyle,
      style,
      styleConflicts,
      ...props
    },
    ref,
  ) {
    const resolveStyle = useCallback(
      (state: PressableStateCallbackType) => {
        const resolvedStyle =
          typeof pressableStyle === 'function' ? pressableStyle(state) : pressableStyle
        styleConflicts.set(resolvePressStyleConflicts(resolvedStyle))
        return [resolvedStyle, style]
      },
      [pressableStyle, style, styleConflicts],
    )
    const nativeStyle =
      typeof pressableStyle === 'function' ? resolveStyle : [pressableStyle, style]

    const renderChildren = useCallback(
      (state: PressableStateCallbackType) => (
        <>
          {backgroundFeedback}
          {typeof children === 'function' ? children(state) : children}
          {feedbackOverlay}
        </>
      ),
      [backgroundFeedback, children, feedbackOverlay],
    )

    const nativeProps = {
      ...props,
      ref,
      className,
      style: nativeStyle,
    } as PressableProps & RefAttributes<ComponentRef<typeof Pressable>> & { className?: string }
    nativeProps.children = renderChildren

    return createElement(Pressable, nativeProps)
  },
)

const AnimatedPressableHost = createAnimatedComponent(NativePressableHost)
const AnimatedView = createAnimatedComponent(View)

export const PressableRuntime = forwardRef<ComponentRef<typeof Pressable>, PressableRuntimeProps>(
  function PressableRuntime(
    {
      children,
      className,
      disabled,
      feedback = { mode: 'none' },
      onPressIn,
      onPressOut,
      style,
      testOnly_pressed,
      ...props
    },
    ref,
  ) {
    const runtimeDisabled = disabled === true
    const {
      progress,
      styleConflicts,
      onPressIn: startFeedback,
      onPressOut: stopFeedback,
    } = usePressFeedback(
      feedback,
      runtimeDisabled,
      testOnly_pressed === true,
      typeof style === 'function' ? undefined : style,
    )
    const mode = feedback.mode
    const pressedOpacity =
      feedback.mode === 'opacity'
        ? (feedback.pressedOpacity ?? PRESS_FEEDBACK_PRESETS.opacity.pressedValue)
        : PRESS_FEEDBACK_PRESETS.opacity.pressedValue
    const pressedScale =
      feedback.mode === 'scale'
        ? (feedback.pressedScale ?? PRESS_FEEDBACK_PRESETS.scale.pressedValue)
        : PRESS_FEEDBACK_PRESETS.scale.pressedValue
    const pressedColor = feedback.mode === 'background' ? feedback.pressedColor : ''
    const staticStyleConflicts =
      typeof style === 'function' ? undefined : resolvePressStyleConflicts(style)
    const feedbackStyle = useAnimatedStyle(() => {
      'worklet'

      const amount = progress.get()
      const conflicts = staticStyleConflicts ?? styleConflicts.get()

      if (mode === 'opacity' && !conflicts.opacity) {
        return { opacity: 1 + (pressedOpacity - 1) * amount }
      }

      if (mode === 'scale' && !conflicts.transform) {
        return { transform: [{ scale: 1 + (pressedScale - 1) * amount }] }
      }

      return {}
    })
    const backgroundFeedbackStyle = useAnimatedStyle(() => {
      'worklet'

      const conflicts = staticStyleConflicts ?? styleConflicts.get()

      return {
        opacity: mode === 'background' && !conflicts.backgroundColor ? progress.get() : 0,
      }
    })
    const overlayStyle = useAnimatedStyle(() => ({
      opacity:
        mode === 'overlay' ? PRESS_FEEDBACK_PRESETS.overlay.pressedValue * progress.get() : 0,
    }))

    const handlePressIn = useCallback(
      (event: GestureResponderEvent) => {
        startFeedback()
        onPressIn?.(event)
      },
      [onPressIn, startFeedback],
    )
    const handlePressOut = useCallback(
      (event: GestureResponderEvent) => {
        stopFeedback()
        onPressOut?.(event)
      },
      [onPressOut, stopFeedback],
    )

    const feedbackOverlay =
      feedback.mode === 'overlay'
        ? createElement(AnimatedView, {
            accessible: false,
            importantForAccessibility: 'no-hide-descendants',
            pointerEvents: 'none',
            testID: 'tsuki-press-feedback-overlay',
            style: [
              StyleSheet.absoluteFill,
              { backgroundColor: feedback.color ?? 'rgba(0, 0, 0, 0.08)' },
              overlayStyle,
            ],
          })
        : undefined
    const rootStyle = typeof style === 'function' ? undefined : StyleSheet.flatten(style)
    const backgroundFeedbackShape = {
      ...(rootStyle?.borderRadius != null && { borderRadius: rootStyle.borderRadius }),
      ...(rootStyle?.borderTopLeftRadius != null && {
        borderTopLeftRadius: rootStyle.borderTopLeftRadius,
      }),
      ...(rootStyle?.borderTopRightRadius != null && {
        borderTopRightRadius: rootStyle.borderTopRightRadius,
      }),
      ...(rootStyle?.borderBottomLeftRadius != null && {
        borderBottomLeftRadius: rootStyle.borderBottomLeftRadius,
      }),
      ...(rootStyle?.borderBottomRightRadius != null && {
        borderBottomRightRadius: rootStyle.borderBottomRightRadius,
      }),
    }
    const backgroundFeedback =
      feedback.mode === 'background'
        ? createElement(AnimatedView, {
            accessible: false,
            importantForAccessibility: 'no-hide-descendants',
            pointerEvents: 'none',
            testID: 'tsuki-press-feedback-background',
            style: [
              StyleSheet.absoluteFill,
              backgroundFeedbackShape,
              { backgroundColor: pressedColor },
              backgroundFeedbackStyle,
            ],
          })
        : undefined

    const hostProps = {
      ...props,
      backgroundFeedback,
      feedbackOverlay,
      ref,
      className,
      disabled,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      pressableStyle: style,
      style: feedbackStyle,
      styleConflicts,
      testOnly_pressed,
    } as NativePressableHostProps & { ref?: Ref<ComponentRef<typeof Pressable>> }
    hostProps.children = children

    return createElement(AnimatedPressableHost, hostProps)
  },
)

PressableRuntime.displayName = 'PressableRuntime'
