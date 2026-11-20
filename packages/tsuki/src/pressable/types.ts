import type { PressableProps } from 'react-native'

export type PressFeedback =
  | { mode: 'opacity'; pressedOpacity?: number }
  | { mode: 'scale'; pressedScale?: number }
  | { mode: 'background'; idleColor: string; pressedColor: string }
  | { mode: 'overlay'; color?: string }
  | { mode: 'none' }

export interface PressStyleConflicts {
  transform: boolean
  opacity: boolean
  backgroundColor: boolean
}

export interface PressableRuntimeProps extends Omit<PressableProps, 'children' | 'style'> {
  children?: PressableProps['children']
  className?: string
  feedback?: PressFeedback
  style?: PressableProps['style']
}
