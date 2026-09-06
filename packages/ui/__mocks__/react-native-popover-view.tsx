/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react'
import { View } from 'react-native'

export enum PopoverPlacement {
  AUTO = 'auto',
}

const Popover = forwardRef(function Popover(
  { children, isVisible, from, ...props }: any,
  ref: React.ForwardedRef<unknown>,
) {
  if (!isVisible) return null
  return (
    <View ref={ref as any} {...props}>
      {typeof from === 'function' ? from(ref) : from}
      {children}
    </View>
  )
})

export default Popover
