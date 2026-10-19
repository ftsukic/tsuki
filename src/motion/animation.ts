import { MOTION_DURATION } from './token'
import { easeInOut } from './easing'
import type { MotionAnimationConfig } from './types'
import { MOTION_SPRING } from './token'
import { withSpring, withTiming } from 'react-native-reanimated'

export function normalizeDuration(duration: number | undefined) {
  'worklet'
  return Number.isFinite(duration) ? Math.max(0, duration as number) : MOTION_DURATION.normal
}

function positive(value: number | undefined, fallback: number) {
  'worklet'
  return Number.isFinite(value) && (value as number) > 0 ? (value as number) : fallback
}

export function getSpringConfig(config: MotionAnimationConfig, durationScale = 1) {
  'worklet'
  const scale = positive(durationScale, 1)
  return {
    damping: positive(config.damping, MOTION_SPRING.normal.damping) / scale,
    stiffness: positive(config.stiffness, MOTION_SPRING.normal.stiffness) / (scale * scale),
    mass: positive(config.mass, MOTION_SPRING.normal.mass),
    ...(config.reduceMotion === undefined ? {} : { reduceMotion: config.reduceMotion }),
  }
}

export function animateValue(
  target: number,
  config: MotionAnimationConfig,
  onFinished?: (finished?: boolean) => void,
  durationScale = 1,
  velocity?: number,
) {
  'worklet'
  return config.mode === 'spring'
    ? withSpring(
        target,
        {
          ...getSpringConfig(config, durationScale),
          ...(velocity === undefined ? {} : { velocity }),
        },
        onFinished,
      )
    : withTiming(
        target,
        {
          duration: normalizeDuration(config.duration),
          easing: config.easing ?? easeInOut,
          reduceMotion: config.reduceMotion,
        },
        onFinished,
      )
}

/** Samples a spring trajectory for deterministic calculations and assertions. */
export function sampleSpring(
  elapsed: number,
  start: number,
  target: number,
  config: MotionAnimationConfig,
) {
  const { damping, stiffness, mass } = getSpringConfig(config)
  const time = Math.max(0, elapsed) / 1000
  const displacement = start - target
  const frequency = Math.sqrt(stiffness / mass)
  const ratio = damping / (2 * Math.sqrt(stiffness * mass))
  let offset: number
  let velocity: number

  if (ratio < 1) {
    const dampedFrequency = frequency * Math.sqrt(1 - ratio * ratio)
    const envelope = Math.exp(-ratio * frequency * time)
    const sine = Math.sin(dampedFrequency * time)
    const cosine = Math.cos(dampedFrequency * time)
    const coefficient = (ratio * frequency * displacement) / dampedFrequency
    const wave = displacement * cosine + coefficient * sine
    offset = envelope * wave
    velocity =
      envelope *
      (-ratio * frequency * wave + dampedFrequency * (-displacement * sine + coefficient * cosine))
  } else {
    // Reanimated uses its critical damping branch for every ratio >= 1.
    const envelope = Math.exp(-frequency * time)
    offset = displacement * (1 + frequency * time) * envelope
    velocity = -displacement * frequency * frequency * time * envelope
  }

  const energy = mass * velocity * velocity + stiffness * offset * offset
  const initialEnergy = stiffness * displacement * displacement
  const finished = energy <= initialEnergy * 6e-9 || elapsed >= 10000
  return { value: finished ? target : target + offset, finished }
}
