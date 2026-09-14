import { forwardRef } from 'react'
import { View } from 'react-native'
import type { View as ViewComponent } from 'react-native'
import type { SwipeItemProps } from './types'

export const SwipeItem = forwardRef<ViewComponent, SwipeItemProps>(function SwipeItem(
  { children, ...props },
  ref,
) {
  return (
    <View ref={ref} {...props}>
      {children}
    </View>
  )
})
