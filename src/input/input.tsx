import { forwardRef } from 'react'
import type { TextInputInstance } from '../text-input'
import { InputInternal } from './input-internal'
import type { InputProps } from './types'

export const Input = forwardRef<TextInputInstance, InputProps>(function Input(props, ref) {
  return <InputInternal {...props} ref={ref} />
})

Input.displayName = 'Input'
