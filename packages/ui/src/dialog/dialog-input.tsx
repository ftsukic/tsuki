import { callInterceptor } from '../helpers'
import { TextInput, type TextInputInstance } from '../text-input'
import { useToken } from '../theme'
import DialogKeyboard from './dialog-keyboard'
import type { DialogAction, DialogInputProps } from './interface'
import isNil from 'lodash/isNil'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, View } from 'react-native'

function DialogInput({
  showCancelButton = true,
  theme,
  defaultValue = '',
  placeholder,
  type = 'text',
  autoFocus = true,
  safeAreaTop,
  beforeClose,
  onPressCancel,
  onPressConfirm,
  textInput: { value: textValue, onChangeText, ...textInputProps } = {},
  numberInput: { value: numberValue, onChange, ...numberInputProps } = {},
  passwordInput: {
    value: passwordValue,
    onChangeText: onPasswordChangeText,
    ...passwordInputProps
  } = {},
  ...props
}: DialogInputProps) {
  const { components } = useToken()
  const token = { ...components.Dialog, ...theme }
  const inputRef = useRef<TextInputInstance>(null)
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState<string | number>(defaultValue)
  const controlledValue =
    type === 'text' || type === 'textarea'
      ? textValue
      : type === 'password'
        ? passwordValue
        : numberValue

  useEffect(() => setVisible(true), [])
  useEffect(() => {
    if (!isNil(controlledValue)) setValue(controlledValue)
  }, [controlledValue])

  useEffect(() => {
    if (!autoFocus) return
    const timer = setTimeout(() => inputRef.current?.focus(), props.duration ?? 200)
    return () => clearTimeout(timer)
  }, [autoFocus, props.duration])

  const finish = useCallback(
    (action: Exclude<DialogAction, 'overlay'>) => {
      Keyboard.dismiss()
      const text = isNil(value) ? '' : `${value}`
      const callback = action === 'confirm' ? onPressConfirm : onPressCancel
      callInterceptor(beforeClose, {
        args: [action, text],
        done: () =>
          callInterceptor(callback, {
            args: [text],
            done: () => setVisible(false),
          }),
      })
    },
    [beforeClose, onPressCancel, onPressConfirm, value],
  )

  const isText = type === 'text' || type === 'textarea'
  return (
    <DialogKeyboard
      {...props}
      theme={theme}
      safeAreaTop={safeAreaTop}
      visible={visible}
      showCancelButton={showCancelButton}
      closeOnPressOverlay={false}
      onPressConfirm={() => finish('confirm')}
      onPressCancel={() => finish('cancel')}
      onPressClose={() => setVisible(false)}
    >
      <View
        style={{
          marginHorizontal: token.inputMarginHorizontal,
          marginTop: token.inputMarginTop,
          paddingBottom: token.inputPaddingBottom,
          overflow: 'hidden',
          maxHeight: token.inputMaxHeight,
        }}
      >
        {isText ? (
          <TextInput
            {...textInputProps}
            ref={inputRef}
            type={type}
            placeholder={placeholder}
            value={value as string}
            onChangeText={(next) => {
              setValue(next)
              onChangeText?.(next)
            }}
            bordered
          />
        ) : type === 'password' ? (
          <TextInput.Password
            {...passwordInputProps}
            ref={inputRef}
            placeholder={placeholder}
            value={value as string}
            onChangeText={(next) => {
              setValue(next)
              onPasswordChangeText?.(next)
            }}
            bordered
          />
        ) : (
          <TextInput.Number
            {...numberInputProps}
            ref={inputRef}
            type={type}
            placeholder={placeholder}
            value={value as number}
            onChange={(next) => {
              setValue(next ?? '')
              onChange?.(next)
            }}
            bordered
          />
        )}
      </View>
    </DialogKeyboard>
  )
}

export default memo(DialogInput)
