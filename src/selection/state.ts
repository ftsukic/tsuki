import { useCallback, useState } from 'react'

export interface ControllableSelectionOptions<Value> {
  value?: Value
  defaultValue?: Value
  onChange?: (value: Value) => void
}

export interface ControllableSelection<Value> {
  isControlled: boolean
  value: Value | undefined
  select: (value: Value) => boolean
}

export function useControllableSelection<Value>({
  value,
  defaultValue,
  onChange,
}: ControllableSelectionOptions<Value>): ControllableSelection<Value> {
  const [uncontrolledValue, setUncontrolledValue] = useState<Value | undefined>(defaultValue)
  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : uncontrolledValue

  const select = useCallback(
    (nextValue: Value) => {
      if (Object.is(selectedValue, nextValue)) return false
      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
      return true
    },
    [isControlled, onChange, selectedValue],
  )

  return { isControlled, select, value: selectedValue }
}
