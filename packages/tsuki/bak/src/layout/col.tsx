import { View } from 'react-native'
import { resolveStyles } from '../style/resolve-styles'
import RowContext, { emptyRowSpace, useRow } from './context'
import { normalizeOffset, normalizeSpan } from './normalize'
import type { ColProps } from './types'

export function Col(props: ColProps) {
  const { offset = 0, span = 24, style, styles, children, onLayout, ...restProps } = props
  const row = useRow()
  const space = row.spaces[0]
  const semanticStyles = resolveStyles(styles, { props, state: {} })

  return (
    <View
      {...restProps}
      onLayout={(event) => {
        row.onLayout?.(event.nativeEvent.layout)
        onLayout?.(event)
      }}
      style={[
        {
          flexBasis: `${(normalizeSpan(span) / 24) * 100}%`,
          flexGrow: 0,
          flexShrink: 0,
          marginLeft: `${(normalizeOffset(offset) / 24) * 100}%`,
          paddingBottom: space?.bottom ?? 0,
          paddingLeft: space?.left ?? 0,
          paddingRight: space?.right ?? 0,
          paddingTop: space?.top ?? 0,
        },
        style,
      ]}
    >
      <RowContext.Provider value={{ spaces: [emptyRowSpace] }}>
        {styles === undefined ? (
          children
        ) : (
          <View style={[{ flexGrow: 1, flexShrink: 1 }, semanticStyles?.content]}>{children}</View>
        )}
      </RowContext.Provider>
    </View>
  )
}
