import { Children, isValidElement, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import type { LayoutRectangle } from 'react-native'
import { Col } from './col'
import RowContext, { emptyRowSpace, type RowSpace } from './context'
import { normalizeGutter, normalizeOffset, normalizeSpan } from './normalize'
import type { ColProps, RowProps } from './types'

function isDirectColChild(child: ReactNode): child is ReactElement<ColProps> {
  return isValidElement<ColProps>(child) && child.type === Col
}

// 测量完成前使用栅格分组；之后以原生布局的行交集为准，支持不同高度和样式覆盖。
function getRows(items: ReactNode[], layouts: Record<string, LayoutRectangle>, wrap: boolean) {
  const cols = items.filter(isDirectColChild)
  const measured = cols.every((col) => layouts[String(col.key)])
  const rows: ReactElement<ColProps>[][] = []
  let width = 0
  let top = 0
  let bottom = 0

  cols.forEach((col) => {
    const size = normalizeOffset(col.props.offset) + normalizeSpan(col.props.span)
    const layout = layouts[String(col.key)]
    const last = rows[rows.length - 1]
    const sameLine = measured
      ? (layout.y < bottom && layout.y + layout.height > top) || layout.y === top
      : width + size <= 24

    if (!last || (wrap && !sameLine)) {
      rows.push([col])
      width = size
      if (layout) {
        top = layout.y
        bottom = layout.y + layout.height
      }
    } else {
      last.push(col)
      width += size
      if (layout) {
        top = Math.max(top, layout.y)
        bottom = Math.min(bottom, layout.y + layout.height)
      }
    }
  })

  return { measured, rows }
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
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({})
  const items = Children.toArray(children)
  const effectiveWrap =
    (StyleSheet.flatten(style)?.flexWrap ?? (wrap ? 'wrap' : 'nowrap')) !== 'nowrap'
  const { measured, rows } = getRows(items, layouts, effectiveWrap)
  const spaces = new Map<string, RowSpace>()

  rows.forEach((row) => {
    const ordered = measured
      ? [...row].sort((a, b) => layouts[String(a.key)].x - layouts[String(b.key)].x)
      : row
    ordered.forEach((col, index) => {
      spaces.set(String(col.key), {
        ...emptyRowSpace,
        left: index === 0 ? 0 : horizontalGutter / 2,
        right: index === ordered.length - 1 ? 0 : horizontalGutter / 2,
      })
    })
  })

  return (
    <RowContext.Provider value={{ spaces: [emptyRowSpace] }}>
      <View
        {...restProps}
        style={[
          {
            alignItems: align,
            flexDirection: 'row',
            flexWrap: wrap ? 'wrap' : 'nowrap',
            justifyContent: justify,
            rowGap: effectiveWrap ? verticalGutter : 0,
          },
          style,
        ]}
      >
        {items.map((item) => {
          if (!isDirectColChild(item)) return item
          const key = String(item.key)
          return (
            <RowContext.Provider
              key={key}
              value={{
                spaces: [spaces.get(key) ?? emptyRowSpace],
                onLayout: (layout) => {
                  setLayouts((previous) => {
                    const old = previous[key]
                    if (
                      old &&
                      old.x === layout.x &&
                      old.y === layout.y &&
                      old.width === layout.width &&
                      old.height === layout.height
                    )
                      return previous
                    return { ...previous, [key]: layout }
                  })
                },
              }}
            >
              {item}
            </RowContext.Provider>
          )
        })}
      </View>
    </RowContext.Provider>
  )
}
