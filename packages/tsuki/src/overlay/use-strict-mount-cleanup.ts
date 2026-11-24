import { useEffect, useLayoutEffect, useRef } from 'react'
import type { DependencyList } from 'react'

/**
 * Runs cleanup only on permanent unmount (or dependency replacement) while surviving React
 * StrictMode's synchronous cleanup/setup replay via a microtask lease.
 */
export function useStrictUnmountCleanup(
  onCleanup: () => void,
  deps: DependencyList,
  timing: 'effect' | 'layout' = 'layout',
) {
  const leaseRef = useRef(0)
  const cleanupRef = useRef(onCleanup)
  cleanupRef.current = onCleanup
  const useTimingEffect = timing === 'layout' ? useLayoutEffect : useEffect

  useTimingEffect(() => {
    leaseRef.current += 1

    return () => {
      const cleanupLease = ++leaseRef.current
      void Promise.resolve().then(() => {
        if (leaseRef.current === cleanupLease) {
          cleanupRef.current()
        }
      })
    }
  }, deps)
}
