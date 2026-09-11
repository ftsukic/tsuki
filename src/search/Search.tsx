import { Input } from '../input'
import type { InputStyles } from '../input'
import { Icon } from '../icon'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getSearchToken } from '../theme/components/search'
import { getSearchStyles } from './Search.styles'
import {
  SEARCH_DEFAULT_CLEARABLE,
  SEARCH_DEFAULT_CLEAR_TRIGGER,
  SEARCH_DEFAULT_DEBOUNCE,
  SEARCH_DEFAULT_SHAPE,
} from './Search.constants'
import type { SearchProps, SearchStyleState } from './Search.types'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { Text, View } from 'react-native'

export const Search = forwardRef<React.ElementRef<typeof Input>, SearchProps>(function Search(
  {
    value,
    defaultValue,
    onChange,
    onChangeText,
    onClear,
    onSearch,
    autoSearch = false,
    debounce = SEARCH_DEFAULT_DEBOUNCE,
    disabled = false,
    readOnly = false,
    clearable = SEARCH_DEFAULT_CLEARABLE,
    clearTrigger = SEARCH_DEFAULT_CLEAR_TRIGGER,
    shape = SEARCH_DEFAULT_SHAPE,
    background,
    inputAlign = 'left',
    searchIcon,
    label,
    suffix,
    left,
    action,
    style,
    styles,
    testID,
    onSubmitEditing,
    placeholder,
    ...nativeProps
  },
  ref,
) {
  const token = useComponentToken('Search', getSearchToken)
  const currentValueRef = useRef(value ?? defaultValue ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDisabled = disabled === true
  const state: SearchStyleState = { disabled: isDisabled }
  const searchProps = {
    ...nativeProps,
    value,
    defaultValue,
    onChange,
    onChangeText,
    onClear,
    onSearch,
    autoSearch,
    debounce,
    disabled,
    readOnly,
    clearable,
    clearTrigger,
    shape,
    background,
    inputAlign,
    searchIcon,
    label,
    suffix,
    left,
    action,
    onSubmitEditing,
    placeholder,
    testID,
  } as SearchProps
  const resolved = getSearchStyles(token, searchProps, state)
  const semantic = resolveStyles(styles, { props: searchProps, state })

  if (value !== undefined) currentValueRef.current = value

  const clearDebounce = useCallback(() => {
    if (debounceRef.current === null) return
    clearTimeout(debounceRef.current)
    debounceRef.current = null
  }, [])

  useEffect(() => clearDebounce, [clearDebounce])

  const handleChangeText = useCallback(
    (nextValue: string) => {
      currentValueRef.current = nextValue
      onChange?.(nextValue)
      onChangeText?.(nextValue)

      if (!autoSearch || onSearch === undefined) return
      clearDebounce()
      debounceRef.current = setTimeout(
        () => {
          debounceRef.current = null
          onSearch(currentValueRef.current)
        },
        Math.max(0, debounce),
      )
    },
    [autoSearch, clearDebounce, debounce, onChange, onChangeText, onSearch],
  )

  const handleSubmitEditing = useCallback<NonNullable<SearchProps['onSubmitEditing']>>(
    (event) => {
      clearDebounce()
      onSearch?.(currentValueRef.current)
      onSubmitEditing?.(event)
    },
    [clearDebounce, onSearch, onSubmitEditing],
  )

  const renderedSearchIcon =
    searchIcon === undefined ? (
      <Icon
        name="SearchOutlined"
        size={token.search_icon_size}
        color={isDisabled ? token.search_disabled_text_color : token.search_icon_color}
      />
    ) : (
      searchIcon
    )
  const renderedLabel =
    typeof label === 'string' || typeof label === 'number' ? (
      <Text style={[resolved.label, semantic?.label]}>{label}</Text>
    ) : (
      label
    )
  const hasPrefix =
    (renderedSearchIcon !== null && renderedSearchIcon !== false) ||
    (renderedLabel !== null && renderedLabel !== undefined && renderedLabel !== false)
  const renderedPrefix = hasPrefix ? (
    <View
      testID={testID === undefined ? undefined : `${testID}-prefix`}
      style={[resolved.prefix, semantic?.prefix]}
    >
      {renderedSearchIcon}
      {renderedLabel}
    </View>
  ) : undefined
  const inputStyles: InputStyles = {
    shell: [resolved.inputShell, semantic?.content],
    input: [resolved.input, semantic?.input],
    suffix: semantic?.suffix,
    clear: semantic?.clear,
  }

  return (
    <View
      testID={testID === undefined ? undefined : `${testID}-root`}
      style={[resolved.root, semantic?.root, style]}
    >
      {left !== undefined ? (
        <View
          testID={testID === undefined ? undefined : `${testID}-left`}
          style={[resolved.left, semantic?.left]}
        >
          {left}
        </View>
      ) : null}
      <View
        testID={testID === undefined ? undefined : `${testID}-content`}
        style={[resolved.content, semantic?.content]}
      >
        <Input
          {...nativeProps}
          ref={ref}
          testID={testID}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          placeholderTextColor={nativeProps.placeholderTextColor ?? token.search_placeholder_color}
          clearable={clearable}
          clearTrigger={clearTrigger}
          bordered={false}
          prefix={renderedPrefix}
          suffix={suffix}
          returnKeyType={nativeProps.returnKeyType ?? 'search'}
          onChangeText={handleChangeText}
          onClear={onClear}
          onSubmitEditing={handleSubmitEditing}
          styles={inputStyles}
        />
      </View>
      {action !== undefined ? (
        <View
          testID={testID === undefined ? undefined : `${testID}-action`}
          style={[resolved.action, semantic?.action]}
        >
          {action}
        </View>
      ) : null}
    </View>
  )
})

Search.displayName = 'Search'
