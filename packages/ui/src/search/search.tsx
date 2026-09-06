import { Button } from '../button'
import { useDebounceFn, usePersistFn } from '../hooks'
import { Icon } from '../icon'
import { useLocale } from '../locale'
import { TextInput } from '../text-input'
import { useToken } from '../theme'
import type { SearchInstance, SearchProps } from './interface'
import isUndefined from 'lodash/isUndefined'
import { forwardRef, memo, useCallback, useRef } from 'react'
import { View } from 'react-native'

export const Search = forwardRef<SearchInstance, SearchProps>(
  (
    {
      theme,
      iconSize,
      iconColor,
      onSearch,
      showBack = false,
      onPressBack,
      autoSearch = false,
      showSearchButton = true,
      onSearchDebounceWait = 300,
      searchText,
      inputStyle,
      inputGroupStyle,
      inputContainerStyle,
      inputPrefixTextStyle,
      inputSuffixTextStyle,
      searchButtonStyle,
      searchButtonProps,
      extra,
      prefix,
      suffix,
      value,
      defaultValue,
      placeholder,
      placeholderTextColor,
      autoFocus,
      onChangeText,
      onSubmitEditing,
      style,
      ...props
    },
    ref,
  ) => {
    const locale = useLocale().Search
    const { components } = useToken()
    const token = { ...components.Search, ...theme }
    const resolvedIconSize = iconSize ?? token.iconSize
    const current = useRef(!isUndefined(value) ? value : (defaultValue ?? ''))
    const onChangeTextPersist = usePersistFn(onChangeText ?? (() => undefined))
    const { run: runSearch } = useDebounceFn(onSearch ?? (() => undefined), {
      wait: onSearchDebounceWait,
    })
    const onChange = useCallback(
      (text: string) => {
        current.current = text
        onChangeTextPersist(text)
        if (autoSearch) runSearch(text)
      },
      [autoSearch, onChangeTextPersist, runSearch],
    )
    return (
      <View
        {...props}
        style={[
          {
            backgroundColor: token.backgroundColor,
            paddingHorizontal: token.paddingHorizontal,
            paddingVertical: token.paddingVertical,
            flexDirection: 'row',
            alignItems: 'center',
          },
          style,
        ]}
      >
        {showBack ? (
          <Icon
            name="LeftOutlined"
            onPress={onPressBack}
            color={token.backIconColor as string}
            size={token.backIconSize}
            style={{ marginRight: token.gap }}
          />
        ) : null}
        <TextInput
          ref={ref}
          // Keep the native input uncontrolled while the IME is composing text.
          {...{ defaultValue: !isUndefined(value) ? value : defaultValue }}
          clearable
          fixGroupStyle={[
            {
              flex: 1,
              backgroundColor: token.inputBackgroundColor,
              borderRadius: token.inputBorderRadius,
            },
            inputGroupStyle,
          ]}
          style={[{ marginLeft: token.gap }, inputStyle]}
          containerStyle={inputContainerStyle}
          prefixTextStyle={inputPrefixTextStyle}
          suffixTextStyle={inputSuffixTextStyle}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor ?? token.backIconColor}
          prefix={
            <>
              {prefix}
              <Icon
                name="SearchOutlined"
                color={(iconColor ?? placeholderTextColor ?? token.backIconColor) as string}
                size={resolvedIconSize}
              />
            </>
          }
          suffix={suffix}
          onChangeText={onChange}
          onSubmitEditing={(event) => {
            if (onSubmitEditing) {
              onSubmitEditing(event)
            } else {
              runSearch(event.nativeEvent.text)
            }
          }}
          autoFocus={autoFocus}
        />
        {showSearchButton ? (
          <Button
            text={searchText ?? locale.searchText}
            type="primary"
            size="small"
            {...searchButtonProps}
            style={
              typeof searchButtonStyle === 'function'
                ? (state) => [{ marginLeft: token.gap }, searchButtonStyle(state)]
                : [{ marginLeft: token.gap }, searchButtonStyle]
            }
            onPress={() => runSearch(current.current)}
          />
        ) : null}
        {extra}
      </View>
    )
  },
)

Search.displayName = 'Search'

export default memo(Search)
