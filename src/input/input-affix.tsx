import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import type { InputToken } from '../theme'
import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Text } from '../text'

export function isInputAffixVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

export function renderInputAffix(value: ReactNode, style: StyleProp<TextStyle>, wrapNode = false) {
  if (!isInputAffixVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return wrapNode ? <View style={style as StyleProp<ViewStyle>}>{value}</View> : value
}

export function InputClear({
  token,
  style,
  showClear,
  onPress,
}: {
  token: InputToken
  style: StyleProp<ViewStyle>
  showClear: boolean
  onPress: () => void
}) {
  const activePressRef = useRef(false)
  const showClearRef = useRef(showClear)
  const onPressRef = useRef(onPress)
  showClearRef.current = showClear
  onPressRef.current = onPress

  const handlePressIn = useCallback(() => {
    if (showClearRef.current) activePressRef.current = true
  }, [])
  const handlePress = useCallback(() => {
    if (!activePressRef.current && !showClearRef.current) return
    activePressRef.current = false
    onPressRef.current()
  }, [])
  const handlePressOut = useCallback(() => {
    // RN invokes onPress after onPressOut. Keep a gesture that blurred the
    // input active until onPress can finish it.
    if (showClearRef.current) activePressRef.current = false
  }, [])
  const handleResponderTerminate = useCallback(() => {
    activePressRef.current = false
  }, [])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="清除输入"
      hitSlop={token.paddingHorizontal}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onResponderTerminate={handleResponderTerminate}
      pointerEvents={showClear || activePressRef.current ? 'auto' : 'none'}
      style={style}
    >
      <Icon
        name="CloseOutlined"
        size={token.clearButtonSize * 0.7}
        color={token.clearButtonColor}
      />
    </Pressable>
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
      hitSlop={token.paddingHorizontal / 2}
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
