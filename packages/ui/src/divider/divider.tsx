import { useToken } from '../theme'
import type { DividerProps } from './interface'
import { createDividerStyles } from './style'
import { useMemo } from 'react'
import { Text, View } from 'react-native'

export function Divider({
  children,
  color,
  contentPosition = 'center',
  dashed = false,
  direction = 'horizontal',
  lineStyle,
  style,
  textStyle,
  theme,
  ...restProps
}: DividerProps) {
  const { components } = useToken()
  const token = { ...components.Divider, ...theme, color: color ?? components.Divider.color }
  const styles = useMemo(() => createDividerStyles(token), [token])
  const lineStyles = [styles.line, dashed ? styles.lineDashed : null, lineStyle]

  if (direction === 'vertical') {
    return (
      <View
        {...restProps}
        style={[styles.vertical, style, { backgroundColor: color ?? token.color }]}
      />
    )
  }

  if (children === undefined || children === null) {
    return (
      <View {...restProps} style={[styles.divider, style]}>
        <View style={[lineStyles, { flex: 1 }]} />
      </View>
    )
  }

  return (
    <View {...restProps} style={[styles.divider, style]}>
      {contentPosition !== 'left' ? <View style={[lineStyles, { flex: 1 }]} /> : null}
      <Text style={[styles.content, textStyle]}>{children}</Text>
      {contentPosition !== 'right' ? <View style={[lineStyles, { flex: 1 }]} /> : null}
    </View>
  )
}
