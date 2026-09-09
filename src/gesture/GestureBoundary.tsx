import { GestureHandlerRootView } from 'react-native-gesture-handler'
import type { ComponentProps, ReactNode } from 'react'

export interface GestureBoundaryProps extends Omit<
  ComponentProps<typeof GestureHandlerRootView>,
  'children'
> {
  children?: ReactNode
}

/**
 * Opt-in root for examples and demos. Library consumers should place their
 * own GestureHandlerRootView at the application entry point.
 */
export function GestureBoundary({ children, style, ...props }: GestureBoundaryProps) {
  return (
    <GestureHandlerRootView {...props} style={[{ flex: 1 }, style]}>
      {children}
    </GestureHandlerRootView>
  )
}

GestureBoundary.displayName = 'GestureBoundary'
