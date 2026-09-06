import type { WaterMarkSpacing } from './interface'

export const DEFAULT_WATER_MARK_GAP = [100, 100] as const
export const DEFAULT_WATER_MARK_WIDTH = 64

export function resolveWaterMarkWidth(
  width: number | undefined,
  legacyWidth: number | undefined,
  measuredTextWidth: number,
): number {
  if (width !== undefined) return width
  if (legacyWidth !== undefined) return legacyWidth
  return measuredTextWidth > 0 && Number.isFinite(measuredTextWidth)
    ? measuredTextWidth
    : DEFAULT_WATER_MARK_WIDTH
}

export interface WaterMarkLayoutOptions {
  containerWidth: number
  containerHeight: number
  markWidth: number
  markHeight: number
  gap?: WaterMarkSpacing
  offset?: WaterMarkSpacing
}

export interface WaterMarkPosition {
  column: number
  row: number
  left: number
  top: number
}

const finiteOr = (value: number | undefined, fallback: number): number =>
  value !== undefined && Number.isFinite(value) ? value : fallback

const normalizeGap = (gap: WaterMarkSpacing | undefined): [number, number] => {
  const [defaultGapX, defaultGapY] = DEFAULT_WATER_MARK_GAP
  const gapX = Math.max(0, finiteOr(gap?.[0], defaultGapX))
  const gapY = Math.max(0, finiteOr(gap?.[1], defaultGapY))
  return [gapX, gapY]
}

/**
 * Calculates enough watermark cells to cover the measured container.
 *
 * The origin follows Ant Design's pattern semantics: when offset is omitted,
 * the pattern starts at gap / 2 - gap / 2, which keeps the first cell aligned
 * with the container edge while still allowing explicit offsets to shift it.
 */
export function getWaterMarkPositions({
  containerWidth,
  containerHeight,
  markWidth,
  markHeight,
  gap,
  offset,
}: WaterMarkLayoutOptions): WaterMarkPosition[] {
  if (
    !Number.isFinite(containerWidth) ||
    !Number.isFinite(containerHeight) ||
    !Number.isFinite(markWidth) ||
    !Number.isFinite(markHeight) ||
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    markWidth <= 0 ||
    markHeight <= 0
  ) {
    return []
  }

  const [gapX, gapY] = normalizeGap(gap)
  const offsetX = finiteOr(offset?.[0], gapX / 2)
  const offsetY = finiteOr(offset?.[1], gapY / 2)
  const stepX = markWidth + gapX
  const stepY = markHeight + gapY
  const originX = offsetX - gapX / 2
  const originY = offsetY - gapY / 2

  // Include one extra cell on every edge so rotated text is not lost at the
  // boundary even though the logical cell itself starts outside the container.
  const firstColumn = Math.floor(-originX / stepX) - 1
  const lastColumn = Math.ceil((containerWidth - originX) / stepX) + 1
  const firstRow = Math.floor(-originY / stepY) - 1
  const lastRow = Math.ceil((containerHeight - originY) / stepY) + 1
  const positions: WaterMarkPosition[] = []

  for (let column = firstColumn; column <= lastColumn; column += 1) {
    for (let row = firstRow; row <= lastRow; row += 1) {
      positions.push({
        column,
        row,
        left: originX + column * stepX,
        top: originY + row * stepY,
      })
    }
  }

  return positions
}
