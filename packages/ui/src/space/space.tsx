import { useToken } from '../theme'
import type { SpaceProps } from './interface'
import { Children, isValidElement } from 'react'
import { View } from 'react-native'

const getGap = (value: boolean | number | undefined, fallback: number) =>
  value === undefined ? 0 : typeof value === 'boolean' ? (value ? fallback : 0) : value

export function Space({
  align,
  children,
  direction = 'vertical',
  gap = 's',
  gapHorizontal,
  gapVertical,
  head,
  justify,
  minWidth,
  shrink = false,
  style,
  tail,
  wrap = false,
  ...restProps
}: SpaceProps) {
  const { token } = useToken()
  const gaps = { s: token.sizeXS, m: token.size, l: token.sizeLG }
  const defaultGap = typeof gap === 'number' ? gap : gaps[gap]
  const verticalGap = gapVertical ?? defaultGap
  const horizontalGap = gapHorizontal ?? defaultGap
  const vertical = direction === 'vertical'
  const items = Children.toArray(children)

  return (
    <View
      {...restProps}
      style={[
        {
          alignItems: align,
          flexDirection: vertical ? 'column' : 'row',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          justifyContent: justify,
          ...(vertical
            ? { paddingBottom: getGap(tail, verticalGap), paddingTop: getGap(head, verticalGap) }
            : {
                paddingLeft: getGap(head, horizontalGap),
                paddingRight: getGap(tail, horizontalGap),
              }),
          ...(shrink && !vertical ? { marginBottom: -verticalGap } : {}),
        },
        style,
      ]}
    >
      {items.map((child, index) => (
        <View
          key={isValidElement(child) ? (child.key ?? index) : index}
          style={[
            { minWidth },
            vertical || wrap ? { marginBottom: verticalGap } : null,
            !vertical ? { marginRight: horizontalGap } : null,
            index === items.length - 1
              ? vertical
                ? { marginBottom: 0 }
                : { marginRight: 0 }
              : null,
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  )
}
