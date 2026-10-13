import { forwardRef } from 'react'
import type { TextInput as NativeTextInput } from 'react-native'
import { InputInternal } from './input-internal'
import type { InputProps } from './types'

export const Input = forwardRef<NativeTextInput, InputProps>(function Input(props, ref) {
  return <InputInternal {...props} ref={ref} />
})

Input.displayName = 'Input'
