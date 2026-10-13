import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'
import type { TextInputProps } from 'react-native'
import { Text } from '../text'
import { TextInput } from 'react-native'
import type { InputSemanticStyles } from './types'
import type { InputResolvedStyles } from './style'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface InputTextareaProps {
  coreProps: TextInputProps
  rootStyle?: StyleProp<ViewStyle>
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

export const InputTextarea = forwardRef<NativeTextInput, InputTextareaProps>(function InputTextarea(
  {
    coreProps,
    rootStyle,
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
  const [inputWidth, setInputWidth] = useState<number>()
  const measurementRef = useRef<NativeTextInput>(null)
  // RN Web only measures on mount and user input, not controlled value updates.
  useLayoutEffect(() => {
    if (!autoSize || Platform.OS !== 'web') return
    const node = measurementRef.current as unknown as {
      scrollHeight: number
      style: { height: string }
    } | null
    if (!node || typeof node.scrollHeight !== 'number' || !node.style) return
    node.style.height = '0px'
    onAutoSizeMeasure?.(node.scrollHeight)
  })

  const shellStyle = StyleSheet.flatten([styles.shell, styles.textareaShell, rootStyle])
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
    <View style={[styles.shell, styles.textareaShell, rootStyle]}>
      <TextInput
        {...coreProps}
        ref={ref}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width
          setInputWidth((previous) => (previous === width ? previous : width))
          coreProps.onLayout?.(event)
        }}
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
          // iOS can retain an old contentSize after JS text updates without a layout change.
          key={Platform.OS === 'ios' ? `${inputWidth}:${value}` : undefined}
          ref={measurementRef}
          value={value.length > 0 ? value : ' '}
          numberOfLines={Platform.OS === 'web' ? 1 : undefined}
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
              height: Platform.OS === 'web' ? 0 : undefined,
              width: inputWidth,
              left: shellStyle.paddingLeft ?? shellHorizontalPadding,
              maxHeight: undefined,
              minHeight: undefined,
              opacity: 0,
              position: 'absolute',
              right:
                inputWidth === undefined
                  ? (shellStyle.paddingRight ?? shellHorizontalPadding)
                  : undefined,
            },
          ]}
          onContentSizeChange={(event) => {
            onAutoSizeMeasure?.(event.nativeEvent.contentSize.height)
          }}
        />
      ) : null}
      {wordLimit !== undefined ? (
        <Text
          allowFontScaling={coreProps.allowFontScaling}
          maxFontSizeMultiplier={coreProps.maxFontSizeMultiplier}
          style={[styles.wordLimit, semantic?.count]}
        >
          {value.length}/{wordLimit}
        </Text>
      ) : null}
    </View>
  )
})

InputTextarea.displayName = 'InputTextarea'
