import { Children, isValidElement, useMemo } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View } from 'react-native'
import { Col } from './col'
import RowContext, { type RowContextValue, type RowSpace } from './context'
import { normalizeGutter, normalizeOffset, normalizeSpan } from './normalize'
import type { ColProps, RowProps } from './interface'

interface LogicalRow {
  indices: number[]
  width: number
}

function isDirectColChild(child: ReactNode): child is ReactElement<ColProps> {
  return isValidElement<ColProps>(child) && child.type === Col
}

function getLogicalRows(items: ReactNode[], wrap: boolean): LogicalRow[] {
  const rows: LogicalRow[] = []
  let current: LogicalRow = { indices: [], width: 0 }

  items.forEach((item, index) => {
    if (!isDirectColChild(item)) return

    const width = normalizeOffset(item.props.offset) + normalizeSpan(item.props.span)

    if (wrap && current.indices.length > 0 && current.width + width > 24) {
      rows.push(current)
      current = { indices: [], width: 0 }
    }

    current.indices.push(index)
    current.width += width
  })

  if (current.indices.length > 0) rows.push(current)
  return rows
}

function getColSpace(
  row: LogicalRow,
  position: number,
  horizontalGutter: number,
  verticalGutter: number,
  isLastRow: boolean,
): RowSpace {
  const isFirst = position === 0
  const isLast = position === row.indices.length - 1

  return {
    bottom: isLastRow ? 0 : verticalGutter,
    left: isFirst ? 0 : horizontalGutter / 2,
    right: isLast ? 0 : horizontalGutter / 2,
    top: 0,
  }
}

function getSpaces(
  items: ReactNode[],
  horizontalGutter: number,
  verticalGutter: number,
  wrap: boolean,
): Map<number, RowSpace> {
  const rows = getLogicalRows(items, wrap)
  const spaces = new Map<number, RowSpace>()

  rows.forEach((row, rowIndex) => {
    row.indices.forEach((index, position) => {
      spaces.set(
        index,
        getColSpace(
          row,
          position,
          horizontalGutter,
          wrap ? verticalGutter : 0,
          rowIndex === rows.length - 1,
        ),
      )
    })
  })

  return spaces
}

function getColContext(
  horizontalGutter: number,
  verticalGutter: number,
  space: RowSpace,
): RowContextValue {
  return {
    horizontalGutter,
    spaces: [space],
    verticalGutter,
  }
}

export function Row({
  align,
  children,
  gutter,
  justify,
  style,
  wrap = true,
  ...restProps
}: RowProps) {
  const [horizontalGutter, verticalGutter] = normalizeGutter(gutter)
  const items = Children.toArray(children)
  const spaces = useMemo(
    () => getSpaces(items, horizontalGutter, verticalGutter, wrap),
    [horizontalGutter, items, verticalGutter, wrap],
  )

  return (
    <View
      {...restProps}
      style={[
        {
          alignItems: align,
          flexDirection: 'row',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          justifyContent: justify,
        },
        style,
      ]}
    >
      {items.map((item, index) => {
        if (!isDirectColChild(item)) return item

        return (
          <RowContext.Provider
            key={item.key ?? index}
            value={getColContext(
              horizontalGutter,
              verticalGutter,
              spaces.get(index) ?? { bottom: 0, left: 0, right: 0, top: 0 },
            )}
          >
            {item}
          </RowContext.Provider>
        )
      })}
    </View>
  )
}
