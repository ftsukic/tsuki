import { forwardRef, useCallback } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
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
  onMeasureContentSize?: (height: number) => void
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
      onMeasureContentSize,
    },
    ref,
  ) {
    const handleMeasureLayout = useCallback(
      (event: LayoutChangeEvent) => {
        onMeasureContentSize?.(event.nativeEvent.layout.height)
      },
      [onMeasureContentSize],
    )
    const shellStyle = StyleSheet.flatten([styles.shell, styles.textareaShell, semantic?.shell])
    const shellHorizontalPadding =
      typeof shellStyle.paddingHorizontal === 'number' ? shellStyle.paddingHorizontal : 0

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
          style={[
            styles.input,
            styles.textareaInput,
            autoSize && { flex: undefined, flexGrow: 1, flexShrink: 1 },
            inputStyle,
            semantic?.input,
          ]}
          onChangeText={onChangeText}
          onContentSizeChange={onContentSizeChange}
        />
        {autoSize ? (
          <Text
            accessible={false}
            importantForAccessibility="no"
            onLayout={handleMeasureLayout}
            pointerEvents="none"
            style={[
              styles.input,
              styles.textareaInput,
              semantic?.input,
              {
                flex: undefined,
                flexGrow: undefined,
                flexShrink: undefined,
                height: undefined,
                left: shellHorizontalPadding,
                maxHeight: undefined,
                minHeight: undefined,
                opacity: 0,
                position: 'absolute',
                right: shellHorizontalPadding,
              },
            ]}
          >
            {value.length > 0 ? value : ' '}
          </Text>
        ) : null}
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
