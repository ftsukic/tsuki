import type { MotionPreset } from '../../motion/types'
import type { ViewStyle } from 'react-native'

function mix(from: number | undefined, to: number | undefined, fallback: number, progress: number) {
  'worklet'
  const start = from ?? fallback
  const end = to ?? fallback
  return start + (end - start) * progress
}

export function createTransitionStyle(
  progress: number,
  preset: MotionPreset,
  width: number,
  height: number,
  stage: 'enter' | 'exit',
) {
  'worklet'

  const { from, to } = stage === 'enter' ? preset.enter : preset.exit
  const stageProgress = stage === 'enter' ? progress : 1 - progress
  const style: ViewStyle = {}
  if (from.opacity !== undefined || to.opacity !== undefined) {
    style.opacity = mix(from.opacity, to.opacity, 1, stageProgress)
  }

  const transform: ViewStyle['transform'] = [
    ...(from.translateX !== undefined || to.translateX !== undefined
      ? [{ translateX: mix(from.translateX, to.translateX, 0, stageProgress) * width }]
      : []),
    ...(from.translateY !== undefined || to.translateY !== undefined
      ? [{ translateY: mix(from.translateY, to.translateY, 0, stageProgress) * height }]
      : []),
    ...(from.scale !== undefined || to.scale !== undefined
      ? [{ scale: mix(from.scale, to.scale, 1, stageProgress) }]
      : []),
  ]
  if (transform.length) style.transform = transform
  return style
}
