/* eslint-disable @typescript-eslint/no-explicit-any */
import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef } from 'react'

export interface DebounceOptions {
  wait?: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  options: DebounceOptions = {},
) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const debounced = useMemo(
    () =>
      debounce((...args: Parameters<T>) => fnRef.current(...args), options.wait ?? 1000, options),
    [options.leading, options.maxWait, options.trailing, options.wait],
  )
  useEffect(() => () => debounced.cancel(), [debounced])
  return { run: debounced, cancel: debounced.cancel, flush: debounced.flush }
}
