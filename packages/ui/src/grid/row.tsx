import RowContext from './context'
import type { RowProps } from './interface'
import { useMemo } from 'react'
import { View } from 'react-native'

export function Row({ align, gap = 0, justify, style, ...restProps }: RowProps) {
  const context = useMemo(() => ({ gap }), [gap])

  return (
    <RowContext.Provider value={context}>
      <View
        {...restProps}
        style={[
          {
            alignItems: align,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: justify,
            marginHorizontal: -gap / 2,
          },
          style,
        ]}
      />
    </RowContext.Provider>
  )
}
