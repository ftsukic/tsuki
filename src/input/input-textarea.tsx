import { forwardRef } from 'react'
import { StyleSheet, View } from 'react-native'
import type { TextInputInstance } from '../text-input'
import type { TextInputProps } from '../text-input'
import { Text } from '../text'
import { TextInput } from '../text-input'
import type { InputSemanticStyles } from './types'
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
  onAutoSizeMeasure?: (height: number) => void
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
      onAutoSizeMeasure,
    },
    ref,
  ) {
    const shellStyle = StyleSheet.flatten([styles.shell, styles.textareaShell, semantic?.shell])
    const shellHorizontalPadding =
      typeof shellStyle.paddingHorizontal === 'number' ? shellStyle.paddingHorizontal : 0
    const {
      allowFontScaling,
      maxFontSizeMultiplier,
      textBreakStrategy,
      lineBreakStrategyIOS,
      textAlign,
    } = coreProps

    return (
      <View style={[styles.shell, styles.textareaShell, semantic?.shell]}>
        <TextInput
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
        />
        {autoSize ? (
          <TextInput
            value={value.length > 0 ? value : ' '}
            multiline
            editable={false}
            scrollEnabled={false}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            textAlignVertical="top"
            allowFontScaling={allowFontScaling}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            textBreakStrategy={textBreakStrategy}
            lineBreakStrategyIOS={lineBreakStrategyIOS}
            textAlign={textAlign}
            testID={coreProps.testID ? `${coreProps.testID}__measure` : undefined}
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
            onContentSizeChange={(event) => {
              onAutoSizeMeasure?.(event.nativeEvent.contentSize.height)
            }}
          />
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
