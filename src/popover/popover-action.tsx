import { cloneElement, isValidElement } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { ColorValue, StyleProp, TextStyle } from 'react-native'
import { Pressable } from '../pressable'
import { Text } from '../text'
import type { PopoverToken } from '../theme'
import type { PopoverAction, PopoverSemanticStyles } from './types'
import type { PopoverResolvedStyles } from './style'

interface PopoverActionItemProps {
  action: PopoverAction
  index: number
  onSelect: (action: PopoverAction, index: number) => void
  semantic?: Pick<PopoverSemanticStyles, 'action' | 'actionIcon' | 'actionText'>
  styles: Pick<PopoverResolvedStyles, 'action' | 'actionIcon' | 'actionText'>
  textColor: ColorValue
  disabledColor: ColorValue
  token: PopoverToken
}

interface ColorableElementProps {
  color?: ColorValue
  style?: unknown
}

function getElementTypeName(type: unknown): string {
  if (typeof type === 'string') return type
  if (typeof type === 'function') {
    const component = type as { displayName?: string; name?: string }
    return component.displayName ?? component.name ?? ''
  }
  if (type !== null && typeof type === 'object') {
    const component = type as {
      displayName?: string
      render?: unknown
      type?: unknown
    }
    return component.displayName ?? getElementTypeName(component.type ?? component.render)
  }
  return ''
}

function applyActionColor(
  node: ReactNode,
  color: ColorValue | undefined,
  style?: StyleProp<TextStyle>,
): ReactNode {
  if (!color || !isValidElement(node)) return node

  const typeName = getElementTypeName(node.type).toLowerCase()
  const props = node.props as ColorableElementProps

  if (typeName.includes('text')) {
    return cloneElement(node, {
      style: [props.style, style, { color }],
    } as never)
  }

  if (typeName.includes('icon') || typeName.includes('svg')) {
    if (typeof node.type === 'string') {
      return cloneElement(node, {
        style: [props.style, { color }],
      } as never)
    }

    return cloneElement(node, { color } as never)
  }

  if (Object.prototype.hasOwnProperty.call(props, 'color')) {
    return cloneElement(node, { color } as never)
  }

  return node
}

function renderText(
  value: ReactNode,
  style: StyleProp<TextStyle>,
  color: ColorValue | undefined,
): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }

  return applyActionColor(value, color, style)
}

export function PopoverActionItem({
  action,
  index,
  onSelect,
  semantic,
  styles,
  textColor,
  disabledColor,
  token,
}: PopoverActionItemProps) {
  const disabled = action.disabled === true
  const actionColor = disabled ? disabledColor : (action.color ?? textColor)
  const actionTextStyle = [styles.actionText, { color: actionColor }, semantic?.actionText]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        onSelect(action, index)
      }}
      pressStyle="none"
      style={({ pressed }) => [
        styles.action,
        semantic?.action,
        pressed && !disabled && { backgroundColor: token.pressedBackgroundColor },
      ]}
      testID={`popover-action-${index}`}
    >
      {action.icon !== undefined && action.icon !== null && action.icon !== false ? (
        <View pointerEvents="none" style={[styles.actionIcon, semantic?.actionIcon]}>
          {applyActionColor(action.icon, actionColor)}
        </View>
      ) : null}
      {renderText(action.text, actionTextStyle, actionColor)}
    </Pressable>
  )
}

PopoverActionItem.displayName = 'Popover.Action'
