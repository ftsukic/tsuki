import { Children, useMemo } from 'react'
import { View } from 'react-native'
import { GridContext, getGridContextValue } from './context'
import { GridItem } from './grid-item'
import type { GridProps } from './interface'

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
    () =>
      getGridContextValue({
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
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -halfGutter,
            marginVertical: -halfGutter,
          }}
        >
          {items.map((item, index) => (
            <View
              key={index}
              style={{
                flexBasis: `${100 / resolvedColumnNum}%`,
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
