import { memo } from 'react'
import { View } from 'react-native'
import type { ColorValue, ViewProps } from 'react-native'

import { LoadingIcon } from './loading-icon'

export type LoadingType = 'circular' | 'spinner'

export interface LoadingProps extends Omit<ViewProps, 'children'> {
  size: number
  color: ColorValue
  duration?: number
  type?: LoadingType
}

function LoadingComponent({
  size,
  color,
  duration = 1000,
  type = 'circular',
  style,
  ...props
}: LoadingProps) {
  const indicator =
    type === 'spinner' ? (
      <LoadingIcon size={size} color={color} duration={duration} />
    ) : (
      <LoadingIcon size={size} color={color} duration={duration} />
    )

  return (
    <View {...props} style={style}>
      <View accessible accessibilityRole="progressbar">
        {indicator}
      </View>
    </View>
  )
}

export const Loading = memo(LoadingComponent)
Loading.displayName = 'Loading'

export { LoadingIcon } from './loading-icon'
export type { LoadingIconProps } from './loading-icon'
