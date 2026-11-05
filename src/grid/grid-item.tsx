import { useContext, type ReactNode } from 'react'
import { Pressable } from '../pressable'
import { StyleSheet, View } from 'react-native'
import { useToken } from '../theme'
import { GridItemIndexContext, useGridContext } from './context'
import { Text } from '../text'
import type { GridItemProps } from './types'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

function renderText(value: ReactNode, center: boolean) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={{ textAlign: center ? 'center' : 'auto' }}>{value}</Text>
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
  const { border, center, square, gutter, columnNum } = useGridContext()
  const index = useContext(GridItemIndexContext)
  const sharedBorder =
    border && gutter === 0 && index !== null && StyleSheet.flatten(style)?.borderWidth === undefined
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
          borderWidth: border ? token.lineWidth : 0,
          ...(sharedBorder && {
            borderTopWidth: index >= columnNum ? 0 : token.lineWidth,
            borderStartWidth: index % columnNum === 0 ? token.lineWidth : 0,
          }),
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
        {renderText(content, center)}
      </>
    </Pressable>
  )
}

GridItem.displayName = 'Grid.Item'
