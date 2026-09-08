import { useCallback, useMemo, useState } from 'react'
import type { CheckboxValue } from './interface'

interface UseCheckboxStateOptions {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function useCheckboxState({
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
}: UseCheckboxStateOptions) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const currentChecked = isControlled ? checked : uncontrolledChecked

  const toggle = useCallback(() => {
    if (disabled) return currentChecked

    const nextChecked = !currentChecked
    if (!isControlled) setUncontrolledChecked(nextChecked)
    onChange?.(nextChecked)
    return nextChecked
  }, [currentChecked, disabled, isControlled, onChange])

  return { checked: currentChecked, toggle }
}

interface UseCheckboxGroupOptions {
  value?: readonly CheckboxValue[]
  defaultValue?: readonly CheckboxValue[]
  disabled?: boolean
  onChange?: (value: CheckboxValue[]) => void
}

export function useCheckboxGroup({
  value,
  defaultValue,
  disabled = false,
  onChange,
}: UseCheckboxGroupOptions) {
  const [uncontrolledValue, setUncontrolledValue] = useState<CheckboxValue[]>(() => [
    ...(defaultValue ?? []),
  ])
  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : uncontrolledValue

  const toggle = useCallback(
    (name: CheckboxValue) => {
      if (disabled) return selectedValue.some((item) => Object.is(item, name))

      const isChecked = selectedValue.some((item) => Object.is(item, name))
      const nextValue = isChecked
        ? selectedValue.filter((item) => !Object.is(item, name))
        : [...selectedValue, name]

      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
      return !isChecked
    },
    [disabled, isControlled, onChange, selectedValue],
  )

  return useMemo(() => ({ disabled, selectedValue, toggle }), [disabled, selectedValue, toggle])
}
