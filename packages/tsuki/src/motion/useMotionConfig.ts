import { useTsukiTheme } from '../theme/theme'
import { useReducedMotion } from './useReducedMotion'

export function useMotionConfig() {
  const { motion } = useTsukiTheme()
  const tracksSystem = motion.enabled && motion.reducedMotion === 'system'
  const systemReducedMotion = useReducedMotion(tracksSystem)
  const shouldReduceMotion =
    motion.reducedMotion === 'always' || (tracksSystem && systemReducedMotion)

  return {
    ...motion,
    shouldReduceMotion,
    shouldAnimate: motion.enabled && motion.durationScale > 0 && !shouldReduceMotion,
  }
}
