import { Icon } from '../icon'
import { useLocale } from '../locale'
import { Result } from '../result'
import { useToken } from '../theme'
import { emptyCustom } from './empty-custom'
import type { EmptyProps } from './interface'
import { memo } from 'react'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  empty: { justifyContent: 'center', alignItems: 'center' },
  full: { flex: 1 },
})

function Empty({
  testID,
  theme,
  text,
  style,
  textStyle,
  iconStyle,
  iconSize,
  icon,
  full = false,
}: EmptyProps) {
  const locale = useLocale().Empty
  const { components, token: themeToken } = useToken()
  const token = { ...components.Result, ...theme }
  const defaultIcon = (
    <Icon
      name={emptyCustom}
      size={iconSize ?? token.iconSize}
      color={themeToken.colorTextDisabled}
      style={iconStyle}
    />
  )
  return (
    <Result
      testID={testID}
      status="info"
      renderIcon={() => icon ?? defaultIcon}
      style={[styles.empty, full && styles.full, style]}
      subtitle={text ?? locale.text}
      subtitleTextStyle={[
        { color: themeToken.colorTextSecondary, fontSize: token.subtitleFontSize },
        textStyle,
      ]}
    />
  )
}

export default memo(Empty)
