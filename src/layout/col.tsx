import { View } from 'react-native'
import { useRow } from './context'
import { normalizeOffset, normalizeSpan } from './normalize'
import type { ColProps } from './interface'

export function Col({ offset = 0, span = 24, style, ...restProps }: ColProps) {
  const { spaces } = useRow()
  const space = spaces[0]
  const normalizedOffset = normalizeOffset(offset)
  const normalizedSpan = normalizeSpan(span)

  return (
    <View
      {...restProps}
      style={[
        {
          flexBasis: `${(normalizedSpan / 24) * 100}%`,
          flexGrow: 0,
          flexShrink: 0,
          marginLeft: `${(normalizedOffset / 24) * 100}%`,
          paddingBottom: space?.bottom ?? 0,
          paddingLeft: space?.left ?? 0,
          paddingRight: space?.right ?? 0,
          paddingTop: space?.top ?? 0,
        },
        style,
      ]}
    />
  )
}
