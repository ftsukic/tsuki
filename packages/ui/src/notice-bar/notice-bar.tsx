import { usePersistFn } from '../hooks'
import { Icon } from '../icon'
import { useToken } from '../theme'
import type { NoticeBarProps } from './interface'
import isNil from 'lodash/isNil'
import { memo, useCallback, useState } from 'react'
import { Text, TouchableWithoutFeedback, View } from 'react-native'

export function NoticeBar({
  theme,
  message,
  messageTextStyle,
  status = 'warning',
  mode,
  bordered = false,
  color,
  backgroundColor,
  iconColor,
  wrapable = false,
  square = true,
  size = 'm',
  renderLeftIcon,
  renderRightIcon,
  onPressClose,
  style,
  ...props
}: NoticeBarProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.NoticeBar, ...theme }
  const [visible, setVisible] = useState(true)
  const statusColors = {
    info: {
      backgroundColor: themeToken.colorInfoBg,
      borderColor: themeToken.colorInfoBorder,
      color: themeToken.colorInfo,
    },
    success: {
      backgroundColor: themeToken.colorSuccessBg,
      borderColor: themeToken.colorSuccessBorder,
      color: themeToken.colorSuccess,
    },
    warning: {
      backgroundColor: themeToken.colorWarningBg,
      borderColor: themeToken.colorWarningBorder,
      color: themeToken.colorWarning,
    },
    error: {
      backgroundColor: themeToken.colorErrorBg,
      borderColor: themeToken.colorErrorBorder,
      color: themeToken.colorError,
    },
  }[status]
  const resolvedColor = color ?? statusColors.color
  const resolvedBackground = backgroundColor ?? statusColors.backgroundColor
  const resolvedBorder = color ?? statusColors.borderColor
  const resolvedIconColor = iconColor ?? resolvedColor
  const close = usePersistFn(onPressClose ?? (() => undefined))
  const onPressMode = useCallback(() => {
    if (mode === 'closeable') {
      setVisible(false)
      close()
    }
  }, [close, mode])
  const modeIcon = mode === 'closeable' ? 'CloseOutlined' : 'RightOutlined'
  if (!visible) return null
  const left = renderLeftIcon?.(resolvedIconColor, token.iconSize)
  const right = renderRightIcon?.(resolvedIconColor, token.iconSize)
  return (
    <TouchableWithoutFeedback {...props}>
      <View
        style={[
          {
            flexDirection: 'row',
            paddingVertical: size === 'm' ? token.paddingVertical : token.paddingVerticalSM,
            paddingHorizontal: size === 'm' ? token.paddingHorizontal : token.paddingHorizontalSM,
            backgroundColor: resolvedBackground,
            borderRadius: square ? 0 : token.borderRadius,
            borderColor: resolvedBorder,
            borderWidth: bordered ? themeToken.lineWidth : 0,
          },
          style,
        ]}
      >
        {left}
        {!isNil(message) ? (
          typeof message === 'object' ? (
            message
          ) : (
            <Text
              numberOfLines={wrapable ? undefined : 1}
              style={[
                {
                  flex: 1,
                  color: resolvedColor,
                  fontSize: token.textFontSize,
                  lineHeight: token.textLineHeight,
                  marginLeft: left ? token.iconMarginHorizontal : 0,
                  marginRight: right || mode ? token.iconMarginHorizontal : 0,
                },
                messageTextStyle,
              ]}
            >
              {message}
            </Text>
          )
        ) : null}
        {right}
        {mode ? (
          <Icon
            name={modeIcon}
            testID="NOTICE_BAR_ICON"
            color={resolvedIconColor}
            size={token.iconSize}
            onPress={onPressMode}
            pointerEvents={mode === 'closeable' ? 'auto' : 'none'}
          />
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  )
}

export default memo(NoticeBar)
