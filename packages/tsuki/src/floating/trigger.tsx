import { cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Pressable } from 'react-native'
import type { AccessibilityActionEvent, GestureResponderEvent, PressableProps } from 'react-native'

export interface FloatingTriggerProps {
  asChild?: boolean
  children?: ReactNode
  disabled?: boolean
  expanded: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityActions?: PressableProps['accessibilityActions']
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void
  onAccessibilityTap?: () => void
  onPress?: () => void
  onLongPress?: () => void
  delayLongPress?: number
}

interface TriggerChildProps {
  disabled?: boolean
  onPress?: (event: GestureResponderEvent) => void
  onLongPress?: (event: GestureResponderEvent) => void
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: PressableProps['accessibilityState']
}

export function FloatingTrigger({
  asChild = false,
  children,
  disabled = false,
  expanded,
  accessibilityLabel,
  accessibilityHint,
  accessibilityActions,
  onAccessibilityAction,
  onAccessibilityTap,
  onPress,
  onLongPress,
  delayLongPress,
}: FloatingTriggerProps) {
  if (asChild) {
    if (!isValidElement<TriggerChildProps>(children)) {
      throw new Error('Floating trigger with asChild requires a single valid React element child.')
    }

    const child = children as ReactElement<TriggerChildProps>
    const childProps = child.props
    const effectiveDisabled = disabled || Boolean(childProps.disabled)
    const composedPress =
      onPress || childProps.onPress
        ? (event: GestureResponderEvent) => {
            childProps.onPress?.(event)
            if (!effectiveDisabled) onPress?.()
          }
        : undefined
    const composedLongPress =
      onLongPress || childProps.onLongPress
        ? (event: GestureResponderEvent) => {
            childProps.onLongPress?.(event)
            if (!effectiveDisabled) onLongPress?.()
          }
        : undefined

    return cloneElement(child, {
      disabled: effectiveDisabled || childProps.disabled,
      onPress: composedPress,
      onLongPress: composedLongPress,
      accessibilityLabel: childProps.accessibilityLabel ?? accessibilityLabel,
      accessibilityHint: childProps.accessibilityHint ?? accessibilityHint,
      accessibilityState: {
        ...childProps.accessibilityState,
        expanded,
        disabled: effectiveDisabled || childProps.accessibilityState?.disabled,
      },
    })
  }

  return (
    <Pressable
      accessibilityActions={accessibilityActions}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded, disabled }}
      accessible
      delayLongPress={delayLongPress}
      disabled={disabled}
      onAccessibilityAction={onAccessibilityAction}
      onAccessibilityTap={onAccessibilityTap}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      {children}
    </Pressable>
  )
}
