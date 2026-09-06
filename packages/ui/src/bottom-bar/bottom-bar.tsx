import { useToken } from '../theme'
import type { BottomBarProps } from './interface'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Animated, Keyboard, Platform, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function BottomBar({
  theme,
  safeAreaInsetBottom = true,
  backgroundColor,
  height,
  hidden = false,
  keyboardShowNotRender = true,
  divider = true,
  style,
  ...props
}: BottomBarProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.BottomBar, ...theme }
  const { bottom } = useSafeAreaInsets()
  const resolvedHeight = height ?? token.height
  const realHeight = resolvedHeight + (safeAreaInsetBottom ? bottom : 0)
  const heightAnimated = useRef(new Animated.Value(realHeight)).current

  useEffect(() => {
    heightAnimated.setValue(realHeight)
  }, [heightAnimated, realHeight])

  useEffect(() => {
    if (!keyboardShowNotRender || Platform.OS !== 'android') return
    const show = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(heightAnimated, {
        toValue: 0,
        duration: themeToken.motionDurationSlow,
        useNativeDriver: false,
      }).start()
    })
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(heightAnimated, {
        toValue: realHeight,
        duration: themeToken.motionDurationFast,
        delay: themeToken.motionDurationMid,
        useNativeDriver: false,
      }).start()
    })
    return () => {
      show.remove()
      hide.remove()
    }
  }, [heightAnimated, keyboardShowNotRender, realHeight, themeToken])

  const styles = useMemo<StyleProp<ViewStyle>>(
    () => [
      {
        height: heightAnimated,
        paddingBottom: safeAreaInsetBottom ? bottom : 0,
        backgroundColor: backgroundColor ?? token.backgroundColor,
        borderTopColor: token.dividerColor,
        borderTopWidth: divider ? token.dividerWidth : 0,
        overflow: 'hidden',
      },
      style,
    ],
    [
      backgroundColor,
      bottom,
      divider,
      heightAnimated,
      safeAreaInsetBottom,
      style,
      token.backgroundColor,
      token.dividerColor,
      token.dividerWidth,
    ],
  )

  return hidden ? null : <Animated.View {...props} style={styles} />
}

export default memo(BottomBar)
