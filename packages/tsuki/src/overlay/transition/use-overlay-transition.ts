import { useCallback, useEffect, useRef } from 'react'
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import type { OverlayEntry, OverlayRegistry } from '../types'
import type { OverlayTransitionChannel } from './transition-completion'
import { createTransitionCompletion } from './transition-completion'
import { getTransitionAnimation, resolveOverlayTransition } from './presets'
import { useMotionValue } from '../../motion/useMotionValue'

export function useOverlayTransition(entry: OverlayEntry, registry: OverlayRegistry) {
  const { mask, content } = resolveOverlayTransition(entry.transition)
  const contentRef = useRef(content)
  const maskRef = useRef(mask)
  contentRef.current = content
  maskRef.current = mask
  const hasMask = entry.mask !== undefined && entry.mask !== null && mask !== undefined
  const entryGeneration = entry.generation
  const initialProgress = entry.phase === 'entering' || entry.phase === 'hidden' ? 0 : 1
  const {
    value: maskValue,
    animateTo: animateMaskTo,
    cancel: cancelMask,
  } = useMotionValue(initialProgress)
  const {
    value: contentValue,
    animateTo: animateContentTo,
    cancel: cancelContent,
  } = useMotionValue(initialProgress)
  const transitionRun = useRef(0)
  const onProgressRef = useRef(entry.onTransitionProgress)
  const hasProgressListener = useSharedValue(typeof entry.onTransitionProgress === 'function')
  onProgressRef.current = entry.onTransitionProgress

  useEffect(() => {
    hasProgressListener.set(typeof entry.onTransitionProgress === 'function')
  }, [entry.onTransitionProgress, hasProgressListener])

  const reportProgress = useCallback(
    (channel: OverlayTransitionChannel, step: number, generation: number) => {
      onProgressRef.current?.(channel, step / 10, generation)
    },
    [],
  )

  useAnimatedReaction(
    () => Math.round(maskValue.get() * 10) * 2 + (hasProgressListener.get() ? 1 : 0),
    (encodedStep, previous) => {
      const step = Math.floor(encodedStep / 2)
      const previousStep =
        previous === null || previous === undefined ? undefined : Math.floor(previous / 2)
      const isListening = encodedStep - step * 2 === 1
      if (!isListening || step === previousStep || !hasMask) return
      scheduleOnRN(reportProgress, 'mask', step, entryGeneration)
    },
  )
  useAnimatedReaction(
    () => Math.round(contentValue.get() * 10) * 2 + (hasProgressListener.get() ? 1 : 0),
    (encodedStep, previous) => {
      const step = Math.floor(encodedStep / 2)
      const previousStep =
        previous === null || previous === undefined ? undefined : Math.floor(previous / 2)
      const isListening = encodedStep - step * 2 === 1
      if (!isListening || step === previousStep) return
      scheduleOnRN(reportProgress, 'content', step, entryGeneration)
    },
  )

  useEffect(() => {
    if (entry.phase === 'hidden' || entry.phase === 'entered') return

    const phase = entry.phase
    const generation = entry.generation
    const run = ++transitionRun.current
    const target = phase === 'entering' ? 1 : 0
    const channels: OverlayTransitionChannel[] = hasMask ? ['mask', 'content'] : ['content']
    const completion = createTransitionCompletion(channels, () => {
      if (transitionRun.current !== run) return
      if (phase === 'entering') registry.completeEnter(entry.id, generation)
      else registry.completeExit(entry.id, generation)
    })

    const resolvedContent = contentRef.current
    const resolvedMask = maskRef.current
    animateContentTo(target, getTransitionAnimation(resolvedContent), () =>
      completion.complete('content'),
    )
    if (hasMask && resolvedMask) {
      animateMaskTo(target, getTransitionAnimation(resolvedMask), () => completion.complete('mask'))
    }

    return () => {
      completion.cancel()
      transitionRun.current += 1
      cancelContent()
      cancelMask()
    }
  }, [
    animateContentTo,
    animateMaskTo,
    cancelContent,
    cancelMask,
    entry.generation,
    entry.id,
    entry.phase,
    hasMask,
    registry,
  ])

  return { maskProgress: maskValue, contentProgress: contentValue }
}
