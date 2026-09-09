import { useCallback, useState } from 'react'

interface ControllableValueOptions<Value> {
  value?: Value
  defaultValue: Value
  onChange?: (value: Value) => void
}

export function useControllableValue<Value>({
  value,
  defaultValue,
  onChange,
}: ControllableValueOptions<Value>) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const currentValue = isControlled ? (value as Value) : uncontrolledValue

  const setValue = useCallback(
    (nextValue: Value) => {
      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
    },
    [isControlled, onChange],
  )

  return [currentValue, setValue] as const
}
