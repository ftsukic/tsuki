import { forwardRef, useCallback, useRef, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'
import type { TextInputProps } from 'react-native'
import { TextInput } from 'react-native'
import { InputClear, InputPasswordToggle, renderInputAffix } from './input-affix'
import type { InputResolvedStyles } from './style'
import type { InputSemanticStyles } from './types'
import type { InputToken } from '../theme'
import { Text } from '../text'
import type { StyleProp, ViewStyle } from 'react-native'

export interface InputSingleProps {
  coreProps: TextInputProps
  disabled: boolean
  rootStyle?: StyleProp<ViewStyle>
  token: InputToken
  styles: InputResolvedStyles
  semantic?: InputSemanticStyles
  value: string
  prefix?: ReactNode
  suffix?: ReactNode
  wordLimit?: number
  clearable: boolean
  showClear: boolean
  passwordVisible: boolean
  isPassword: boolean
  onClear: () => void
  onPasswordVisibleChange: () => void
  onChangeText: (value: string) => void
}

export const InputSingle = forwardRef<NativeTextInput, InputSingleProps>(function InputSingle(
  {
    coreProps,
    disabled,
    rootStyle,
    token,
    styles,
    semantic,
    value,
    prefix,
    suffix,
    wordLimit,
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
  const inputRef = useRef<NativeTextInput>(null)
  const assignInputRef = (instance: NativeTextInput | null) => {
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

  const customRoot = StyleSheet.flatten(rootStyle)
  const rootHeight = customRoot?.height ?? customRoot?.minHeight
  const rootPadding = customRoot?.paddingVertical ?? styles.singleShell.paddingVertical
  const verticalPadding = typeof rootPadding === 'number' ? rootPadding : 0
  const contentHeight =
    typeof rootHeight === 'number' ? Math.max(0, rootHeight - verticalPadding * 2) : undefined

  return (
    <Pressable onPress={handleShellPress} style={[styles.shell, styles.singleShell, rootStyle]}>
      <View
        style={[
          styles.content,
          styles.singleContent,
          contentHeight === undefined ? undefined : { minHeight: contentHeight },
        ]}
      >
        {renderInputAffix(prefix, [styles.prefix, semantic?.prefix], styles.affixText)}
        <TextInput
          {...coreProps}
          ref={assignInputRef}
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
        {renderInputAffix(renderedSuffix, [styles.suffix, semantic?.suffix], styles.affixText)}
        {wordLimit !== undefined ? (
          <Text
            allowFontScaling={coreProps.allowFontScaling}
            maxFontSizeMultiplier={coreProps.maxFontSizeMultiplier}
            style={[styles.wordLimit, semantic?.count]}
          >
            {value.length}/{wordLimit}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
})

InputSingle.displayName = 'InputSingle'
