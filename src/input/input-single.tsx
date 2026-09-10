import { forwardRef, useRef, type ReactNode } from 'react'
import { View } from 'react-native'
import type { TextInputInstance } from '../text-input'
import type { TextInputProps } from '../text-input'
import { InputCore } from './input-core'
import { InputClear, InputPasswordToggle, renderInputAffix } from './input-affix'
import type { InputResolvedStyles } from './style'
import type { InputSemanticStyles } from './interface'
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

  return (
    <View style={[styles.shell, styles.singleShell, semantic?.shell]}>
      <View style={[styles.content, styles.singleContent, semantic?.content]}>
        {renderInputAffix(prefix, [styles.prefix, semantic?.prefix] as StyleProp<TextStyle>)}
        <InputCore
          {...coreProps}
          ref={assignInputRef}
          value={value}
          multiline={false}
          style={[styles.input, styles.singleInput, semantic?.input]}
          onChangeText={onChangeText}
        />
        {showClear ? (
          <InputClear
            token={token}
            disabled={disabled}
            onPress={() => {
              inputRef.current?.clear()
              inputRef.current?.focus()
              onClear()
            }}
            style={[styles.clear, semantic?.clear]}
          />
        ) : null}
        {renderInputAffix(renderedSuffix, [
          styles.suffix,
          semantic?.suffix,
        ] as StyleProp<TextStyle>)}
      </View>
    </View>
  )
})

InputSingle.displayName = 'InputSingle'
