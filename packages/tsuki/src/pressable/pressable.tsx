import { createElement, forwardRef, useCallback, useLayoutEffect, useRef } from 'react'
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
    const latestDynamicConflictsRef = useRef<PressStyleConflicts | null>(null)
    const resolveStyle = useCallback(
      (state: PressableStateCallbackType) => {
        const resolvedStyle =
          typeof pressableStyle === 'function' ? pressableStyle(state) : pressableStyle
        latestDynamicConflictsRef.current = resolvePressStyleConflicts(resolvedStyle)
        return [resolvedStyle, style]
      },
      [pressableStyle, style],
    )
    const nativeStyle =
      typeof pressableStyle === 'function' ? resolveStyle : [pressableStyle, style]

    useLayoutEffect(() => {
      if (typeof pressableStyle !== 'function' || !latestDynamicConflictsRef.current) return
      const next = latestDynamicConflictsRef.current
      const current = styleConflicts.get()
      if (
        current.transform !== next.transform ||
        current.opacity !== next.opacity ||
        current.backgroundColor !== next.backgroundColor
      ) {
        styleConflicts.set(next)
      }
    })

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
    const isDynamicStyle = typeof style === 'function'
    const {
      progress,
      styleConflicts,
      onPressIn: startFeedback,
      onPressOut: stopFeedback,
    } = usePressFeedback(
      feedback,
      runtimeDisabled,
      testOnly_pressed === true,
      isDynamicStyle ? undefined : style,
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
    const staticConflicts = isDynamicStyle ? undefined : resolvePressStyleConflicts(style)
    const hasStaticTransform = staticConflicts?.transform ?? false
    const hasStaticOpacity = staticConflicts?.opacity ?? false
    const hasStaticBackground = staticConflicts?.backgroundColor ?? false

    useLayoutEffect(() => {
      if (!staticConflicts) return
      const current = styleConflicts.get()
      if (
        current.transform !== hasStaticTransform ||
        current.opacity !== hasStaticOpacity ||
        current.backgroundColor !== hasStaticBackground
      ) {
        styleConflicts.set({
          transform: hasStaticTransform,
          opacity: hasStaticOpacity,
          backgroundColor: hasStaticBackground,
        })
      }
    }, [hasStaticBackground, hasStaticOpacity, hasStaticTransform, staticConflicts, styleConflicts])

    const feedbackStyle = useAnimatedStyle(() => {
      'worklet'

      const amount = progress.get()
      const opacityBlocked = isDynamicStyle ? styleConflicts.get().opacity : hasStaticOpacity
      const transformBlocked = isDynamicStyle ? styleConflicts.get().transform : hasStaticTransform

      if (mode === 'opacity' && !opacityBlocked) {
        return { opacity: 1 + (pressedOpacity - 1) * amount }
      }

      if (mode === 'scale' && !transformBlocked) {
        return { transform: [{ scale: 1 + (pressedScale - 1) * amount }] }
      }

      return {}
    }, [
      hasStaticOpacity,
      hasStaticTransform,
      isDynamicStyle,
      mode,
      pressedOpacity,
      pressedScale,
      progress,
      styleConflicts,
    ])
    const backgroundFeedbackStyle = useAnimatedStyle(() => {
      'worklet'

      const backgroundBlocked = isDynamicStyle
        ? styleConflicts.get().backgroundColor
        : hasStaticBackground

      return {
        opacity: mode === 'background' && !backgroundBlocked ? progress.get() : 0,
      }
    }, [hasStaticBackground, isDynamicStyle, mode, progress, styleConflicts])
    const overlayStyle = useAnimatedStyle(() => {
      'worklet'

      return {
        opacity:
          mode === 'overlay' ? PRESS_FEEDBACK_PRESETS.overlay.pressedValue * progress.get() : 0,
      }
    }, [mode, progress])

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

    const rootStyle = isDynamicStyle ? undefined : StyleSheet.flatten(style)
    const feedbackShape = {
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
    const feedbackOverlay =
      feedback.mode === 'overlay'
        ? createElement(AnimatedView, {
            accessible: false,
            importantForAccessibility: 'no-hide-descendants',
            pointerEvents: 'none',
            testID: 'tsuki-press-feedback-overlay',
            style: [
              StyleSheet.absoluteFill,
              feedbackShape,
              { backgroundColor: feedback.color ?? 'rgba(0, 0, 0, 0.08)' },
              overlayStyle,
            ],
          })
        : undefined
    const backgroundFeedback =
      feedback.mode === 'background'
        ? createElement(AnimatedView, {
            accessible: false,
            importantForAccessibility: 'no-hide-descendants',
            pointerEvents: 'none',
            testID: 'tsuki-press-feedback-background',
            style: [
              StyleSheet.absoluteFill,
              feedbackShape,
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
