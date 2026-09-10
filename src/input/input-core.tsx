import { forwardRef } from 'react'
import { TextInput } from '../text-input'
import type { TextInputInstance, TextInputProps } from '../text-input'

/** The private native-input composition boundary used by Input layouts. */
export const InputCore = forwardRef<TextInputInstance, TextInputProps>(
  function InputCore(props, ref) {
    return <TextInput {...props} ref={ref} />
  },
)

InputCore.displayName = 'InputCore'
