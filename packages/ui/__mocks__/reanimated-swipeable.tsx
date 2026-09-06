import { forwardRef, useImperativeHandle } from 'react'
import { View } from 'react-native'

const ReanimatedSwipeable = forwardRef(function ReanimatedSwipeable(
  {
    children,
    renderLeftActions,
    renderRightActions,
    ...props
  }: {
    children?: React.ReactNode
    renderLeftActions?: (...args: unknown[]) => React.ReactNode
    renderRightActions?: (...args: unknown[]) => React.ReactNode
    [key: string]: unknown
  },
  ref: React.ForwardedRef<{ close: () => void; openLeft: () => void; openRight: () => void }>,
) {
  useImperativeHandle(ref, () => ({ close() {}, openLeft() {}, openRight() {} }))
  return (
    <View {...props}>
      {renderLeftActions?.(0, 0)}
      {children}
      {renderRightActions?.(0, 0)}
    </View>
  )
})

export default ReanimatedSwipeable
