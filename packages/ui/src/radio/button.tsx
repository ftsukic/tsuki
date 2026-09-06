import { forwardRef } from 'react'
import type { ElementRef } from 'react'
import type { RadioProps } from './interface'
import { Radio } from './radio'

export const RadioButton = forwardRef<ElementRef<typeof Radio>, RadioProps>(
  function RadioButton(props, ref) {
    return <Radio {...props} ref={ref} optionType="button" />
  },
)

RadioButton.displayName = 'Radio.Button'
