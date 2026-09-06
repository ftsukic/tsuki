import { forwardRef, useId } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, G, Image as SvgImage, Pattern, Rect, Text as SvgText } from 'react-native-svg'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import type { WatermarkImageSource, WatermarkProps } from './interface'
import { getWatermarkToken } from './token'

function normalizePositive(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && (value as number) > 0 ? (value as number) : fallback
}

function normalizeNonNegative(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && (value as number) >= 0 ? (value as number) : fallback
}

function normalizeFinite(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? (value as number) : fallback
}

function normalizeOpacity(value: number | undefined) {
  if (!Number.isFinite(value)) return undefined
  return Math.min(1, Math.max(0, value as number))
}

function hasImageSource(source: WatermarkImageSource | undefined) {
  return source !== undefined && source !== null && source !== ''
}

function hasTextContent(content: string | undefined) {
  return content !== undefined && content.length > 0
}

function createPatternId(id: string) {
  const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '')
  return `watermark-${sanitized || 'pattern'}`
}

export const Watermark = forwardRef<View, WatermarkProps>(function Watermark(
  {
    content,
    image,
    width: rawWidth,
    height: rawHeight,
    gapX: rawGapX,
    gapY: rawGapY,
    rotate: rawRotate,
    opacity: rawOpacity,
    textColor,
    zIndex: rawZIndex,
    fullPage = false,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Watermark', getWatermarkToken)
  const patternId = createPatternId(useId())
  const width = normalizePositive(rawWidth, token.width)
  const height = normalizePositive(rawHeight, token.height)
  const gapX = normalizeNonNegative(rawGapX, token.gapX)
  const gapY = normalizeNonNegative(rawGapY, token.gapY)
  const rotate = normalizeFinite(rawRotate, token.rotate)
  const opacity = normalizeOpacity(rawOpacity)
  const zIndex = normalizeFinite(rawZIndex, token.zIndex)
  const imageMode = hasImageSource(image)
  const textMode = !imageMode && hasTextContent(content)
  const mode = imageMode ? 'image' : textMode ? 'text' : null
  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      content,
      image,
      width: rawWidth,
      height: rawHeight,
      gapX: rawGapX,
      gapY: rawGapY,
      rotate: rawRotate,
      opacity: rawOpacity,
      textColor,
      zIndex: rawZIndex,
      fullPage,
      style,
      styles,
    },
    state: { mode: mode ?? 'text' },
  })

  if (!mode) return null

  const resolvedTextColor = textColor ?? token.textColor
  const patternWidth = width + gapX
  const patternHeight = height + gapY
  const contentTransform = `rotate(${rotate} ${width / 2} ${height / 2})`
  const scopeStyle = fullPage
    ? StyleSheet.absoluteFillObject
    : {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%' as const,
        height: '100%' as const,
      }

  return (
    <View
      ref={ref}
      {...viewProps}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[scopeStyle, { zIndex }, semantic?.root, style]}
    >
      <Svg
        width="100%"
        height="100%"
        opacity={opacity}
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, semantic?.canvas]}
      >
        <Defs>
          <Pattern
            id={patternId}
            x={0}
            y={0}
            width={patternWidth}
            height={patternHeight}
            patternUnits="userSpaceOnUse"
          >
            <G transform={contentTransform}>
              {imageMode ? (
                <SvgImage
                  href={image}
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : (
                <SvgText
                  x={0}
                  y={token.fontSize}
                  fill={resolvedTextColor}
                  fontSize={token.fontSize}
                >
                  {content}
                </SvgText>
              )}
            </G>
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
    </View>
  )
})

Watermark.displayName = 'Watermark'
