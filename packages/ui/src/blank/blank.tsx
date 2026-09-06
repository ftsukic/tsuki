import { useToken } from '../theme'
import type { BlankProps } from './interface'
import { View } from 'react-native'

const getGap = (value: boolean | number, fallback: number) =>
  typeof value === 'boolean' ? (value ? fallback : 0) : value

export function Blank({
  bottom = false,
  children,
  left = true,
  right = true,
  size = 'm',
  style,
  top = false,
  type = 'margin',
  ...restProps
}: BlankProps) {
  const { token } = useToken()
  const values = { s: token.sizeXS, m: token.size, l: token.sizeLG }
  const gap = values[size]
  const edges = {
    [`${type}Bottom`]: getGap(bottom, gap),
    [`${type}Left`]: getGap(left, gap),
    [`${type}Right`]: getGap(right, gap),
    [`${type}Top`]: getGap(top, gap),
  }

  return (
    <View {...restProps} style={[edges, style]}>
      {children}
    </View>
  )
}
