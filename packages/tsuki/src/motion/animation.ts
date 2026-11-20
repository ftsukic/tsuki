import {
  GentleSpringConfig,
  GentleSpringConfigWithDuration,
  ReduceMotion,
  withDecay,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type {
  AnimationCallback,
  WithDecayConfig,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated'
import { DEFAULT_MOTION_EASING } from './easing'
import { DEFAULT_MOTION_DURATION } from './token'
import type {
  MotionAnimationOptions,
  MotionDecayOptions,
  MotionSpringOptions,
  MotionTimingOptions,
} from './types'

function normalizeNonNegative(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

export function scaleDuration(duration: number | undefined, durationScale: number): number {
  const validDuration = normalizeNonNegative(duration, DEFAULT_MOTION_DURATION)
  const validScale = normalizeNonNegative(durationScale, 1)
  const scaledDuration = validDuration * validScale

  return Number.isFinite(scaledDuration) ? scaledDuration : Number.MAX_SAFE_INTEGER
}

export function scaleSpringConfig(
  config: MotionSpringOptions | undefined,
  durationScale: number,
): WithSpringConfig {
  const validScale = normalizeNonNegative(durationScale, 1)
  const { delay: _delay, ...springOptions } = config ?? {}

  if ('duration' in springOptions || 'dampingRatio' in springOptions || 'clamp' in springOptions) {
    const durationOptions = springOptions as Omit<WithSpringConfig, 'reduceMotion'>
    const duration =
      'duration' in durationOptions && durationOptions.duration !== undefined
        ? durationOptions.duration
        : GentleSpringConfigWithDuration.duration

    return {
      ...durationOptions,
      duration: scaleDuration(duration, validScale),
      reduceMotion: ReduceMotion.Never,
    } as WithSpringConfig
  }

  const physicalOptions = springOptions as {
    damping?: number
    energyThreshold?: number
    mass?: number
    overshootClamping?: boolean
    stiffness?: number
    velocity?: number
  }
  const mass = physicalOptions.mass ?? GentleSpringConfig.mass
  const baseStiffness = physicalOptions.stiffness ?? GentleSpringConfig.stiffness
  const baseDamping = physicalOptions.damping ?? GentleSpringConfig.damping
  const stiffness = baseStiffness / validScale ** 2
  const damping = baseDamping / validScale

  return {
    mass,
    stiffness: Number.isFinite(stiffness) ? stiffness : Number.MAX_SAFE_INTEGER,
    damping: Number.isFinite(damping) ? damping : Number.MAX_SAFE_INTEGER,
    ...(physicalOptions.overshootClamping === undefined
      ? {}
      : { overshootClamping: physicalOptions.overshootClamping }),
    ...(physicalOptions.energyThreshold === undefined
      ? {}
      : { energyThreshold: physicalOptions.energyThreshold }),
    ...(physicalOptions.velocity === undefined ? {} : { velocity: physicalOptions.velocity }),
    reduceMotion: ReduceMotion.Never,
  }
}

export function scaleDelay(delay: number | undefined, durationScale: number): number {
  return scaleDuration(delay ?? 0, durationScale)
}

function withScaledDelay<T extends number>(animation: T, delay: number, durationScale: number): T {
  const scaledDelay = scaleDelay(delay, durationScale)
  return scaledDelay > 0 ? withDelay(scaledDelay, animation, ReduceMotion.Never) : animation
}

export function isImmediateAnimation(
  options: MotionAnimationOptions | undefined,
  durationScale: number,
): boolean {
  if (durationScale <= 0) return true

  if (options && options.type === 'spring') {
    return 'duration' in options && options.duration === 0
  }

  if (options && 'duration' in options) return options.duration === 0
  return false
}

export function createMotionAnimation(
  target: number,
  options: MotionAnimationOptions | undefined,
  durationScale: number,
  callback: AnimationCallback,
): number {
  if (options?.type === 'spring') {
    const { type: _type, delay = 0, ...config } = options
    const animation = withSpring(target, scaleSpringConfig(config, durationScale), callback)

    return withScaledDelay(animation, delay, durationScale)
  }

  const timingOptions = options as (MotionTimingOptions & { type?: 'timing' }) | undefined
  const { type: _type, delay = 0, ...config } = timingOptions ?? {}
  const timingConfig: WithTimingConfig = {
    ...config,
    duration: scaleDuration(config.duration, durationScale),
    easing: config.easing ?? DEFAULT_MOTION_EASING,
    reduceMotion: ReduceMotion.Never,
  }
  const animation = withTiming(target, timingConfig, callback)

  return withScaledDelay(animation, delay, durationScale)
}

export function createMotionDecay(
  options: MotionDecayOptions | undefined,
  durationScale: number,
  callback: AnimationCallback,
): number {
  const { delay = 0, ...config } = options ?? {}
  const decayConfig = {
    ...config,
    reduceMotion: ReduceMotion.Never,
  } as WithDecayConfig
  const animation = withDecay(decayConfig, callback)

  return withScaledDelay(animation, delay, durationScale)
}

export function createMotionSpringOnUI(
  target: number,
  config: WithSpringConfig,
  shouldAnimate: boolean,
  callback?: AnimationCallback,
): number {
  'worklet'

  if (!shouldAnimate) {
    callback?.(true)
    return target
  }

  return withSpring(target, { ...config, reduceMotion: ReduceMotion.Never }, callback)
}

export function createMotionDecayOnUI(
  config: WithDecayConfig,
  shouldAnimate: boolean,
  callback?: AnimationCallback,
): number {
  'worklet'

  if (!shouldAnimate) {
    callback?.(true)
    return 0
  }

  return withDecay({ ...config, reduceMotion: ReduceMotion.Never }, callback)
}
