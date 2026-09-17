import { useComponentToken } from '../theme'
import { resolveStyles } from '../style'
import type { TextInputInstance, TextInputProps } from '../text-input'
import { forwardRef, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import type { InputProps, InputStyleState } from './types'
import { getInputMetrics, getInputStyles, getTextareaMetrics } from './style'
import { getInputToken } from './token'
import { InputSingle } from './input-single'
import { InputTextarea } from './input-textarea'
import { renderInputAffix } from './input-affix'
import { useInputAutoSize } from './use-input-auto-size'
import { useInputValue } from './use-input-value'

interface InputInternalProps {
  /** Internal layout mode used by FieldInput. */
  embedded?: boolean
}

export const Input = forwardRef<TextInputInstance, InputProps & InputInternalProps>(function Input(
  {
    type = 'text',
    size = 'normal',
    bordered = false,
    focusedBordered = true,
    clearable = false,
    clearTrigger = 'focus',
    formatter,
    formatTrigger = 'onChangeText',
    showWordLimit = false,
    rows = 2,
    autoSize = false,
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
    onContentSizeChange,
    embedded = false,
    ...nativeProps
  },
  ref,
) {
  const token = useComponentToken('Input', getInputToken)
  const [focused, setFocused] = useState(false)
  const [internalPasswordVisible, setInternalPasswordVisible] = useState(defaultPasswordVisible)
  const isTextarea = nativeProps.multiline === true
  const isAutoSize = isTextarea && Boolean(autoSize)
  const autoSizeConfig = typeof autoSize === 'object' ? autoSize : undefined
  const minRows = Math.max(1, Math.floor(autoSizeConfig?.minRows ?? 1))
  const maxRows = Math.max(minRows, Math.floor(autoSizeConfig?.maxRows ?? 5))
  const isPassword = type === 'password'
  const isDisabled = disabled || (editable === false && !readOnly)
  const isEditable = !disabled && !readOnly && editable !== false
  const currentPasswordVisible = passwordVisible ?? internalPasswordVisible
  const keyboardType =
    type === 'number' ? 'numeric' : type === 'tel' ? 'phone-pad' : nativeProps.keyboardType
  const secureTextEntry = isPassword ? !currentPasswordVisible : nativeProps.secureTextEntry
  const state: InputStyleState = { focused, disabled: isDisabled }
  const metrics = isTextarea
    ? getTextareaMetrics(token, size)
    : getInputMetrics(token, size, embedded)
  const inputProps = useMemo<InputProps>(
    () => ({
      ...nativeProps,
      type,
      size,
      bordered,
      focusedBordered,
      clearable,
      clearTrigger,
      formatter,
      formatTrigger,
      showWordLimit,
      rows,
      autoSize,
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
    }),
    [
      addonAfter,
      addonBefore,
      focusedBordered,
      autoSize,
      bordered,
      clearTrigger,
      clearable,
      defaultPasswordVisible,
      defaultValue,
      disabled,
      editable,
      formatter,
      formatTrigger,
      maxLength,
      nativeProps,
      onBlur,
      onChange,
      onChangeText,
      onClear,
      onEndEditing,
      onFocus,
      onPasswordVisibleChange,
      passwordVisible,
      prefix,
      readOnly,
      rows,
      showWordLimit,
      size,
      suffix,
      type,
      value,
    ],
  )
  const resolved = getInputStyles(token, inputProps, state, embedded)
  const semantic = resolveStyles(styles, { props: inputProps, state })
  const {
    value: currentValue,
    handleChangeText,
    handleEndEditing,
    setValue,
  } = useInputValue({
    value,
    defaultValue,
    formatter,
    formatTrigger,
    onChangeText,
  })
  const showClear =
    !isTextarea &&
    clearable &&
    isEditable &&
    currentValue.length > 0 &&
    (clearTrigger === 'always' || focused)
  const wordLimitPadding =
    showWordLimit && maxLength !== undefined
      ? (isTextarea ? token.textareaLineHeightSM : token.lineHeightSM) + metrics.paddingVertical
      : 0
  const autoSizeState = useInputAutoSize({
    enabled: isAutoSize,
    value: currentValue,
    minRows,
    maxRows,
    lineHeight: metrics.lineHeight,
    verticalPadding: metrics.paddingVertical * 2,
    wordLimitPadding,
  })

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
  const handleEndEditingEvent = useCallback(
    (event: Parameters<NonNullable<InputProps['onEndEditing']>>[0]) => {
      handleEndEditing(event.nativeEvent.text)
      onEndEditing?.(event)
    },
    [handleEndEditing, onEndEditing],
  )
  const handleContentSizeChange = useCallback(
    (event: Parameters<NonNullable<InputProps['onContentSizeChange']>>[0]) => {
      onContentSizeChange?.(event)
    },
    [onContentSizeChange],
  )
  const handleClear = useCallback(() => {
    setValue('')
    onChangeText?.('')
    onClear?.()
  }, [onChangeText, onClear, setValue])
  const handlePasswordVisibleChange = useCallback(() => {
    const nextVisible = !currentPasswordVisible
    if (passwordVisible === undefined) setInternalPasswordVisible(nextVisible)
    onPasswordVisibleChange?.(nextVisible)
  }, [currentPasswordVisible, onPasswordVisibleChange, passwordVisible])

  const coreProps: TextInputProps = {
    ...nativeProps,
    editable: isEditable,
    keyboardType,
    secureTextEntry,
    maxLength,
    placeholderTextColor: nativeProps.placeholderTextColor ?? token.placeholderColor,
    selectionColor: nativeProps.selectionColor ?? token.selectionColor,
    returnKeyType: isTextarea ? nativeProps.returnKeyType : (nativeProps.returnKeyType ?? 'done'),
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onEndEditing: handleEndEditingEvent,
    onContentSizeChange: handleContentSizeChange,
  }

  return (
    <View style={[resolved.root, semantic?.root, style]}>
      <View style={resolved.addonGroup}>
        {renderInputAffix(addonBefore, [
          resolved.addon,
          resolved.addonBefore,
          semantic?.addonBefore,
        ])}
        {isTextarea ? (
          <InputTextarea
            ref={ref}
            coreProps={coreProps}
            autoSize={isAutoSize}
            rows={Math.max(1, rows)}
            styles={resolved}
            semantic={semantic}
            value={currentValue}
            wordLimit={showWordLimit && maxLength !== undefined ? maxLength : undefined}
            inputStyle={autoSizeState.inputStyle}
            scrollEnabled={autoSizeState.scrollEnabled}
            onChangeText={handleChangeText}
            onAutoSizeMeasure={autoSizeState.onMeasure}
          />
        ) : (
          <InputSingle
            ref={ref}
            coreProps={coreProps}
            disabled={isDisabled}
            token={token}
            styles={resolved}
            semantic={semantic}
            value={currentValue}
            prefix={prefix}
            suffix={suffix}
            clearable={clearable}
            showClear={showClear}
            isPassword={isPassword}
            passwordVisible={currentPasswordVisible}
            onClear={handleClear}
            onPasswordVisibleChange={handlePasswordVisibleChange}
            onChangeText={handleChangeText}
          />
        )}
        {renderInputAffix(addonAfter, [resolved.addon, resolved.addonAfter, semantic?.addonAfter])}
      </View>
    </View>
  )
})

Input.displayName = 'Input'
