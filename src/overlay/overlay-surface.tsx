import { forwardRef } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { ForwardedRef } from 'react'
import type { ColorValue, ViewStyle } from 'react-native'
import type { AnimatedStyle } from 'react-native-reanimated'
import { Animated } from '../motion'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import type { OverlayProps, OverlaySemanticStyles } from './types'
import { getOverlayToken } from './token'

export interface OverlaySurfaceProps extends Omit<OverlayProps, 'duration' | 'onClosed'> {
  /** Internal mount state owned by the component that controls this surface. */
  rendered?: boolean
  presentation?: {
    resolvedStyle: ViewStyle
    semantic?: OverlaySemanticStyles
  }
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
  const { show = false, children, onPress, animatedStyle } = props
  const viewProps = { ...props }
  delete viewProps.show
  delete viewProps.backgroundColor
  delete viewProps.zIndex
  delete viewProps.children
  delete viewProps.onPress
  delete viewProps.style
  delete viewProps.styles
  delete viewProps.presentation
  delete viewProps.animatedStyle
  delete viewProps.rendered
  const { resolvedStyle, semantic } =
    props.presentation ?? resolveSurfacePresentation(props, rendered)
  const staticStyle = { ...resolvedStyle }
  delete staticStyle.opacity

  if (!rendered) return null

  return (
    <Animated.View
      ref={ref}
      {...viewProps}
      collapsable={false}
      pointerEvents={show ? 'auto' : 'none'}
      accessibilityElementsHidden={!show || props.accessibilityElementsHidden}
      importantForAccessibility={!show ? 'no-hide-descendants' : props.importantForAccessibility}
      style={[StyleSheet.absoluteFill, { zIndex }, staticStyle, animatedStyle]}
    >
      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        accessible={false}
        onPress={onPress}
        style={[StyleSheet.absoluteFill, { backgroundColor }, semantic?.mask]}
      />
      {children != null ? (
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, semantic?.content]}>
          {children}
        </View>
      ) : null}
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
