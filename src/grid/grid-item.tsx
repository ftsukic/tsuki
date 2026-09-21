import type { ReactNode } from 'react'
import { Pressable } from '../pressable'
import { View } from 'react-native'
import { useToken } from '../theme'
import { useGridContext } from './context'
import { Text } from '../text'
import type { GridItemProps } from './types'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

function renderText(value: ReactNode, color: string, fontFamily: string) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={{ color, fontFamily, fontSize: 14, lineHeight: 20 }}>{value}</Text>
  }
  return value
}

export function GridItem({
  children,
  disabled = false,
  icon,
  onPress,
  onPressDebounceWait,
  text,
  style,
  ...pressableProps
}: GridItemProps) {
  const token = useToken().token
  const { border, center, square } = useGridContext()
  const isDisabled = disabled === true
  const content = isVisible(children) ? children : text
  const hasIcon = isVisible(icon)
  const hasText = isVisible(content)

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={pressableProps.accessibilityRole ?? (onPress ? 'button' : undefined)}
      disabled={isDisabled}
      onPress={onPress}
      onPressDebounceWait={onPressDebounceWait}
      pressStyle={onPress ? 'background' : 'none'}
      pressedBackgroundColor={token.pressedBackgroundColor}
      style={[
        {
          alignItems: center ? 'center' : 'flex-start',
          alignSelf: 'stretch',
          aspectRatio: square ? 1 : undefined,
          backgroundColor: token.colorBgContainer,
          borderColor: border ? token.colorBorder : 'transparent',
          borderWidth: border ? 1 : 0,
          justifyContent: center ? 'center' : 'flex-start',
          minHeight: square ? undefined : 72,
          paddingHorizontal: 8,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <>
        {hasIcon ? <View style={{ marginBottom: hasText ? 6 : 0 }}>{icon}</View> : null}
        {renderText(content, token.colorText, token.fontFamily)}
      </>
    </Pressable>
  )
}

GridItem.displayName = 'Grid.Item'
