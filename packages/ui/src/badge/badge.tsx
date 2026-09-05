import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getBadgeToken } from './token'
import type { BadgeProps, BadgeStatus } from './interface'
import { forwardRef } from 'react'
import { Text, View } from 'react-native'
import type { StyleProp, TextStyle, View as ViewComponent, ViewStyle } from 'react-native'

function isRenderable(value: BadgeProps['children'] | BadgeProps['count']): boolean {
  return value !== undefined && value !== null && value !== false
}

function isZero(value: BadgeProps['count']): boolean {
  return typeof value === 'number' && value === 0
}

function resolveStatusColor(status: BadgeStatus, token: ReturnType<typeof getBadgeToken>) {
  switch (status) {
    case 'success':
      return token.successColor
    case 'processing':
      return token.processingColor
    case 'default':
      return token.defaultColor
    case 'warning':
      return token.warningColor
    case 'error':
    default:
      return token.errorColor
  }
}

function renderValue(value: BadgeProps['count'] | BadgeProps['text'], style: StyleProp<TextStyle>) {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

export const Badge = forwardRef<ViewComponent, BadgeProps>(function Badge(
  {
    children,
    color,
    count,
    dot = false,
    offset,
    overflowCount = 99,
    showZero = false,
    size = 'medium',
    status,
    text,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Badge', getBadgeToken)
  const hasChildren = isRenderable(children)
  const hasCount = isRenderable(count)
  const normalizedOverflowCount =
    Number.isFinite(overflowCount) && overflowCount > 0 ? overflowCount : 99
  const showCount = !status && !dot && hasCount && (!isZero(count) || showZero)
  const visible = Boolean(status || dot || showCount)
  const height = size === 'small' ? token.heightSM : token.height
  const minWidth = size === 'small' ? token.minWidthSM : token.minWidth
  const paddingHorizontal = size === 'small' ? token.paddingHorizontalSM : token.paddingHorizontal
  const fontSize = size === 'small' ? token.fontSizeSM : token.fontSize
  const indicatorColor = color ?? (status ? resolveStatusColor(status, token) : token.color)
  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      children,
      color,
      count,
      dot,
      offset,
      overflowCount,
      showZero,
      size,
      status,
      text,
      style,
      styles,
    },
    state: { visible, hasChildren },
  })

  const indicatorBase: ViewStyle = hasChildren
    ? {
        position: 'absolute',
        top: -(height / 2),
        right: -(height / 2),
        minHeight: height,
        minWidth,
      }
    : {
        minHeight: height,
        minWidth,
      }
  const indicatorOffset = offset
    ? { transform: [{ translateX: offset[0] }, { translateY: offset[1] }] }
    : undefined
  const countValue =
    typeof count === 'number' && count > normalizedOverflowCount
      ? `${normalizedOverflowCount}+`
      : count

  if (!hasChildren && !visible) return null

  return (
    <View
      ref={ref}
      {...viewProps}
      style={[{ position: 'relative', alignSelf: 'flex-start' }, semantic?.root, style]}
    >
      {children}
      {visible ? (
        <View
          pointerEvents="none"
          style={[
            indicatorBase,
            {
              alignItems: 'center',
              flexDirection: status && isRenderable(text) ? 'row' : undefined,
              gap: status && isRenderable(text) ? 4 : undefined,
              justifyContent: 'center',
              borderRadius: dot || status ? token.dotSize / 2 : token.borderRadius,
              borderWidth: dot || status ? 0 : hasChildren ? token.borderWidth : 0,
              borderColor: token.borderColor,
              backgroundColor: dot ? indicatorColor : status ? 'transparent' : indicatorColor,
              paddingHorizontal: showCount ? paddingHorizontal : 0,
              ...(dot
                ? {
                    width: token.dotSize,
                    height: token.dotSize,
                    minWidth: token.dotSize,
                    minHeight: token.dotSize,
                  }
                : undefined),
            },
            indicatorOffset,
            semantic?.indicator,
          ]}
        >
          {status ? (
            <>
              <View
                style={[
                  {
                    width: token.dotSize,
                    height: token.dotSize,
                    borderRadius: token.dotSize / 2,
                    backgroundColor: indicatorColor,
                  },
                  semantic?.dot,
                ]}
              />
              {isRenderable(text)
                ? renderValue(text, [
                    {
                      color: token.textColor,
                      fontSize,
                      lineHeight: height,
                    },
                    semantic?.text,
                  ])
                : null}
            </>
          ) : dot ? null : (
            renderValue(countValue, [
              {
                color: token.textColor,
                fontSize,
                lineHeight: height,
                textAlign: 'center',
              },
              semantic?.text,
            ])
          )}
        </View>
      ) : null}
    </View>
  )
})

Badge.displayName = 'Badge'
