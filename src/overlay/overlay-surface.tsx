import { forwardRef } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import type { ForwardedRef } from 'react'
import type { View } from 'react-native'
import type { ColorValue, StyleProp, ViewStyle } from 'react-native'
import type { AnimatedStyle } from 'react-native-reanimated'
import { Animated } from '../motion'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import type { OverlayProps } from './interface'
import { getOverlayToken } from './token'

export interface OverlaySurfaceProps extends Omit<OverlayProps, 'duration' | 'onClosed'> {
  /** Internal mount state owned by the component that controls this surface. */
  rendered?: boolean
  pressableStyle?: StyleProp<ViewStyle>
  animatedStyle?: AnimatedStyle<ViewStyle>
}

function resolveSurfacePresentation(props: OverlaySurfaceProps, rendered: boolean) {
  const { show = false, style, styles } = props
  const semantic = resolveStyles(styles, {
    props,
    state: { show, rendered },
  })
  const resolvedStyle = StyleSheet.flatten([semantic?.root, style]) ?? {}

  return { resolvedStyle, semantic }
}

function renderSurface(
  props: OverlaySurfaceProps,
  ref: ForwardedRef<View>,
  rendered: boolean,
  backgroundColor: ColorValue,
  zIndex: number,
) {
  const { show = false, children, onPress, pressableStyle, animatedStyle } = props
  const viewProps = { ...props }
  delete viewProps.show
  delete viewProps.backgroundColor
  delete viewProps.zIndex
  delete viewProps.children
  delete viewProps.onPress
  delete viewProps.style
  delete viewProps.styles
  delete viewProps.pressableStyle
  delete viewProps.animatedStyle
  delete viewProps.rendered
  const { resolvedStyle, semantic } = resolveSurfacePresentation(props, rendered)
  const staticStyle = { ...resolvedStyle }
  delete staticStyle.opacity

  if (!rendered) return null

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      collapsable={false}
      pointerEvents={show ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor, zIndex }, staticStyle, animatedStyle]}
    >
      <Pressable
        accessibilityElementsHidden={children == null ? true : undefined}
        accessible={children == null ? false : undefined}
        onPress={onPress}
        style={[StyleSheet.absoluteFill, pressableStyle, semantic?.content]}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}

/** Renders an overlay surface without owning visibility or animation lifecycle. */
export const OverlaySurface = forwardRef<View, OverlaySurfaceProps>(
  function OverlaySurface(props, ref) {
    const token = useComponentToken('Overlay', getOverlayToken)
    const {
      backgroundColor = token.backgroundColor,
      show = false,
      rendered = show,
      zIndex = token.zIndex,
    } = props

    return renderSurface(props, ref, rendered, backgroundColor, zIndex)
  },
)

OverlaySurface.displayName = 'Overlay.Surface'
