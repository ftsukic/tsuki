import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getBadgeToken } from './token'
import type { BadgePosition, BadgeProps, BadgeStatus } from './types'
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

function isRenderable(value: BadgeProps['children']): boolean {
  return value !== undefined && value !== null && value !== false
}

function isZero(value: BadgeProps['content']): boolean {
  return typeof value === 'number' && value === 0
}

function getTextContent(value: BadgeProps['content']): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    const parts = value.map(getTextContent)
    return parts.every((part) => part !== undefined) ? parts.join('') : undefined
  }
  if (isValidElement<{ children?: BadgeProps['content'] }>(value)) {
    return getTextContent(value.props.children)
  }
  return undefined
}

function resolveMax(max: BadgeProps['max'], overflowCount: BadgeProps['overflowCount']) {
  const value = max !== undefined ? max : overflowCount
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
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
  value: BadgeProps['content'] | BadgeProps['text'],
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

function getIndicatorPositionStyle(position: BadgePosition): ViewStyle {
  switch (position) {
    case 'top-left':
      return { position: 'absolute', top: 0, left: 0 }
    case 'bottom-right':
      return { position: 'absolute', bottom: 0, right: 0 }
    case 'bottom-left':
      return { position: 'absolute', bottom: 0, left: 0 }
    case 'top-right':
    default:
      return { position: 'absolute', top: 0, right: 0 }
  }
}

function getIndicatorTransform(
  position: BadgePosition,
  width: number,
  height: number,
  offset: BadgeProps['offset'],
): ViewStyle['transform'] {
  const translateX = position.endsWith('right') ? width / 2 : -width / 2
  const translateY = position.startsWith('top') ? -height / 2 : height / 2

  return [
    { translateX: translateX + (offset?.[0] ?? 0) },
    { translateY: translateY + (offset?.[1] ?? 0) },
  ]
}

export const Badge = forwardRef<ViewComponent, BadgeProps>(function Badge(
  {
    children,
    color,
    content,
    count,
    dot = false,
    max,
    offset,
    overflowCount,
    position = 'top-right',
    showZero = true,
    size,
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
  const resolvedContent = content !== undefined ? content : count
  const resolvedMax = resolveMax(max, overflowCount)
  const hasContent = isRenderable(resolvedContent)
  const hasStatusText = Boolean(status && isRenderable(text))
  const showContent = !status && !dot && hasContent && (!isZero(resolvedContent) || showZero)
  const visible = Boolean(status || dot || showContent)
  const height = size === 'medium' ? token.height : token.heightSM
  const minWidth = size === 'medium' ? token.minWidth : token.minWidthSM
  const paddingHorizontal = size === 'medium' ? token.paddingHorizontal : token.paddingHorizontalSM
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
      content,
      count,
      dot,
      max,
      offset,
      overflowCount,
      position,
      showZero,
      size,
      status,
      text,
      style,
      styles,
    },
    state: { visible, hasChildren },
  })

  const contentValue =
    typeof resolvedContent === 'number' &&
    resolvedMax !== undefined &&
    resolvedContent > resolvedMax
      ? `${resolvedMax}+`
      : resolvedContent
  const contentValueText = getTextContent(contentValue)
  const contentMinWidth = contentValueText
    ? Math.max(minWidth, contentValueText.length * fontSize)
    : minWidth

  const defaultIndicatorWidth = dot || (status && !hasStatusText) ? token.dotSize : height
  const defaultIndicatorHeight = dot
    ? token.dotSize
    : status
      ? hasStatusText
        ? token.fontSize + 4
        : token.dotSize
      : height
  const indicatorTransform = hasChildren
    ? getIndicatorTransform(
        position,
        indicatorLayout?.width ?? defaultIndicatorWidth,
        indicatorLayout?.height ?? defaultIndicatorHeight,
        offset,
      )
    : undefined
  const indicatorPosition: ViewStyle = hasChildren
    ? getIndicatorPositionStyle(position)
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
    minWidth: dot ? token.dotSize : contentMinWidth,
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
                  borderWidth: dot ? 0 : token.borderWidth,
                  borderColor: token.borderColor,
                  backgroundColor: indicatorColor,
                  paddingHorizontal: showContent ? paddingHorizontal : 0,
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
              contentValue,
              [
                {
                  color: token.textColor,
                  fontFamily: token.fontFamily,
                  fontSize,
                  fontWeight: token.fontWeight,
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
