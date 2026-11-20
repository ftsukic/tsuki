import type { MotionConfig, ResolvedMotionConfig } from '../theme/types'

export function mergeMotionConfig(
  base: ResolvedMotionConfig,
  override?: MotionConfig,
): ResolvedMotionConfig {
  const durationScale = override?.durationScale

  return {
    enabled: typeof override?.enabled === 'boolean' ? override.enabled : base.enabled,
    reducedMotion:
      override?.reducedMotion === 'system' ||
      override?.reducedMotion === 'always' ||
      override?.reducedMotion === 'never'
        ? override.reducedMotion
        : base.reducedMotion,
    durationScale:
      typeof durationScale === 'number' && Number.isFinite(durationScale) && durationScale >= 0
        ? durationScale
        : base.durationScale,
  }
}
