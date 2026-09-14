import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { useToken } from '../theme'
import { NoticeBarContent } from './notice-bar-content'
import { getNoticeBarStyles } from './style'
import type { NoticeBarProps } from './interface'

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

export function NoticeBar({
  text = '',
  children,
  leftIcon,
  rightIcon,
  visible: visibleProp = true,
  disabled = false,
  scrollable,
  wrapable = false,
  speed,
  delay,
  onClick,
  onClose,
}: NoticeBarProps) {
  const { token } = useToken()
  const [shown, setShown] = useState(visibleProp)
  const content = children !== undefined ? children : text
  const effectiveVisible = shown && visibleProp
  const styles = getNoticeBarStyles(token, wrapable, disabled)

  useEffect(() => {
    setShown(visibleProp)
  }, [visibleProp])

  const handleClose = useCallback(() => {
    if (disabled || !effectiveVisible) return
    setShown(false)
    onClose?.()
  }, [disabled, effectiveVisible, onClose])

  if (!effectiveVisible) return null

  const resolvedRightIcon = onClose
    ? (rightIcon ?? (
        <Icon name="CloseOutlined" size={token.fontSizeLG} color={token.colorWarning} />
      ))
    : rightIcon

  return (
    <View accessibilityLiveRegion="polite" style={styles.root}>
      <InteractionPressable
        accessibilityRole="alert"
        accessibilityState={{ disabled }}
        accessible
        disabled={disabled}
        onPress={onClick}
        style={({ pressed }) => getNoticeBarStyles(token, wrapable, disabled, pressed).contentRoot}
      >
        {isRenderable(leftIcon) ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <NoticeBarContent
          content={content}
          delay={delay}
          motion={token.motion}
          scrollable={scrollable}
          speed={speed}
          styles={styles}
          wrapable={wrapable}
        />
      </InteractionPressable>
      {isRenderable(resolvedRightIcon) ? (
        onClose ? (
          <InteractionPressable
            accessibilityLabel="关闭通知"
            accessibilityRole="button"
            disabled={disabled}
            onPress={handleClose}
            style={({ pressed }) => [
              styles.rightIcon,
              pressed && { opacity: token.motion ? 0.6 : 1 },
            ]}
          >
            {resolvedRightIcon}
          </InteractionPressable>
        ) : (
          <View style={styles.rightIcon}>{resolvedRightIcon}</View>
        )
      ) : null}
    </View>
  )
}

NoticeBar.displayName = 'NoticeBar'
