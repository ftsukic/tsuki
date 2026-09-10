import { forwardRef } from 'react'
import { Text, View } from 'react-native'
import type { TextInputInstance } from '../text-input'
import type { TextInputProps } from '../text-input'
import { InputCore } from './input-core'
import type { InputProps, InputSemanticStyles } from './interface'
import type { InputResolvedStyles } from './style'
import type { StyleProp, TextStyle } from 'react-native'

export interface InputTextareaProps {
  coreProps: TextInputProps
  autoSize: boolean
  rows: number
  styles: InputResolvedStyles
  semantic?: InputSemanticStyles
  value: string
  wordLimit?: number
  inputStyle?: StyleProp<TextStyle>
  scrollEnabled?: boolean
  onChangeText: (value: string) => void
  onContentSizeChange: (
    event: Parameters<NonNullable<InputProps['onContentSizeChange']>>[0],
  ) => void
}

export const InputTextarea = forwardRef<TextInputInstance, InputTextareaProps>(
  function InputTextarea(
    {
      coreProps,
      autoSize,
      rows,
      styles,
      semantic,
      value,
      wordLimit,
      inputStyle,
      scrollEnabled,
      onChangeText,
      onContentSizeChange,
    },
    ref,
  ) {
    return (
      <View style={[styles.shell, styles.textareaShell, semantic?.shell]}>
        <InputCore
          {...coreProps}
          ref={ref}
          value={value}
          multiline
          textAlignVertical="top"
          numberOfLines={autoSize ? undefined : rows}
          scrollEnabled={autoSize ? scrollEnabled : coreProps.scrollEnabled}
          style={[styles.input, styles.textareaInput, inputStyle, semantic?.input]}
          onChangeText={onChangeText}
          onContentSizeChange={onContentSizeChange}
        />
        {wordLimit !== undefined ? (
          <Text style={[styles.wordLimit, semantic?.wordLimit]}>
            {value.length}/{wordLimit}
          </Text>
        ) : null}
      </View>
    )
  },
)

InputTextarea.displayName = 'InputTextarea'
