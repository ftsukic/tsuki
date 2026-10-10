import { useContext } from 'react'
import { ThemeContext } from '../theme/context'
import { useReducedMotion } from './useReducedMotion'
import { normalizeDuration } from './animation'
import type { MotionConfig } from './types'

export function resolveMotionConfig(
  parent: MotionConfig | undefined,
  config: MotionConfig | undefined,
) {
  return {
    enabled: config?.enabled ?? parent?.enabled ?? true,
    reducedMotion: config?.reducedMotion ?? parent?.reducedMotion ?? 'system',
    durationScale: config?.durationScale ?? parent?.durationScale ?? 1,
  } satisfies Required<MotionConfig>
}

/** One policy for transitions, state, layout, feedback, and gesture settling. */
export function useMotionConfig(motion = true, reducedMotion?: MotionConfig['reducedMotion']) {
  const theme = useContext(ThemeContext)
  const systemReduced = useReducedMotion()
  const config = resolveMotionConfig(undefined, theme?.motion)
  const reduction = reducedMotion ?? config.reducedMotion
  const reduced = reduction === 'always' || (reduction === 'system' && systemReduced)
  const scale = Number.isFinite(config.durationScale) ? Math.max(0, config.durationScale) : 1
  const enabled = motion && config.enabled && theme?.token.motion !== false && !reduced && scale > 0
  return {
    enabled,
    reduced,
    durationScale: scale,
    duration: (value?: number) =>
      enabled ? normalizeDuration(value ?? theme?.token.motionDurationMid) * scale : 0,
  }
}
