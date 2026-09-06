import { Icon } from '../icon'
import { useToken } from '../theme'
import type { TextInputInstance, TextInputProps } from './interface'
import { createTextInputStyles } from './style'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, Text, TextInput as NativeTextInput, View } from 'react-native'
import type { NativeSyntheticEvent, TextInputEndEditingEventData } from 'react-native'

type TextInputFocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0]
type TextInputBlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0]

const SIZE_CONFIG = {
  xl: { height: 'controlHeightLG', fontSize: 'fontSizeLG' },
  l: { height: 'controlHeightLG', fontSize: 'fontSizeLG' },
  m: { height: 'controlHeight', fontSize: 'fontSize' },
  s: { height: 'controlHeightSM', fontSize: 'fontSizeSM' },
} as const

function renderText(content: ReactNode, style: object) {
  if (content === null || content === undefined || content === false) return null
  if (typeof content === 'string' || typeof content === 'number') {
    return <Text style={style}>{content}</Text>
  }
  return content
}

export const TextInput = forwardRef<TextInputInstance, TextInputProps>(
  (
    {
      theme,
      style,
      containerStyle,
      addonGroupStyle,
      addonBeforeTextStyle,
      addonAfterTextStyle,
      fixGroupStyle,
      prefixTextStyle,
      suffixTextStyle,
      type = 'text',
      rows = 2,
      clearable = false,
      clearTrigger = 'focus',
      formatter,
      formatTrigger = 'onChangeText',
      showWordLimit = false,
      bordered = false,
      borderRadius,
      addonBefore,
      addonAfter,
      prefix,
      suffix,
      inputWidth,
      size = 'm',
      value,
      defaultValue,
      onChange,
      onChangeText,
      onFocus,
      onBlur,
      onEndEditing,
      editable = true,
      maxLength,
      multiline,
      placeholderTextColor,
      selectionColor,
      ...nativeProps
    },
    ref,
  ) => {
    const { token: themeToken, components } = useToken()
    const token = { ...components.Input, ...theme }
    const styles = createTextInputStyles(token)
    const inputRef = useRef<NativeTextInput>(null)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const [focused, setFocused] = useState(false)
    const currentValue = value ?? internalValue
    const isTextarea = type === 'textarea'
    const sizeConfig = SIZE_CONFIG[size]
    const inputHeight = themeToken[sizeConfig.height]
    const fontSize = themeToken[sizeConfig.fontSize]
    const showClear = clearable && Boolean(currentValue) && (clearTrigger === 'always' || focused)
    const showLimit = isTextarea && showWordLimit && maxLength !== undefined

    useImperativeHandle(ref, () => inputRef.current as NativeTextInput)

    const updateValue = (nextValue: string) => {
      const next = formatter && formatTrigger === 'onChangeText' ? formatter(nextValue) : nextValue
      if (value === undefined) setInternalValue(next)
      onChange?.(next)
      onChangeText?.(next)
    }

    const handleEndEditing = (event: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      if (formatter && formatTrigger === 'onEndEditing') {
        updateValue(formatter(event.nativeEvent.text))
      }
      onEndEditing?.(event)
    }

    const handleFocus = (event: TextInputFocusEvent) => {
      setFocused(true)
      onFocus?.(event)
    }

    const handleBlur = (event: TextInputBlurEvent) => {
      setFocused(false)
      onBlur?.(event)
    }

    const handleClear = () => {
      inputRef.current?.clear()
      updateValue('')
      inputRef.current?.focus()
    }

    const inputStyle = [
      styles.input,
      { fontSize, minHeight: isTextarea ? inputHeight * rows : inputHeight },
      !editable && styles.inputDisabled,
      isTextarea && { textAlignVertical: 'top' as const },
      inputWidth !== undefined && { flexBasis: inputWidth, width: inputWidth },
      style,
    ]
    const fixStyle = [
      styles.fixGroup,
      bordered && {
        borderColor: focused ? token.activeBorderColor : token.borderColor,
        backgroundColor: editable ? token.backgroundColor : token.disabledBackgroundColor,
      },
      !bordered && { borderWidth: 0 },
      borderRadius !== undefined && { borderRadius },
      fixGroupStyle,
    ]
    const content = (
      <View style={[{ minHeight: inputHeight, minWidth: 0 }, styles.content, containerStyle]}>
        {isTextarea ? null : renderText(prefix, [styles.prefix, prefixTextStyle])}
        <NativeTextInput
          {...nativeProps}
          ref={inputRef}
          editable={editable}
          multiline={isTextarea ? true : multiline}
          maxLength={maxLength}
          placeholderTextColor={placeholderTextColor ?? token.placeholderColor}
          selectionColor={selectionColor ?? token.selectionColor}
          style={inputStyle}
          {...(value === undefined
            ? { defaultValue: defaultValue ?? '' }
            : { value: currentValue })}
          onBlur={handleBlur}
          onChangeText={updateValue}
          onEndEditing={handleEndEditing}
          onFocus={handleFocus}
          returnKeyType={
            isTextarea ? nativeProps.returnKeyType : (nativeProps.returnKeyType ?? 'done')
          }
        />
        {clearable ? (
          <Pressable
            onPress={showClear ? handleClear : undefined}
            hitSlop={themeToken.sizeSM}
            pointerEvents={showClear ? 'auto' : 'none'}
            style={[styles.clear, !showClear && styles.clearHidden]}
            accessibilityRole="button"
            accessibilityLabel="清除输入"
          >
            <Icon
              name="CloseOutlined"
              size={token.clearButtonSize * 0.7}
              color={token.clearButtonColor}
            />
          </Pressable>
        ) : null}
        {isTextarea ? null : renderText(suffix, [styles.suffix, suffixTextStyle])}
        {showLimit ? (
          <Text style={styles.wordLimit}>
            {currentValue.length}/{maxLength}
          </Text>
        ) : null}
      </View>
    )

    return (
      <View style={[styles.addonGroup, addonGroupStyle]}>
        {isTextarea
          ? null
          : renderText(addonBefore, [styles.addonText, styles.addonBefore, addonBeforeTextStyle])}
        {isTextarea || bordered || prefix || suffix ? (
          <View style={fixStyle}>{content}</View>
        ) : (
          content
        )}
        {isTextarea
          ? null
          : renderText(addonAfter, [styles.addonText, styles.addonAfter, addonAfterTextStyle])}
      </View>
    )
  },
)

TextInput.displayName = 'TextInput'
