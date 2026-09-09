import { forwardRef } from 'react'
import { TextInput as NativeTextInput } from 'react-native'
import type {
  TextInput as NativeTextInputInstance,
  TextInputProps as NativeTextInputProps,
} from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'

export interface InputCoreProps extends Omit<
  NativeTextInputProps,
  'defaultValue' | 'onChange' | 'onChangeText' | 'style' | 'value'
> {
  value?: string
  defaultValue?: string
  onChange?: NativeTextInputProps['onChange']
  onChangeText?: NativeTextInputProps['onChangeText']
  style?: StyleProp<TextStyle>
}

/** Shared native input boundary; value and event policy belong to its caller. */
export const InputCore = forwardRef<NativeTextInputInstance, InputCoreProps>(
  function InputCore(props, ref) {
    return <NativeTextInput {...props} ref={ref} />
  },
)

InputCore.displayName = 'InputCore'
