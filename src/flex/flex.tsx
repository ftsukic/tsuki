import { View } from 'react-native'
import type { FlexProps } from './interface'

export function Flex({
  align,
  direction = 'row',
  gap,
  justify,
  style,
  wrap = false,
  ...restProps
}: FlexProps) {
  return (
    <View
      {...restProps}
      style={[
        {
          alignItems: align,
          flexDirection: direction,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap,
          justifyContent: justify,
        },
        style,
      ]}
    />
  )
}
