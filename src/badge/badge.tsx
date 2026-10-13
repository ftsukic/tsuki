import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getBadgeToken } from './token'
import type { BadgePosition, BadgeProps, BadgeStatus } from './types'
import { Fragment, cloneElement, forwardRef, isValidElement, useState } from 'react'
import { normalizeBadgeContent, getBadgeText } from './normalize'
import { View } from 'react-native'
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  View as ViewComponent,
  ViewStyle,
} from 'react-native'
import { Text } from '../text'

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
  value: BadgeProps['content'],
  style: StyleProp<TextStyle>,
  singleLine = false,
) {
  return normalizeBadgeContent(value).map((node, index) =>
    typeof node === 'string' || typeof node === 'number' ? (
      <Text
        key={`text-${index}`}
        ellipsizeMode={singleLine ? 'clip' : undefined}
        numberOfLines={singleLine ? 1 : undefined}
        style={style}
      >
        {node}
      </Text>
    ) : isValidElement(node) ? (
      cloneElement(node, { key: node.key ?? `node-${index}` })
    ) : (
      <Fragment key={`node-${index}`}>{node}</Fragment>
    ),
  )
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
    dot = false,
    max,
    offset,
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
  const childNodes = normalizeBadgeContent(children)
  const hasChildren = childNodes.length > 0
  const resolvedMax = typeof max === 'number' && Number.isFinite(max) && max >= 0 ? max : undefined
  const hasContent = normalizeBadgeContent(content).length > 0
  const hasStatusText = Boolean(status && normalizeBadgeContent(text).length > 0)
  const showContent = !status && !dot && hasContent && (content !== 0 || showZero)
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
      dot,
      max,
      offset,
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
    typeof content === 'number' && resolvedMax !== undefined && content > resolvedMax
      ? `${resolvedMax}+`
      : content
  const contentValueText = getBadgeText(contentValue)
  const contentMinWidth = contentValueText
    ? Math.max(minWidth, contentValueText.length * fontSize)
    : minWidth

  const defaultIndicatorWidth = dot || status ? token.dotSize : contentMinWidth
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

  const statusLabels = {
    success: '成功',
    processing: '处理中',
    default: '默认状态',
    error: '错误',
    warning: '警告',
  }
  const defaultLabel = status
    ? (getBadgeText(text) ?? statusLabels[status])
    : dot
      ? '提示'
      : getBadgeText(contentValue)
  const accessibilityLabel =
    viewProps.accessibilityLabel ?? (!hasChildren ? defaultLabel : undefined)
  const accessible =
    viewProps.accessible ?? (!hasChildren && accessibilityLabel !== undefined ? true : undefined)

  return (
    <View
      ref={ref}
      {...viewProps}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      style={[{ position: 'relative', alignSelf: 'flex-start' }, semantic?.root, style]}
    >
      {renderValue(children, undefined)}
      {visible ? (
        <View
          pointerEvents="none"
          onLayout={hasChildren ? handleIndicatorLayout : undefined}
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
            !status ? semantic?.indicator : undefined,
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
                  semantic?.indicator,
                ]}
              />
              {hasStatusText
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
                semantic?.content,
              ],
              true,
            )
          )}
        </View>
      ) : null}
    </View>
  )
})

Badge.displayName = 'Badge'
