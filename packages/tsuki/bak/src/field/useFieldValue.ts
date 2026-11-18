import { useCallback, useState } from 'react'

export interface UseFieldValueOptions<Value> {
  value?: Value
  defaultValue?: Value
  onChange?: (value: Value) => void
}

export function useFieldValue<Value>({
  value,
  defaultValue,
  onChange,
}: UseFieldValueOptions<Value>) {
  const [internalValue, setInternalValue] = useState<Value | undefined>(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const setValue = useCallback(
    (nextValue: Value) => {
      if (!isControlled) setInternalValue(nextValue)
      onChange?.(nextValue)
    },
    [isControlled, onChange],
  )

  return { currentValue, setValue }
}
