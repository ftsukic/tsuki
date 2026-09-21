import { forwardRef, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ColorValue, StyleProp, ViewStyle } from 'react-native'
import { InteractionPressableInternal } from '../interaction/interaction-pressable-internal'
import type { InteractionPressableProps, InteractionPressableState } from '../interaction/types'
import { useToken } from '../theme'
import { usePressAnimationController } from './usePressAnimation'
import type { PressStyle } from './usePressAnimation'

export interface PressableProps extends InteractionPressableProps {
  /** Visual feedback applied while the press is active. */
  pressStyle?: PressStyle
  /** Opacity used by the `opacity` press style. Defaults to the theme alias token. */
  pressedOpacity?: number
  /** Scale used by the `scale` press style. */
  pressedScale?: number
  /** Background color used by the `background` press style. */
  pressedBackgroundColor?: ColorValue
  /** Overlay color used by the `overlay` press style. */
  pressedOverlayColor?: ColorValue
  /** Final style override for the pressed root or overlay feedback. */
  pressedStyle?: StyleProp<ViewStyle>
}

interface StaticPressableProps extends PressableProps {
  pressStyle: 'background' | 'overlay'
}

function resolveStyle(
  style: PressableProps['style'],
  state: InteractionPressableState,
): StyleProp<ViewStyle> {
  return typeof style === 'function' ? style(state) : style
}

const StaticPressable = forwardRef<
  React.ComponentRef<typeof InteractionPressableInternal>,
  StaticPressableProps
>(function StaticPressable(
  { children, pressStyle, pressedBackgroundColor, pressedOverlayColor, pressedStyle, ...props },
  ref,
) {
  const { token } = useToken()
  const backgroundColor = pressedBackgroundColor ?? token.pressedBackgroundColor
  const overlayColor = pressedOverlayColor ?? token.pressedOverlayColor

  if (pressStyle === 'background') {
    return (
      <InteractionPressableInternal
        {...props}
        ref={ref}
        useAnimatedHost={false}
        style={(state) => [
          resolveStyle(props.style, state),
          state.pressed ? { backgroundColor } : undefined,
          state.pressed ? pressedStyle : undefined,
        ]}
      >
        {children}
      </InteractionPressableInternal>
    )
  }

  return (
    <InteractionPressableInternal
      {...props}
      ref={ref}
      useAnimatedHost={false}
      style={(state) => [{ overflow: 'hidden' }, resolveStyle(props.style, state)]}
    >
      {(state) => {
        const content = typeof children === 'function' ? children(state) : children
        const layer = state.pressed ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }, pressedStyle]}
          />
        ) : null

        return (
          <>
            {content}
            {layer}
          </>
        )
      }}
    </InteractionPressableInternal>
  )
})

StaticPressable.displayName = 'StaticPressable'

const AnimatedPressable = forwardRef<
  React.ComponentRef<typeof InteractionPressableInternal>,
  PressableProps
>(function AnimatedPressable(
  {
    children,
    disabled = false,
    pressStyle = 'opacity',
    pressedOpacity,
    pressedScale,
    style,
    testOnly_pressed,
    ...props
  },
  ref,
) {
  const { token } = useToken()
  const { animatedStyle, setPressed } = usePressAnimationController({
    disabled,
    initialPressed: testOnly_pressed === true,
    pressStyle,
    pressedOpacity: pressedOpacity ?? token.pressedOpacity,
    pressedScale,
  })
  const handlePressedChange = useCallback(
    (nextPressed: boolean) => setPressed(nextPressed),
    [setPressed],
  )
  const interactionStyle = (state: InteractionPressableState) => [
    animatedStyle,
    typeof style === 'function' ? style(state) : style,
  ]

  return (
    <InteractionPressableInternal
      {...props}
      ref={ref}
      disabled={disabled}
      onPressedChange={handlePressedChange}
      testOnly_pressed={testOnly_pressed}
      useAnimatedHost
      style={interactionStyle}
    >
      {children}
    </InteractionPressableInternal>
  )
})

AnimatedPressable.displayName = 'AnimatedPressable'

export const Pressable = forwardRef<
  React.ComponentRef<typeof InteractionPressableInternal>,
  PressableProps
>(function Pressable(
  {
    pressStyle = 'opacity',
    pressedBackgroundColor,
    pressedOpacity,
    pressedOverlayColor,
    pressedScale,
    pressedStyle,
    ...props
  },
  ref,
) {
  if (pressStyle === 'none') {
    return <InteractionPressableInternal {...props} ref={ref} useAnimatedHost={false} />
  }

  if (pressStyle === 'background' || pressStyle === 'overlay') {
    return (
      <StaticPressable
        {...props}
        ref={ref}
        pressStyle={pressStyle}
        pressedBackgroundColor={pressedBackgroundColor}
        pressedOverlayColor={pressedOverlayColor}
        pressedStyle={pressedStyle}
      />
    )
  }

  return (
    <AnimatedPressable
      {...props}
      ref={ref}
      pressStyle={pressStyle}
      pressedOpacity={pressedOpacity}
      pressedScale={pressedScale}
    />
  )
})

Pressable.displayName = 'Pressable'
