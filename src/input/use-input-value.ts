import { useCallback, useState } from 'react'
import type { InputFormatTrigger } from './interface'

interface UseInputValueOptions {
  value?: string
  defaultValue?: string
  formatter?: (value: string) => string
  formatTrigger: InputFormatTrigger
  onChangeText?: (value: string) => void
}

export function useInputValue({
  value: controlledValue,
  defaultValue,
  formatter,
  formatTrigger,
  onChangeText,
}: UseInputValueOptions) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const setValue = useCallback(
    (nextValue: string) => {
      if (controlledValue === undefined) setInternalValue(nextValue)
    },
    [controlledValue],
  )

  const handleChangeText = useCallback(
    (nextValue: string) => {
      const formattedValue =
        formatter && formatTrigger === 'onChangeText' ? formatter(nextValue) : nextValue
      setValue(formattedValue)
      onChangeText?.(formattedValue)
    },
    [formatTrigger, formatter, onChangeText, setValue],
  )

  const handleEndEditing = useCallback(
    (nextValue: string) => {
      if (formatter && formatTrigger === 'onEndEditing') {
        const formattedValue = formatter(nextValue)
        setValue(formattedValue)
        onChangeText?.(formattedValue)
        return formattedValue
      }
      return nextValue
    },
    [formatTrigger, formatter, onChangeText, setValue],
  )

  return { value, setValue, handleChangeText, handleEndEditing }
}
