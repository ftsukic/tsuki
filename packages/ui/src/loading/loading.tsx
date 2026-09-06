import { useToken } from '../theme'
import type { LoadingProps } from './interface'
import Circular from './loading-circular'
import Spinner from './loading-spinner'
import isNil from 'lodash/isNil'
import { isValidElement, memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  loading: { flexDirection: 'row', alignItems: 'center' },
  vertical: { flexDirection: 'column' },
})

export function Loading({
  children,
  style,
  theme,
  textStyle,
  size,
  color,
  textSize,
  vertical = false,
  type = 'circular',
  loadingIcon,
  ...props
}: LoadingProps) {
  const { components } = useToken()
  const token = { ...components.Loading, ...theme }
  const iconSize = size ?? token.iconSize
  const iconColor = color ?? token.iconColor
  const text = !isNil(children) ? (
    isValidElement(children) ? (
      children
    ) : (
      <Text
        style={[
          {
            fontSize: textSize ?? token.textFontSize,
            color: color ?? token.textColor,
            marginLeft: vertical ? 0 : token.gap,
            marginTop: vertical ? token.gap : 0,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    )
  ) : null
  const icon = isValidElement(loadingIcon) ? (
    loadingIcon
  ) : typeof loadingIcon === 'function' ? (
    loadingIcon(iconSize, iconColor)
  ) : type === 'circular' ? (
    <Circular size={iconSize} color={iconColor} duration={token.animationDuration} />
  ) : (
    <Spinner size={iconSize} color={iconColor} duration={token.animationDuration} />
  )
  return (
    <View {...props} style={[styles.loading, vertical && styles.vertical, style]}>
      {icon}
      {text}
    </View>
  )
}

export default memo(Loading)
