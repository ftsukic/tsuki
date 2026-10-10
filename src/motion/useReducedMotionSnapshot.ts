// Web/SSR fallback; Metro selects the native implementation on devices.
export function useReducedMotionSnapshot() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
