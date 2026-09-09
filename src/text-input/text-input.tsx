import { forwardRef } from 'react'
import { TextInput as NativeTextInput } from 'react-native'
import type { TextInput as NativeTextInputInstance } from 'react-native'
import type { InputCoreProps } from '../input/InputCore'

/** The native input layer used by Input and other compound components. */
export const TextInput = forwardRef<NativeTextInputInstance, InputCoreProps>(
  function TextInput(props, ref) {
    return <NativeTextInput {...props} ref={ref} />
  },
)

TextInput.displayName = 'TextInput'
