import { TextInput } from '../text-input'
import { Icon } from '../icon'
import { InteractionPressable } from '../interaction'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getSearchToken } from '../theme/components/search'
import { getSearchStyles } from './Search.styles'
import {
  SEARCH_DEFAULT_SHAPE,
  SEARCH_DEFAULT_SHOW_CLEAR,
  SEARCH_DEFAULT_SIZE,
} from './Search.constants'
import type { SearchProps, SearchStyleState } from './Search.types'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'

export const Search = forwardRef<NativeTextInput, SearchProps>(function Search(
  {
    value,
    defaultValue,
    onChange,
    onChangeText,
    onFocus,
    onBlur,
    placeholder,
    disabled = false,
    readOnly = false,
    size = SEARCH_DEFAULT_SIZE,
    shape = SEARCH_DEFAULT_SHAPE,
    background,
    prefix,
    leftIcon,
    suffix,
    height,
    showClear = SEARCH_DEFAULT_SHOW_CLEAR,
    onClear,
    multiline = false,
    style,
    styles,
    testID,
    ...nativeProps
  },
  ref,
) {
  const token = useComponentToken('Search', getSearchToken)
  const inputRef = useRef<NativeTextInput>(null)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [focused, setFocused] = useState(false)
  const currentValue = value ?? internalValue
  const isDisabled = disabled === true
  const isEditable = !isDisabled && !readOnly
  const state: SearchStyleState = { focused, disabled: isDisabled }
  const searchProps: SearchProps = {
    ...nativeProps,
    value,
    defaultValue,
    onChange,
    onChangeText,
    onFocus,
    onBlur,
    placeholder,
    disabled,
    readOnly,
    size,
    shape,
    background,
    prefix,
    leftIcon,
    suffix,
    height,
    showClear,
    onClear,
    multiline,
    style,
    styles,
    testID,
  }
  const resolved = getSearchStyles(token, searchProps, state)
  const semantic = resolveStyles(styles, { props: searchProps, state })
  const hasValue = currentValue.length > 0
  const showClearButton = suffix === undefined && showClear && hasValue

  useImperativeHandle(ref, () => {
    const input = inputRef.current
    if (!input) throw new Error('Search ref is not ready')
    return input
  }, [])

  const handleChangeText = useCallback(
    (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue)
      onChange?.(nextValue)
      onChangeText?.(nextValue)
    },
    [onChange, onChangeText, value],
  )

  const handleFocus = useCallback(
    (event: Parameters<NonNullable<SearchProps['onFocus']>>[0]) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: Parameters<NonNullable<SearchProps['onBlur']>>[0]) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const handleClear = useCallback(() => {
    const wasFocused = focused
    if (value === undefined) setInternalValue('')
    inputRef.current?.clear()
    onChange?.('')
    onChangeText?.('')
    onClear?.()
    if (wasFocused) inputRef.current?.focus()
  }, [focused, onChange, onChangeText, onClear, value])

  const renderedPrefix =
    prefix !== undefined ? (
      prefix
    ) : leftIcon !== undefined ? (
      leftIcon
    ) : (
      <Icon name="SearchOutlined" size={token.search_icon_size} color={token.search_icon_color} />
    )
  const renderedSuffix =
    suffix !== undefined ? (
      suffix
    ) : showClearButton ? (
      <InteractionPressable
        testID={testID === undefined ? undefined : testID + '-clear'}
        accessibilityRole="button"
        accessibilityLabel="清除输入"
        disabled={!isEditable}
        onPress={handleClear}
        style={({ pressed }) => [
          resolved.clear,
          pressed && { opacity: token.search_pressed_opacity },
          semantic?.clear,
        ]}
      >
        <Icon
          name="CloseCircleFilled"
          size={token.search_clear_size}
          color={isDisabled ? token.search_disabled_text_color : token.search_clear_color}
        />
      </InteractionPressable>
    ) : null

  return (
    <View style={[resolved.root, semantic?.root, style]}>
      <View
        testID={testID === undefined ? undefined : `${testID}-container`}
        style={[resolved.container, semantic?.container]}
      >
        {renderedPrefix !== null && renderedPrefix !== false ? (
          <View
            testID={testID === undefined ? undefined : testID + '-prefix'}
            style={[resolved.prefix, semantic?.prefix, semantic?.leftIcon]}
          >
            {renderedPrefix}
          </View>
        ) : null}
        <TextInput
          {...nativeProps}
          ref={inputRef}
          testID={testID}
          value={currentValue}
          editable={isEditable}
          multiline={multiline}
          textAlignVertical={multiline ? nativeProps.textAlignVertical : 'center'}
          placeholder={placeholder}
          placeholderTextColor={nativeProps.placeholderTextColor ?? token.search_placeholder_color}
          style={[resolved.input, semantic?.input]}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {renderedSuffix !== null && renderedSuffix !== false ? (
          <View
            testID={testID === undefined ? undefined : testID + '-suffix'}
            style={[resolved.suffix, semantic?.suffix]}
          >
            {renderedSuffix}
          </View>
        ) : null}
      </View>
    </View>
  )
})

Search.displayName = 'Search'
