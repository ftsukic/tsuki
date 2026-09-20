import { forwardRef } from 'react'
import type { TextInputInstance } from '../text-input'
import { InputInternal } from './input-internal'
import type { InputProps } from './types'

interface InputCompatibilityProps {
  /**
   * @deprecated Internal compatibility prop.
   * Do not use in application code.
   */
  embedded?: boolean
}

export const Input = forwardRef<TextInputInstance, InputProps & InputCompatibilityProps>(
  function Input(props, ref) {
    return <InputInternal {...props} ref={ref} />
  },
)

Input.displayName = 'Input'
