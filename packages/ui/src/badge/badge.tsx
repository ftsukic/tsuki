import { useToken } from '../theme'
import type { BadgeProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'
import { Text, View } from 'react-native'

export function Badge({
  children,
  theme,
  count,
  dot = false,
  max,
  color,
  countStyle,
  countTextStyle,
  loading = false,
  showZero = false,
  offset,
  status,
  ...props
}: BadgeProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Badge, ...theme }
  const value = !isNil(max) && typeof count === 'number' && count > max ? `${max}+` : count
  const hasCount = !isNil(value) && (value !== 0 || showZero)
  const isMultipleWords = !dot && !isNil(value) && String(value).length > 1
  const statusColor = status
    ? {
        primary: themeToken.colorPrimary,
        success: themeToken.colorSuccess,
        warning: themeToken.colorWarning,
        error: themeToken.colorError,
      }[status]
    : themeToken.colorError
  const fixed = !isNil(children)
  return (
    <View {...props} collapsable={false}>
      {!loading && (hasCount || dot) ? (
        <View
          style={[
            {
              minWidth: dot ? token.dotSize : token.size,
              width: dot ? token.dotSize : undefined,
              height: dot ? token.dotSize : token.size,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              borderRadius: dot ? token.dotSize / 2 : token.borderRadius,
              paddingHorizontal: dot || !isMultipleWords ? 0 : token.paddingHorizontal,
              backgroundColor: color ?? statusColor,
              ...(fixed
                ? {
                    position: 'absolute' as const,
                    right: 0,
                    top: 0,
                    zIndex: 2,
                    transform: [
                      { translateX: offset?.[0] ?? (dot ? token.dotSize : token.size) / 2 },
                      { translateY: offset?.[1] ?? -(dot ? token.dotSize : token.size) / 2 },
                    ],
                  }
                : {}),
            },
            countStyle,
          ]}
        >
          {!dot ? (
            <Text
              style={[
                {
                  color: themeToken.colorTextLightSolid,
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeight,
                  textAlign: 'center',
                  height: token.size,
                  lineHeight: token.size,
                },
                countTextStyle,
              ]}
            >
              {value}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  )
}

export default memo(Badge)
