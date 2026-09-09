import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { TextInput as NativeTextInput } from '../text-input/text-input'
import { getTextInputStyles } from '../text-input/style'
import { getInputToken } from '../text-input/token'
import { useComponentToken } from '../theme'
import type { InputProps, InputStyleState } from './interface'
import { getInputStyles } from './style'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Text, View } from 'react-native'
import type { TextInput as NativeTextInputInstance } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false
}

function renderAddon(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number')
    return <Text style={style}>{value}</Text>
  return value
}

export const Input = forwardRef<NativeTextInputInstance, InputProps>(function Input(
  {
    type = 'text',
    size = 'normal',
    bordered = false,
    clearable = false,
    clearTrigger = 'focus',
    formatter,
    formatTrigger = 'onChangeText',
    showWordLimit = false,
    rows = 2,
    disabled = false,
    readOnly = false,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    passwordVisible,
    defaultPasswordVisible = false,
    onPasswordVisibleChange,
    onClear,
    style,
    styles,
    value,
    defaultValue,
    editable = true,
    maxLength,
    onChange,
    onChangeText,
    onFocus,
    onBlur,
    onEndEditing,
    ...nativeProps
  },
  ref,
) {
  const inputToken = useComponentToken('Input', getInputToken)
  const inputStyles = getInputStyles(inputToken)
  const inputRef = useRef<NativeTextInputInstance>(null)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const [internalPasswordVisible, setInternalPasswordVisible] = useState(defaultPasswordVisible)
  const currentValue = value ?? internalValue
  const isPassword = type === 'password'
  const isPasswordVisible = passwordVisible ?? internalPasswordVisible
  const isTextarea = type === 'textarea' || nativeProps.multiline === true
  const isDisabled = disabled || (editable === false && !readOnly)
  const isEditable = !disabled && !readOnly && editable !== false
  const keyboardType =
    type === 'number' ? 'numeric' : type === 'tel' ? 'phone-pad' : nativeProps.keyboardType
  const secureTextEntry = isPassword ? !isPasswordVisible : nativeProps.secureTextEntry
  const state: InputStyleState = { focused, disabled: isDisabled }
  const inputProps: InputProps = {
    type,
    size,
    bordered,
    clearable,
    clearTrigger,
    formatter,
    formatTrigger,
    showWordLimit,
    rows,
    disabled,
    readOnly,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    passwordVisible,
    defaultPasswordVisible,
    onPasswordVisibleChange,
    onClear,
    style,
    styles,
    value,
    defaultValue,
    editable,
    maxLength,
    onChange,
    onChangeText,
    onFocus,
    onBlur,
    onEndEditing,
    multiline: nativeProps.multiline,
  }
  const semantic = resolveStyles(styles, { props: inputProps, state })
  const resolved = getTextInputStyles(inputToken, inputProps, state)
  const showClear =
    clearable && isEditable && currentValue.length > 0 && (clearTrigger === 'always' || focused)
  const showLimit = showWordLimit && maxLength !== undefined

  useImperativeHandle(ref, () => {
    const input = inputRef.current
    if (!input) throw new Error('Input ref is not ready')
    return input
  }, [])

  const updateValue = useCallback(
    (nextValue: string) => {
      const nextValueWithFormat =
        formatter && formatTrigger === 'onChangeText' ? formatter(nextValue) : nextValue
      if (value === undefined) setInternalValue(nextValueWithFormat)
      onChangeText?.(nextValueWithFormat)
    },
    [formatTrigger, formatter, onChangeText, value],
  )

  const handleEndEditing = useCallback(
    (event: Parameters<NonNullable<InputProps['onEndEditing']>>[0]) => {
      if (formatter && formatTrigger === 'onEndEditing')
        updateValue(formatter(event.nativeEvent.text))
      onEndEditing?.(event)
    },
    [formatTrigger, formatter, onEndEditing, updateValue],
  )

  const handleFocus = useCallback(
    (event: Parameters<NonNullable<InputProps['onFocus']>>[0]) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<InputProps['onBlur']>>[0]) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const handleClear = useCallback(() => {
    inputRef.current?.clear()
    updateValue('')
    onClear?.()
    inputRef.current?.focus()
  }, [onClear, updateValue])

  const handlePasswordVisibleChange = useCallback(() => {
    const nextVisible = !isPasswordVisible
    if (passwordVisible === undefined) setInternalPasswordVisible(nextVisible)
    onPasswordVisibleChange?.(nextVisible)
  }, [isPasswordVisible, onPasswordVisibleChange, passwordVisible])

  const renderedSuffix = isPassword ? (
    <InteractionPressable
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? '隐藏密码' : '显示密码'}
      disabled={disabled}
      onPress={handlePasswordVisibleChange}
      style={inputStyles.passwordToggle}
    >
      <Icon
        name={isPasswordVisible ? 'EyeOutlined' : 'EyeInvisibleOutlined'}
        size={inputToken.fontSizeLG}
        color={inputToken.prefixColor}
      />
    </InteractionPressable>
  ) : (
    suffix
  )

  return (
    <View style={[resolved.root, semantic?.root, style]}>
      <View style={resolved.addonGroup}>
        {renderAddon(addonBefore, [resolved.addon, resolved.addonBefore, semantic?.addonBefore])}
        <View style={resolved.shell}>
          <View style={resolved.content}>
            {renderAddon(prefix, [resolved.prefix, semantic?.prefix])}
            <NativeTextInput
              {...nativeProps}
              ref={inputRef}
              value={currentValue}
              editable={isEditable}
              multiline={isTextarea ? true : nativeProps.multiline}
              numberOfLines={isTextarea ? rows : nativeProps.numberOfLines}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              maxLength={maxLength}
              placeholderTextColor={nativeProps.placeholderTextColor ?? inputToken.placeholderColor}
              selectionColor={nativeProps.selectionColor ?? inputToken.selectionColor}
              returnKeyType={
                isTextarea ? nativeProps.returnKeyType : (nativeProps.returnKeyType ?? 'done')
              }
              style={[resolved.input, semantic?.input]}
              onChange={onChange}
              onChangeText={updateValue}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onEndEditing={handleEndEditing}
            />
            {clearable && showClear ? (
              <InteractionPressable
                accessibilityRole="button"
                accessibilityLabel="清除输入"
                disabled={!isEditable}
                onPress={handleClear}
                style={[resolved.clear, semantic?.clear]}
              >
                <Icon
                  name="CloseOutlined"
                  size={inputToken.clearButtonSize * 0.7}
                  color={inputToken.clearButtonColor}
                />
              </InteractionPressable>
            ) : null}
            {renderAddon(renderedSuffix, [resolved.suffix, semantic?.suffix])}
            {showLimit ? (
              <Text style={[resolved.wordLimit, semantic?.wordLimit]}>
                {currentValue.length}/{maxLength}
              </Text>
            ) : null}
          </View>
        </View>
        {renderAddon(addonAfter, [resolved.addon, resolved.addonAfter, semantic?.addonAfter])}
      </View>
    </View>
  )
})

Input.displayName = 'Input'
