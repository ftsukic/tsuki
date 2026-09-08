import { View } from 'react-native'
import { useRow } from './context'
import type { ColProps } from './interface'

export function Col({ offset = 0, span, style, ...restProps }: ColProps) {
  const { gap } = useRow()

  return (
    <View
      {...restProps}
      style={[
        {
          flexBasis: `${(span / 24) * 100}%`,
          flexGrow: 0,
          flexShrink: 0,
          marginLeft: `${(offset / 24) * 100}%`,
          paddingHorizontal: gap / 2,
          paddingVertical: gap / 2,
        },
        style,
      ]}
    />
  )
}
