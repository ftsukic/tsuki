import { Input } from '../input'
import type { TextInputProps } from './interface'
import { forwardRef } from 'react'
import type { TextInput as NativeTextInput } from 'react-native'

/** Backward-compatible TextInput API backed by the higher-level Input. */
export const TextInput = forwardRef<NativeTextInput, TextInputProps>(
  function TextInput(props, ref) {
    return <Input {...props} ref={ref} />
  },
)

TextInput.displayName = 'TextInput'
