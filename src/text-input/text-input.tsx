import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getTextInputStyles } from './style'
import { getInputToken } from './token'
import type { TextInputProps, TextInputStyleState } from './interface'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Pressable, Text, TextInput as NativeTextInput, View } from 'react-native'
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

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function TextInput(
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
    prefix,
    suffix,
    addonBefore,
    addonAfter,
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
  const inputRef = useRef<NativeTextInput>(null)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const currentValue = value ?? internalValue
  const isTextarea = type === 'textarea'
  const isDisabled = editable === false
  const state: TextInputStyleState = { focused, disabled: isDisabled }
  const inputProps: TextInputProps = {
    type,
    size,
    bordered,
    clearable,
    clearTrigger,
    formatter,
    formatTrigger,
    showWordLimit,
    rows,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
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
  }
  const semantic = resolveStyles(styles, { props: inputProps, state })
  const resolved = getTextInputStyles(inputToken, inputProps, state)
  const showClear = clearable && currentValue.length > 0 && (clearTrigger === 'always' || focused)
  const showLimit = showWordLimit && maxLength !== undefined

  useImperativeHandle(ref, () => {
    const input = inputRef.current
    if (!input) throw new Error('TextInput ref is not ready')
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
    (event: Parameters<NonNullable<TextInputProps['onEndEditing']>>[0]) => {
      if (formatter && formatTrigger === 'onEndEditing')
        updateValue(formatter(event.nativeEvent.text))
      onEndEditing?.(event)
    },
    [formatTrigger, formatter, onEndEditing, updateValue],
  )

  const handleFocus = useCallback(
    (event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const handleClear = useCallback(() => {
    inputRef.current?.clear()
    updateValue('')
    inputRef.current?.focus()
  }, [updateValue])

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
              editable={editable}
              multiline={isTextarea ? true : nativeProps.multiline}
              numberOfLines={isTextarea ? rows : nativeProps.numberOfLines}
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
            {clearable ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="清除输入"
                disabled={!showClear || isDisabled}
                onPress={handleClear}
                style={[resolved.clear, !showClear && { opacity: 0 }, semantic?.clear]}
                pointerEvents={showClear ? 'auto' : 'none'}
              >
                <Icon
                  name="CloseOutlined"
                  size={inputToken.clearButtonSize * 0.7}
                  color={inputToken.clearButtonColor}
                />
              </Pressable>
            ) : null}
            {renderAddon(suffix, [resolved.suffix, semantic?.suffix])}
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

TextInput.displayName = 'TextInput'
