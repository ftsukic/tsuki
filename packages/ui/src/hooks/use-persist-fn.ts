/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react'

type AnyFunction = (...args: any[]) => any

export function usePersistFn<T extends AnyFunction>(fn: T) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  const persistFn = useRef<T | null>(null)
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args: Parameters<T>) {
      return fnRef.current.apply(this, args)
    } as T
  }

  return persistFn.current
}
