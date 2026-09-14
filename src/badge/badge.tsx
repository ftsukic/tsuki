import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getBadgeToken } from './token'
import type { BadgeProps, BadgeStatus } from './types'
import { forwardRef, isValidElement, useState } from 'react'
import { View } from 'react-native'
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  View as ViewComponent,
  ViewStyle,
} from 'react-native'
import { Text } from '../text'

function isRenderable(value: BadgeProps['children'] | BadgeProps['count']): boolean {
  return value !== undefined && value !== null && value !== false
}

function isZero(value: BadgeProps['count']): boolean {
  return typeof value === 'number' && value === 0
}

function getTextContent(value: BadgeProps['count']): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    const parts = value.map(getTextContent)
    return parts.every((part) => part !== undefined) ? parts.join('') : undefined
  }
  if (isValidElement<{ children?: BadgeProps['count'] }>(value)) {
    return getTextContent(value.props.children)
  }
  return undefined
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

function renderValue(
  value: BadgeProps['count'] | BadgeProps['text'],
  style: StyleProp<TextStyle>,
  singleLine = false,
  wrapCustom = false,
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text
        ellipsizeMode={singleLine ? 'clip' : undefined}
        numberOfLines={singleLine ? 1 : undefined}
        style={style}
      >
        {value}
      </Text>
    )
  }
  if (wrapCustom) {
    return (
      <View style={{ alignSelf: 'flex-start', flexShrink: 0, overflow: 'visible' }}>{value}</View>
    )
  }
  return value
}

function getIndicatorTransform(
  anchorWidth: number | undefined,
  anchorHeight: number | undefined,
  offset: BadgeProps['offset'],
): ViewStyle['transform'] | undefined {
  if (anchorWidth === undefined && anchorHeight === undefined && offset === undefined)
    return undefined

  return [
    { translateX: (anchorWidth ?? 0) + (offset?.[0] ?? 0) },
    { translateY: (anchorHeight ?? 0) + (offset?.[1] ?? 0) },
  ]
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
  const hasStatusText = Boolean(status && isRenderable(text))
  const normalizedOverflowCount =
    Number.isFinite(overflowCount) && overflowCount > 0 ? overflowCount : 99
  const showCount = !status && !dot && hasCount && (!isZero(count) || showZero)
  const visible = Boolean(status || dot || showCount)
  const height = size === 'small' ? token.heightSM : token.height
  const minWidth = size === 'small' ? token.minWidthSM : token.minWidth
  const paddingHorizontal = size === 'small' ? token.paddingHorizontalSM : token.paddingHorizontal
  const fontSize = size === 'small' ? token.fontSizeSM : token.fontSize
  const indicatorColor = color ?? (status ? resolveStatusColor(status, token) : token.color)
  const [indicatorLayout, setIndicatorLayout] = useState<
    { width: number; height: number } | undefined
  >()
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

  const countValue =
    typeof count === 'number' && count > normalizedOverflowCount
      ? `${normalizedOverflowCount}+`
      : count
  const countValueText = getTextContent(countValue)
  const countMinWidth = countValueText
    ? Math.max(minWidth, countValueText.length * fontSize)
    : minWidth

  const defaultAnchorWidth = dot || (status && !hasStatusText) ? token.dotSize : height
  const defaultAnchorHeight = dot
    ? token.dotSize
    : status
      ? hasStatusText
        ? token.fontSize + 4
        : token.dotSize
      : height
  const indicatorTransform = getIndicatorTransform(
    hasChildren ? (indicatorLayout?.width ?? defaultAnchorWidth) / 2 : undefined,
    hasChildren ? -(indicatorLayout?.height ?? defaultAnchorHeight) / 2 : undefined,
    offset,
  )
  const indicatorPosition: ViewStyle = hasChildren
    ? { position: 'absolute', top: 0, right: 0 }
    : { alignSelf: 'flex-start' }

  const handleIndicatorLayout = (event: LayoutChangeEvent) => {
    const { width, height: measuredHeight } = event.nativeEvent.layout
    if (!Number.isFinite(width) || !Number.isFinite(measuredHeight)) return
    setIndicatorLayout((current) =>
      current?.width === width && current.height === measuredHeight
        ? current
        : { width, height: measuredHeight },
    )
  }

  const countIndicatorStyle: ViewStyle = {
    ...indicatorPosition,
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderCurve: 'circular',
    boxSizing: 'border-box',
    flexDirection: 'row',
    flexShrink: 0,
    height: dot ? token.dotSize : height,
    justifyContent: 'center',
    minHeight: dot ? token.dotSize : height,
    minWidth: dot ? token.dotSize : countMinWidth,
    transform: indicatorTransform,
  }
  const statusIndicatorStyle: ViewStyle = {
    ...indicatorPosition,
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 0,
    flexDirection: 'row',
    flexShrink: 0,
    gap: token.statusGap,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    transform: indicatorTransform,
  }

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
          onLayout={hasChildren && !dot ? handleIndicatorLayout : undefined}
          style={[
            status
              ? statusIndicatorStyle
              : {
                  ...countIndicatorStyle,
                  borderRadius: dot ? token.dotSize / 2 : Math.min(token.borderRadius, height / 2),
                  borderWidth: dot || !hasChildren ? 0 : token.borderWidth,
                  borderColor: token.borderColor,
                  backgroundColor: indicatorColor,
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
                      color: token.statusTextColor,
                      fontFamily: token.fontFamily,
                      fontSize: token.fontSize,
                      flexShrink: 0,
                    },
                    semantic?.text,
                  ])
                : null}
            </>
          ) : dot ? null : (
            renderValue(
              countValue,
              [
                {
                  color: token.textColor,
                  fontFamily: token.fontFamily,
                  fontSize,
                  includeFontPadding: false,
                  lineHeight: height,
                  overflow: 'visible',
                  textAlign: 'center',
                  flexShrink: 0,
                },
                semantic?.text,
              ],
              true,
              true,
            )
          )}
        </View>
      ) : null}
    </View>
  )
})

Badge.displayName = 'Badge'
