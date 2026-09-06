import { renderTextLikeJSX } from '../helpers'
import { Icon } from '../icon'
import { Space } from '../space'
import { useToken } from '../theme'
import type { ResultProps, ResultStatus } from './interface'
import { memo } from 'react'
import { View } from 'react-native'

function StatusIcon({
  status,
  size,
  color,
}: {
  status: ResultStatus
  size: number
  color: string
}) {
  const props = { size, color }
  if (status === 'success') return <Icon name="CheckOutlined" {...props} />
  if (status === 'error') return <Icon name="CloseOutlined" {...props} />
  return <Icon name="WarningOutlined" {...props} />
}

export function Result({
  theme,
  subtitleTextStyle,
  titleTextStyle,
  title,
  subtitle,
  extra,
  renderIcon,
  status,
  ...props
}: ResultProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Result, ...theme }
  const color = {
    success: themeToken.colorSuccess,
    error: themeToken.colorError,
    info: themeToken.colorInfo,
    warning: themeToken.colorWarning,
  }[status]
  const iconSize = (token.iconSize / 4) * 3
  return (
    <Space {...props}>
      {renderIcon ? (
        renderIcon(color, iconSize)
      ) : (
        <View
          style={{
            width: token.iconSize,
            height: token.iconSize,
            borderRadius: token.iconSize / 2,
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: color,
          }}
        >
          <StatusIcon status={status} size={iconSize} color={themeToken.colorTextLightSolid} />
        </View>
      )}
      {renderTextLikeJSX(title, [
        {
          color: themeToken.colorText,
          fontSize: token.titleFontSize,
          lineHeight: token.titleLineHeight,
          textAlign: 'center',
        },
        titleTextStyle,
      ])}
      {renderTextLikeJSX(subtitle, [
        {
          color: themeToken.colorTextSecondary,
          fontSize: token.subtitleFontSize,
          lineHeight: token.subtitleLineHeight,
          textAlign: 'center',
        },
        subtitleTextStyle,
      ])}
      {extra}
    </Space>
  )
}

export default memo(Result)
