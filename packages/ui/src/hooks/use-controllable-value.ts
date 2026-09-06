/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePersistFn } from './use-persist-fn'
import { useState } from 'react'

export interface ControllableValueOptions<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string
}

export function useControllableValue<T = unknown>(
  props: Record<string, any> = {},
  options: ControllableValueOptions<T> = {},
): [T | undefined, (value: T, ...args: any[]) => void] {
  const {
    defaultValue,
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options
  const isControlled = valuePropName in props
  const [localValue, setLocalValue] = useState<T | undefined>(() => {
    if (isControlled) return props[valuePropName]
    if (defaultValuePropName in props) return props[defaultValuePropName]
    return defaultValue
  })

  const setValue = usePersistFn((value: T, ...args: any[]) => {
    if (!isControlled) setLocalValue(value)
    props[trigger]?.(value, ...args)
  })

  return [isControlled ? props[valuePropName] : localValue, setValue]
}
