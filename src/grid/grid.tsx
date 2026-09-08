import { Children, useMemo } from 'react'
import { Col, Row } from '../layout'
import { GridContext, getGridContextValue } from './context'
import { GridItem } from './grid-item'
import type { GridProps } from './interface'

export function normalizeColumnNum(columnNum: number): number {
  if (!Number.isFinite(columnNum)) return 4
  return Math.min(24, Math.max(1, Math.floor(columnNum)))
}

export function getGridItemSpan(columnNum = 4): number {
  return 24 / normalizeColumnNum(columnNum)
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
  const context = useMemo(
    () =>
      getGridContextValue({
        border,
        center,
        columnNum: resolvedColumnNum,
        gutter,
        square,
      }),
    [border, center, gutter, resolvedColumnNum, square],
  )
  const items = Children.toArray(children)

  return (
    <GridContext.Provider value={context}>
      <Row {...viewProps} gap={gutter} style={[{ marginHorizontal: 0, marginVertical: 0 }, style]}>
        {items.map((item, index) => (
          <Col key={index} span={context.span}>
            {item}
          </Col>
        ))}
      </Row>
    </GridContext.Provider>
  )
}

export const Grid = Object.assign(GridComponent, { Item: GridItem })
