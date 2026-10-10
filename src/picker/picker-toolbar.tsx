import { forwardRef } from 'react'
import { View } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { resolveStyles } from '../style'
import type { StyleResolver } from '../style'
import { useComponentToken } from '../theme'
import { getPickerStyles } from './style'
import { getPickerToken } from './token'

export interface PickerToolbarSemanticStyles {
  root?: StyleProp<ViewStyle>
  title?: StyleProp<TextStyle>
  item?: StyleProp<ViewStyle>
  itemContent?: StyleProp<TextStyle>
}

export type PickerToolbarStyles = StyleResolver<
  PickerToolbarProps,
  Record<string, never>,
  PickerToolbarSemanticStyles
>

export interface PickerToolbarProps {
  title?: ReactNode
  cancelButtonText?: ReactNode
  confirmButtonText?: ReactNode
  showDivider?: boolean
  onCancel?: () => void
  onConfirm?: () => void
  style?: StyleProp<ViewStyle>
  styles?: PickerToolbarStyles
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
    onCancel,
    onConfirm,
    style,
    styles,
    testID,
  },
  ref,
) {
  const semantic = resolveStyles(styles, {
    props: {
      title,
      cancelButtonText,
      confirmButtonText,
      showDivider,
      onCancel,
      onConfirm,
      style,
      styles,
      testID,
    },
    state: {},
  })
  const token = useComponentToken('Picker', getPickerToken)
  const resolved = getPickerStyles(
    token,
    token.picker_item_height,
    token.picker_visible_item_count,
    showDivider,
  )
  return (
    <View
      ref={ref}
      style={[resolved.toolbar, semantic?.root, style]}
      testID={testID ?? 'picker-toolbar'}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        pressStyle="opacity"
        pressedOpacity={token.picker_toolbar_button_pressed_opacity}
        style={[resolved.toolbarButton, { alignItems: 'flex-start' }, semantic?.item]}
        testID="picker-cancel"
      >
        {renderContent(cancelButtonText, [
          resolved.toolbarButtonLabel,
          { color: token.picker_cancel_button_color },
          semantic?.itemContent,
        ])}
      </Pressable>
      <View style={[resolved.toolbarTitleContainer, { pointerEvents: 'none' }]}>
        {renderContent(title, [resolved.toolbarTitle, semantic?.title])}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onConfirm}
        pressStyle="opacity"
        pressedOpacity={token.picker_toolbar_button_pressed_opacity}
        style={[resolved.toolbarButton, { alignItems: 'flex-end' }, semantic?.item]}
        testID="picker-confirm"
      >
        {renderContent(confirmButtonText, [
          resolved.toolbarButtonLabel,
          { color: token.picker_confirm_button_color },
          semantic?.itemContent,
        ])}
      </Pressable>
    </View>
  )
})

PickerToolbar.displayName = 'PickerToolbar'
