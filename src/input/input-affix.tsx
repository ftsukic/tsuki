import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import type { InputToken } from '../theme'
import type { ReactNode } from 'react'
import { Text } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

export function isInputAffixVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

export function renderInputAffix(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isInputAffixVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

export function InputClear({
  token,
  style,
  disabled,
  onPress,
}: {
  token: InputToken
  style: StyleProp<ViewStyle>
  disabled: boolean
  onPress: () => void
}) {
  return (
    <InteractionPressable
      accessibilityRole="button"
      accessibilityLabel="清除输入"
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      <Icon
        name="CloseOutlined"
        size={token.clearButtonSize * 0.7}
        color={token.clearButtonColor}
      />
    </InteractionPressable>
  )
}

export function InputPasswordToggle({
  token,
  visible,
  disabled,
  style,
  onPress,
}: {
  token: InputToken
  visible: boolean
  disabled: boolean
  style: StyleProp<ViewStyle>
  onPress: () => void
}) {
  return (
    <InteractionPressable
      accessibilityRole="button"
      accessibilityLabel={visible ? '隐藏密码' : '显示密码'}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      <Icon
        name={visible ? 'EyeOutlined' : 'EyeInvisibleOutlined'}
        size={token.fontSizeLG}
        color={token.prefixColor}
      />
    </InteractionPressable>
  )
}
