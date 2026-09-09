import { forwardRef } from 'react'
import { Text, View } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { InteractionPressable } from '../interaction'
import { useComponentToken, useToken } from '../theme'
import { getPickerStyles } from './styles'
import { getPickerToken } from './token'

export interface PickerToolbarProps {
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  onCancel?: () => void
  onConfirm?: () => void
  style?: StyleProp<ViewStyle>
  buttonStyle?: StyleProp<ViewStyle>
  buttonLabelStyle?: StyleProp<TextStyle>
  testID?: string
}

function renderContent(value: ReactNode, style: StyleProp<TextStyle>) {
  return typeof value === 'string' || typeof value === 'number' ? (
    <Text style={style}>{value}</Text>
  ) : (
    value
  )
}

export const PickerToolbar = forwardRef<View, PickerToolbarProps>(function PickerToolbar(
  {
    title,
    cancelButtonText = '取消',
    confirmButtonText = '确定',
    onCancel,
    onConfirm,
    style,
    buttonStyle,
    buttonLabelStyle,
    testID,
  },
  ref,
) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Picker', getPickerToken)
  const resolved = getPickerStyles(token, token.picker_item_height, token.picker_visible_item_count)
  const buttonLabel = [resolved.toolbarButtonLabel, buttonLabelStyle]

  return (
    <View ref={ref} style={[resolved.toolbar, style]} testID={testID ?? 'picker-toolbar'}>
      <View style={{ flex: 1 }}>
        <InteractionPressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [
            resolved.toolbarButton,
            pressed && { backgroundColor: themeToken.interactionActiveColor },
            buttonStyle,
          ]}
          testID="picker-cancel"
        >
          {renderContent(cancelButtonText, buttonLabel)}
        </InteractionPressable>
      </View>
      <View pointerEvents="none" style={{ flex: 1, alignItems: 'center' }}>
        {renderContent(title, [resolved.toolbarButtonLabel, { color: token.picker_text_color }])}
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <InteractionPressable
          accessibilityRole="button"
          onPress={onConfirm}
          style={({ pressed }) => [
            resolved.toolbarButton,
            pressed && { backgroundColor: themeToken.interactionActiveColor },
            buttonStyle,
          ]}
          testID="picker-confirm"
        >
          {renderContent(confirmButtonText, buttonLabel)}
        </InteractionPressable>
      </View>
    </View>
  )
})

PickerToolbar.displayName = 'PickerToolbar'
