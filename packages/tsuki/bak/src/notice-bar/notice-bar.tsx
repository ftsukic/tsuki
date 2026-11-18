import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Icon } from '../icon'
import { Pressable } from '../pressable'
import { resolveStyles } from '../style/resolve-styles'
import { useToken } from '../theme'
import { NoticeBarContent } from './notice-bar-content'
import { getNoticeBarStyles } from './style'
import type { NoticeBarProps } from './types'

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

export function NoticeBar(props: NoticeBarProps) {
  const {
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
    accessibilityLabel,
    accessibilityHint,
    leftIconAccessibilityLabel,
    rightIconAccessibilityLabel,
    style,
    styles: semanticStyles,
  } = props
  const { token } = useToken()
  const [shown, setShown] = useState(visibleProp)
  const content = children !== undefined ? children : text
  const messageLabel =
    accessibilityLabel ??
    (typeof content === 'string' || typeof content === 'number' ? String(content) : undefined)
  const effectiveVisible = shown && visibleProp
  const effectiveWrapable = wrapable && scrollable !== true
  const styles = getNoticeBarStyles(token, effectiveWrapable, disabled)
  const semantic = resolveStyles(semanticStyles, {
    props,
    state: {
      visible: effectiveVisible,
      disabled,
      clickable: !!onClick,
      wrapable: effectiveWrapable,
    },
  })

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
  const body = (
    <>
      {isRenderable(leftIcon) ? (
        <View
          accessible={!!leftIconAccessibilityLabel && !onClick}
          accessibilityLabel={leftIconAccessibilityLabel}
          accessibilityRole={leftIconAccessibilityLabel ? 'image' : undefined}
          accessibilityElementsHidden={!leftIconAccessibilityLabel}
          importantForAccessibility={leftIconAccessibilityLabel ? 'auto' : 'no-hide-descendants'}
          style={[styles.leftIcon, semantic?.leftIcon]}
        >
          {leftIcon}
        </View>
      ) : null}
      <View
        accessible={!onClick}
        accessibilityRole={onClick ? undefined : 'alert'}
        accessibilityState={onClick ? undefined : { disabled }}
        accessibilityLabel={onClick ? undefined : messageLabel}
        accessibilityHint={onClick ? undefined : accessibilityHint}
        accessibilityLiveRegion={onClick ? undefined : 'polite'}
        style={[styles.content, semantic?.content]}
      >
        <NoticeBarContent
          content={content}
          delay={delay}
          motion={token.motion}
          scrollable={scrollable}
          speed={speed}
          styles={styles}
          textStyle={semantic?.text}
          wrapable={effectiveWrapable}
        />
      </View>
    </>
  )

  return (
    <View accessible={false} style={[styles.root, semantic?.root, style]}>
      {onClick ? (
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            messageLabel === undefined
              ? undefined
              : (accessibilityLabel ??
                [leftIconAccessibilityLabel, messageLabel].filter(Boolean).join('，'))
          }
          accessibilityHint={accessibilityHint}
          accessibilityLiveRegion="polite"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onClick}
          pressStyle="opacity"
          pressedOpacity={token.pressedOpacity}
          style={[styles.contentRoot, semantic?.body]}
        >
          {body}
        </Pressable>
      ) : (
        <View accessible={false} style={[styles.contentRoot, semantic?.body]}>
          {body}
        </View>
      )}
      {isRenderable(resolvedRightIcon) ? (
        onClose ? (
          <Pressable
            accessibilityLabel="关闭通知"
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={handleClose}
            pressStyle="opacity"
            style={[styles.rightIcon, semantic?.closeAction]}
          >
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {resolvedRightIcon}
            </View>
          </Pressable>
        ) : (
          <View
            accessible={!!rightIconAccessibilityLabel}
            accessibilityLabel={rightIconAccessibilityLabel}
            accessibilityRole={rightIconAccessibilityLabel ? 'image' : undefined}
            accessibilityElementsHidden={!rightIconAccessibilityLabel}
            importantForAccessibility={rightIconAccessibilityLabel ? 'auto' : 'no-hide-descendants'}
            style={[styles.rightIcon, semantic?.rightIcon]}
          >
            {resolvedRightIcon}
          </View>
        )
      ) : null}
    </View>
  )
}

NoticeBar.displayName = 'NoticeBar'
