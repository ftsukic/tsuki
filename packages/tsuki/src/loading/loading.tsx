import { Fragment, isValidElement, memo } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { ColorValue } from 'react-native'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { LoadingIndicator } from './loading-indicator'
import { getLoadingStyles } from './style'
import { getLoadingToken } from './token'
import type { LoadingProps } from './types'
import { normalizeLoadingContent } from './content'

function isPrimitiveText(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

function isValidPositiveNumber(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value > 0
}

function toColorValue(value: ColorValue | undefined, fallback: string): ColorValue {
  return value ?? fallback
}

function LoadingComponent({
  children,
  type = 'circular',
  size,
  color,
  duration,
  vertical = false,
  textColor,
  textSize,
  style,
  styles,
  ...viewProps
}: LoadingProps) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Loading', getLoadingToken)
  const resolvedSize = isValidPositiveNumber(size) ? size : token.defaultSize
  const resolvedColor = toColorValue(color, token.defaultColor)
  const resolvedDuration = Number.isFinite(duration)
    ? Math.max(0, duration as number)
    : Math.max(0, token.animationDuration)
  const resolvedTextSize = isValidPositiveNumber(textSize) ? textSize : token.textFontSize
  const resolvedTextColor = toColorValue(textColor, token.textColor)
  const resolvedProps: LoadingProps = {
    ...viewProps,
    children,
    color: resolvedColor,
    duration: resolvedDuration,
    size: resolvedSize,
    style,
    styles,
    textColor: resolvedTextColor,
    textSize: resolvedTextSize,
    type,
    vertical,
  }
  const state = { type, vertical }
  const resolved = getLoadingStyles(token, resolvedProps, state)
  const semantic = resolveStyles(styles, { props: resolvedProps, state })
  const content = normalizeLoadingContent(children)

  return (
    <View
      {...viewProps}
      accessible={viewProps.accessible ?? true}
      accessibilityRole="progressbar"
      accessibilityState={{ ...viewProps.accessibilityState, busy: true }}
      style={[resolved.root, semantic?.root, style]}
    >
      <View style={[resolved.indicator, semantic?.indicator]}>
        <LoadingIndicator
          color={resolvedColor}
          duration={resolvedDuration}
          motion={themeToken.motion}
          size={resolvedSize}
          type={type}
        />
      </View>
      {content.length > 0 ? (
        <View style={[resolved.content, semantic?.content]}>
          {content.map((child, index) => (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {isPrimitiveText(child) ? (
                <Text style={[resolved.text, semantic?.text]}>{child}</Text>
              ) : (
                child
              )}
            </Fragment>
          ))}
        </View>
      ) : null}
    </View>
  )
}

export const Loading = memo(LoadingComponent)
Loading.displayName = 'Loading'
