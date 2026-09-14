import { forwardRef, useCallback, useRef, type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import type { TextInputInstance } from '../text-input'
import type { TextInputProps } from '../text-input'
import { TextInput } from '../text-input'
import { InputClear, InputPasswordToggle, renderInputAffix } from './input-affix'
import type { InputResolvedStyles } from './style'
import type { InputSemanticStyles } from './types'
import type { InputToken } from '../theme'
import type { StyleProp, TextStyle } from 'react-native'

export interface InputSingleProps {
  coreProps: TextInputProps
  disabled: boolean
  token: InputToken
  styles: InputResolvedStyles
  semantic?: InputSemanticStyles
  value: string
  prefix?: ReactNode
  suffix?: ReactNode
  clearable: boolean
  showClear: boolean
  passwordVisible: boolean
  isPassword: boolean
  onClear: () => void
  onPasswordVisibleChange: () => void
  onChangeText: (value: string) => void
}

export const InputSingle = forwardRef<TextInputInstance, InputSingleProps>(function InputSingle(
  {
    coreProps,
    disabled,
    token,
    styles,
    semantic,
    value,
    prefix,
    suffix,
    clearable,
    showClear,
    passwordVisible,
    isPassword,
    onClear,
    onPasswordVisibleChange,
    onChangeText,
  },
  ref,
) {
  const inputRef = useRef<TextInputInstance>(null)
  const assignInputRef = (instance: TextInputInstance | null) => {
    inputRef.current = instance
    if (typeof ref === 'function') ref(instance)
    else if (ref) ref.current = instance
  }
  const renderedSuffix = isPassword ? (
    <InputPasswordToggle
      token={token}
      visible={passwordVisible}
      disabled={disabled}
      onPress={onPasswordVisibleChange}
      style={styles.passwordToggle}
    />
  ) : (
    suffix
  )
  const handleClear = useCallback(() => {
    inputRef.current?.clear()
    onClear()
    inputRef.current?.focus()
  }, [onClear])
  const handleShellPress = useCallback(() => {
    if (disabled) return
    inputRef.current?.focus()
  }, [disabled])

  return (
    <Pressable
      onPress={handleShellPress}
      style={[styles.shell, styles.singleShell, semantic?.shell]}
    >
      <View style={[styles.content, styles.singleContent, semantic?.content]}>
        {renderInputAffix(prefix, [styles.prefix, semantic?.prefix] as StyleProp<TextStyle>, true)}
        <TextInput
          {...coreProps}
          ref={assignInputRef}
          value={value}
          multiline={false}
          style={[styles.input, styles.singleInput, semantic?.input]}
          onChangeText={onChangeText}
        />
        {clearable ? (
          <InputClear
            token={token}
            showClear={showClear}
            onPress={handleClear}
            style={[styles.clear, !showClear && styles.clearHidden, semantic?.clear]}
          />
        ) : null}
        {renderInputAffix(renderedSuffix, [
          styles.suffix,
          semantic?.suffix,
        ] as StyleProp<TextStyle>)}
      </View>
    </Pressable>
  )
})

InputSingle.displayName = 'InputSingle'
