import type { ReactNode } from 'react'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import type { LayoutChangeEvent, ViewStyle } from 'react-native'
import { Text } from '../text'
import {
  getNoticeBarItemStyle,
  type NoticeBarItemMode,
  type NoticeBarResolvedStyles,
} from './style'

interface NoticeBarItemProps {
  children?: ReactNode
  mode: NoticeBarItemMode
  onLayout?: (event: LayoutChangeEvent) => void
  styles: NoticeBarResolvedStyles
  animatedStyle?: AnimatedStyle<ViewStyle>
}

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export function NoticeBarItem({
  children,
  mode,
  onLayout,
  styles,
  animatedStyle,
}: NoticeBarItemProps) {
  const textStyle =
    mode === 'measure' || mode === 'scroll'
      ? styles.text
      : [styles.text, { flex: 1, flexShrink: 1 }]

  return (
    <Animated.View
      collapsable={false}
      onLayout={onLayout}
      pointerEvents="none"
      style={[getNoticeBarItemStyle(styles, mode), animatedStyle]}
    >
      {isTextContent(children) ? (
        <Text
          ellipsizeMode={mode === 'ellipsis' ? 'tail' : undefined}
          numberOfLines={mode === 'ellipsis' ? 1 : undefined}
          style={textStyle}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Animated.View>
  )
}

NoticeBarItem.displayName = 'NoticeBar.Item'
