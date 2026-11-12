import { Children, useMemo } from 'react'
import { View } from 'react-native'
import { GridContext } from './context'
import { GridItem } from './grid-item'
import type { GridProps } from './types'

export function normalizeColumnNum(columnNum: number): number {
  if (!Number.isFinite(columnNum)) return 4
  return Math.min(24, Math.max(1, Math.floor(columnNum)))
}

function normalizeGutter(gutter: number): number {
  if (!Number.isFinite(gutter)) return 0
  return Math.max(0, gutter)
}

export function GridComponent({
  border = true,
  center = true,
  children,
  columnNum = 4,
  gutter = 0,
  square = false,
  style,
  ...viewProps
}: GridProps) {
  const resolvedColumnNum = normalizeColumnNum(columnNum)
  const resolvedGutter = normalizeGutter(gutter)
  const halfGutter = resolvedGutter / 2
  const context = useMemo(
    () => ({
      border,
      center,
      columnNum: resolvedColumnNum,
      gutter: resolvedGutter,
      square,
    }),
    [border, center, resolvedGutter, resolvedColumnNum, square],
  )
  const items = Children.toArray(children)

  return (
    <View {...viewProps} style={style}>
      <GridContext.Provider value={context}>
        <View
          accessible={false}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            minWidth: 0,
            marginHorizontal: -halfGutter,
            marginVertical: -halfGutter,
          }}
        >
          {items.map((item, index) => (
            <View
              key={index}
              accessible={false}
              style={{
                flexBasis: `${100 / resolvedColumnNum}%`,
                width: `${100 / resolvedColumnNum}%`,
                minWidth: 0,
                flexGrow: 0,
                flexShrink: 0,
                paddingHorizontal: halfGutter,
                paddingVertical: halfGutter,
              }}
            >
              {item}
            </View>
          ))}
        </View>
      </GridContext.Provider>
    </View>
  )
}

export const Grid = Object.assign(GridComponent, { Item: GridItem })
