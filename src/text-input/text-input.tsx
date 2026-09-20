import { forwardRef } from 'react'
import { TextInput as NativeTextInput } from 'react-native'
import type { TextInputInstance, TextInputProps } from './types'

/** Stable native input boundary used by Input and other compound components. */
export const TextInput = forwardRef<TextInputInstance, TextInputProps>(
  function TextInput(props, ref) {
    return <NativeTextInput {...props} ref={ref} />
  },
)

TextInput.displayName = 'TextInput'
