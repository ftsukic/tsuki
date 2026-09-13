import { forwardRef } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { InteractionPressable } from '../interaction'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { getPickerStyles } from './style'
import { getPickerToken } from './token'

export interface PickerToolbarProps {
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  showDivider?: boolean
  titleStyle?: StyleProp<TextStyle>
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
    showDivider = false,
    titleStyle,
    onCancel,
    onConfirm,
    style,
    buttonStyle,
    buttonLabelStyle,
    testID,
  },
  ref,
) {
  const token = useComponentToken('Picker', getPickerToken)
  const resolved = getPickerStyles(
    token,
    token.picker_item_height,
    token.picker_visible_item_count,
    showDivider,
  )
  return (
    <View ref={ref} style={[resolved.toolbar, style]} testID={testID ?? 'picker-toolbar'}>
      <InteractionPressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [
          resolved.toolbarButton,
          { alignItems: 'flex-start' },
          pressed && { opacity: token.picker_toolbar_button_active_opacity },
          buttonStyle,
        ]}
        testID="picker-cancel"
      >
        {renderContent(cancelButtonText, [
          resolved.toolbarButtonLabel,
          { color: token.picker_cancel_button_color },
          buttonLabelStyle,
        ])}
      </InteractionPressable>
      <View pointerEvents="none" style={resolved.toolbarTitleContainer}>
        {renderContent(title, [resolved.toolbarTitle, titleStyle])}
      </View>
      <InteractionPressable
        accessibilityRole="button"
        onPress={onConfirm}
        style={({ pressed }) => [
          resolved.toolbarButton,
          { alignItems: 'flex-end' },
          pressed && { opacity: token.picker_toolbar_button_active_opacity },
          buttonStyle,
        ]}
        testID="picker-confirm"
      >
        {renderContent(confirmButtonText, [
          resolved.toolbarButtonLabel,
          { color: token.picker_confirm_button_color },
          buttonLabelStyle,
        ])}
      </InteractionPressable>
    </View>
  )
})

PickerToolbar.displayName = 'PickerToolbar'
