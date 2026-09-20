import type {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

export type InteractionPressHandler = NonNullable<PressableProps['onPress']>

export interface InteractionState {
  pressed: boolean
  disabled: boolean
}

export interface InteractionPressableState extends PressableStateCallbackType {
  /** Available on React Native Web; omitted on native platforms. */
  hovered?: boolean
}

export interface InteractionPressableProps extends Omit<
  PressableProps,
  'children' | 'disabled' | 'onPress' | 'style'
> {
  children?: React.ReactNode | ((state: InteractionPressableState) => React.ReactNode)
  disabled?: boolean
  onPress?: PressableProps['onPress']
  onPressDebounceWait?: number
  /** Identifies a press that belongs to the current interaction owner. */
  interactionId?: string
  style?: StyleProp<ViewStyle> | ((state: InteractionPressableState) => StyleProp<ViewStyle>)
}

export interface UseInteractionPressOptions {
  disabled?: boolean
  onPress?: PressableProps['onPress']
  onPressDebounceWait?: number
}

export type PanGestureAxis = 'horizontal' | 'vertical'

export interface PanGestureState {
  axis: PanGestureAxis
  /** Signed displacement along the configured axis. */
  distance: number
  /** Signed velocity along the configured axis. */
  velocity: number
}

export type PanGestureCallback = (state: PanGestureState) => void
export type PanGestureShouldActivate = (state: PanGestureState) => boolean

export type PanGestureHandlers = Pick<
  ViewProps,
  | 'onMoveShouldSetResponder'
  | 'onMoveShouldSetResponderCapture'
  | 'onResponderGrant'
  | 'onResponderMove'
  | 'onResponderRelease'
  | 'onResponderTerminate'
  | 'onResponderTerminationRequest'
  | 'onStartShouldSetResponder'
  | 'onStartShouldSetResponderCapture'
>

export interface UsePanGestureOptions {
  axis: PanGestureAxis
  enabled?: boolean
  /** Minimum primary-axis displacement required to claim the responder. */
  distance?: number
  shouldActivate?: PanGestureShouldActivate
  onStart?: PanGestureCallback
  onChange?: PanGestureCallback
  onEnd?: PanGestureCallback
}

export interface UsePanGestureResult {
  panHandlers: PanGestureHandlers
}
