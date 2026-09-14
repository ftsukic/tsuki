import { useCallback, useMemo, useRef, useState } from 'react'
import { Image, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { Text } from '../text'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getWatermarkStyles } from './style'
import { getWatermarkToken, WATERMARK_DEFAULTS } from './token'
import type { WatermarkProps } from './types'

export const MAX_WATERMARK_ROWS = 32
export const MAX_WATERMARK_COLUMNS = 32
export const MAX_WATERMARK_TILES = 1000

export interface WatermarkGridOptions {
  containerWidth: number
  containerHeight: number
  width: number
  height: number
  gapX: number
  gapY: number
  offsetX: number
  offsetY: number
}

export interface WatermarkGrid {
  rowCount: number
  columnCount: number
  startX: number
  startY: number
}

function positiveOrFallback(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function nonNegativeOrFallback(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback
}

function finiteOrFallback(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback
}

function clampOpacity(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.min(1, Math.max(0, value))
}

function clampCount(value: number, maximum: number): number {
  return Math.min(maximum, Math.max(0, Math.floor(value)))
}

export function getWatermarkGrid({
  containerWidth,
  containerHeight,
  width,
  height,
  gapX,
  gapY,
  offsetX,
  offsetY,
}: WatermarkGridOptions): WatermarkGrid {
  const normalizedWidth = positiveOrFallback(width, 1)
  const normalizedHeight = positiveOrFallback(height, 1)
  const normalizedGapX = nonNegativeOrFallback(gapX, 0)
  const normalizedGapY = nonNegativeOrFallback(gapY, 0)
  const tileWidth = positiveOrFallback(normalizedWidth + normalizedGapX, normalizedWidth)
  const tileHeight = positiveOrFallback(normalizedHeight + normalizedGapY, normalizedHeight)
  const normalizedOffsetX = finiteOrFallback(offsetX, 0)
  const normalizedOffsetY = finiteOrFallback(offsetY, 0)
  const safeContainerWidth = Number.isFinite(containerWidth) ? Math.max(0, containerWidth) : 0
  const safeContainerHeight = Number.isFinite(containerHeight) ? Math.max(0, containerHeight) : 0
  const calculatedColumns =
    safeContainerWidth === 0
      ? 0
      : Math.ceil((safeContainerWidth + Math.abs(normalizedOffsetX)) / tileWidth) + 2
  const calculatedRows =
    safeContainerHeight === 0
      ? 0
      : Math.ceil((safeContainerHeight + Math.abs(normalizedOffsetY)) / tileHeight) + 2
  const columnCount = clampCount(calculatedColumns, MAX_WATERMARK_COLUMNS)
  let rowCount = clampCount(calculatedRows, MAX_WATERMARK_ROWS)

  if (columnCount > 0 && rowCount * columnCount > MAX_WATERMARK_TILES) {
    rowCount = Math.min(rowCount, Math.floor(MAX_WATERMARK_TILES / columnCount))
  }

  return {
    rowCount,
    columnCount,
    startX: normalizedOffsetX - tileWidth,
    startY: normalizedOffsetY - tileHeight,
  }
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null
}

export function Watermark({
  children,
  content,
  gapX,
  gapY,
  height,
  image,
  imageResizeMode = 'contain',
  offsetX,
  offsetY,
  onLayout,
  opacity,
  rotate,
  style,
  styles,
  width,
  zIndex,
  ...viewProps
}: WatermarkProps) {
  const token = useComponentToken('Watermark', getWatermarkToken)
  const hasImage = hasValue(image)
  const hasContent = hasValue(content)
  const resolvedWidth = positiveOrFallback(width ?? token.width, WATERMARK_DEFAULTS.width)
  const resolvedHeight = positiveOrFallback(height ?? token.height, WATERMARK_DEFAULTS.height)
  const resolvedGapX = nonNegativeOrFallback(gapX ?? token.gapX, WATERMARK_DEFAULTS.gapX)
  const resolvedGapY = nonNegativeOrFallback(gapY ?? token.gapY, WATERMARK_DEFAULTS.gapY)
  const resolvedOffsetX = finiteOrFallback(offsetX, 0)
  const resolvedOffsetY = finiteOrFallback(offsetY, 0)
  const resolvedRotate = finiteOrFallback(
    rotate,
    finiteOrFallback(token.rotate, WATERMARK_DEFAULTS.rotate),
  )
  const resolvedOpacity = clampOpacity(
    opacity,
    clampOpacity(token.opacity, WATERMARK_DEFAULTS.opacity),
  )
  const resolvedZIndex = finiteOrFallback(
    zIndex,
    finiteOrFallback(token.zIndex, WATERMARK_DEFAULTS.zIndex),
  )
  const [layout, setLayout] = useState({ width: 0, height: 0 })
  const previousLayout = useRef(layout)
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextLayout = event.nativeEvent.layout
      if (Number.isFinite(nextLayout.width) && Number.isFinite(nextLayout.height)) {
        const normalizedLayout = {
          width: Math.max(0, nextLayout.width),
          height: Math.max(0, nextLayout.height),
        }
        if (
          previousLayout.current.width !== normalizedLayout.width ||
          previousLayout.current.height !== normalizedLayout.height
        ) {
          previousLayout.current = normalizedLayout
          setLayout(normalizedLayout)
        }
      }
      onLayout?.(event)
    },
    [onLayout],
  )
  const resolvedProps: WatermarkProps = {
    ...viewProps,
    children,
    content,
    gapX,
    gapY,
    height,
    image,
    imageResizeMode,
    offsetX,
    offsetY,
    onLayout,
    opacity,
    rotate,
    style,
    styles,
    width,
    zIndex,
  }
  const state = { hasContent, hasImage }
  const semantic = resolveStyles(styles, { props: resolvedProps, state })
  const resolved = getWatermarkStyles(token, {
    height: resolvedHeight,
    opacity: resolvedOpacity,
    rotate: resolvedRotate,
    width: resolvedWidth,
    zIndex: resolvedZIndex,
  })
  const grid = useMemo(
    () =>
      getWatermarkGrid({
        containerHeight: layout.height,
        containerWidth: layout.width,
        gapX: resolvedGapX,
        gapY: resolvedGapY,
        height: resolvedHeight,
        offsetX: resolvedOffsetX,
        offsetY: resolvedOffsetY,
        width: resolvedWidth,
      }),
    [
      layout.height,
      layout.width,
      resolvedGapX,
      resolvedGapY,
      resolvedHeight,
      resolvedOffsetX,
      resolvedOffsetY,
      resolvedWidth,
    ],
  )
  const contentText = Array.isArray(content) ? content.join('\n') : content
  const hasWatermark = hasImage || hasContent

  return (
    <View {...viewProps} onLayout={handleLayout} style={[resolved.root, semantic?.root, style]}>
      {children}
      {hasWatermark ? (
        <View
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[resolved.overlay, semantic?.overlay]}
        >
          {Array.from({ length: grid.rowCount * grid.columnCount }, (_, index) => {
            const row = Math.floor(index / grid.columnCount)
            const column = index % grid.columnCount
            return (
              <View
                key={`${row}-${column}`}
                style={[
                  resolved.mark,
                  semantic?.mark,
                  {
                    left: grid.startX + column * (resolvedWidth + resolvedGapX),
                    top: grid.startY + row * (resolvedHeight + resolvedGapY),
                  },
                ]}
              >
                {hasImage ? (
                  <Image
                    resizeMode={imageResizeMode}
                    source={image}
                    style={[resolved.image, semantic?.image]}
                  />
                ) : (
                  <Text style={[resolved.text, semantic?.text]}>{contentText}</Text>
                )}
              </View>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

Watermark.displayName = 'Watermark'
