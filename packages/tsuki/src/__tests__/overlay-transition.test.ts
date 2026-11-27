import { createTransitionCompletion } from '../overlay/transition/transition-completion'
import { act, cleanup, render, renderHook } from '@testing-library/react-native'
import { createElement, useLayoutEffect, type PropsWithChildren } from 'react'
import * as Reanimated from 'react-native-reanimated'
import * as Worklets from 'react-native-worklets'
import { getDefaultTheme } from '../theme/defaults'
import { TsukiProvider } from '../theme/tsuki-provider'
import { createOverlayRegistry } from '../overlay/registry'
import type { OverlayEntry, OverlayRegistry } from '../overlay/types'
import { OverlayEntryTransition } from '../overlay/transition/overlay-transition'
import { useOverlayTransitionContext } from '../overlay/transition/transition-context'
import { useOverlayTransition } from '../overlay/transition/use-overlay-transition'
import { MOTION_EASING } from '../motion/easing'
import type { OverlayTransitionConfig } from '../overlay/transition/types'

type AnimationCallback = (finished?: boolean) => void
type ProgressReaction = {
  prepare: () => number
  react: (step: number, previous: number | null | undefined) => void
}

const timingMock = Reanimated.withTiming as jest.Mock
const springMock = Reanimated.withSpring as jest.Mock
const progressReactions: ProgressReaction[] = []
let scheduleOnRNMock: jest.SpyInstance

function createMotionWrapper({ children }: PropsWithChildren) {
  return createElement(
    TsukiProvider,
    {
      scheme: 'light',
      theme: { motion: { enabled: true, reducedMotion: 'never', durationScale: 1 } },
    },
    children,
  )
}

function createEntry(
  registry: OverlayRegistry,
  options: { withMask?: boolean; transition?: OverlayTransitionConfig } = {},
) {
  const transition =
    options.transition ??
    ({
      mask: { preset: 'fade', animation: { duration: 260 } },
      content: { preset: 'spring-scale' },
    } satisfies OverlayTransitionConfig)
  const id = registry.mount({
    content: 'content',
    mask: options.withMask === false ? undefined : 'mask',
    transition,
    backBehavior: 'consume',
    theme: getDefaultTheme('light'),
    themeScope: {},
  })
  return { id, entry: registry.getSnapshot()[0] }
}

function getAnimationCallback(mock: jest.Mock, index = 0) {
  return mock.mock.calls[index][2] as AnimationCallback
}

function getLatestProgressReactions() {
  return progressReactions.slice(-2)
}

beforeEach(() => {
  progressReactions.length = 0
  jest.spyOn(Reanimated, 'useAnimatedReaction').mockImplementation((prepare, react) => {
    progressReactions.push({
      prepare: prepare as () => number,
      react: react as ProgressReaction['react'],
    })
  })
  timingMock.mockReset()
  timingMock.mockImplementation(
    (target: number, _config: unknown, _callback?: AnimationCallback) => target,
  )
  springMock.mockReset()
  springMock.mockImplementation(
    (target: number, _config: unknown, _callback?: AnimationCallback) => target,
  )
  scheduleOnRNMock = jest.spyOn(Worklets, 'scheduleOnRN')
  scheduleOnRNMock.mockClear()
})

afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
})

describe('Overlay transition completion', () => {
  it('waits for every active channel and completes once', () => {
    const onComplete = jest.fn()
    const completion = createTransitionCompletion(['mask', 'content'], onComplete)

    completion.complete('content')
    completion.complete('content')
    expect(onComplete).not.toHaveBeenCalled()
    completion.complete('mask')
    completion.complete('mask')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('waits only for Content when there is no Mask channel', () => {
    const onComplete = jest.fn()
    const completion = createTransitionCompletion(['content'], onComplete)

    completion.complete('content')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('ignores completions after a transition is canceled', () => {
    const onComplete = jest.fn()
    const completion = createTransitionCompletion(['mask', 'content'], onComplete)

    completion.complete('content')
    completion.cancel()
    completion.complete('mask')
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('Overlay transition lifecycle', () => {
  it('waits for Timing Mask and Spring Content on Enter and completes once', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry)
    const completeEnter = jest.spyOn(registry, 'completeEnter')
    const utils = await renderHook(() => useOverlayTransition(entry, registry), {
      wrapper: createMotionWrapper,
    })

    expect(timingMock).toHaveBeenCalledTimes(1)
    expect(timingMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 260 }),
      expect.any(Function),
    )
    expect(springMock).toHaveBeenCalledTimes(1)
    expect(springMock).toHaveBeenCalledWith(1, expect.any(Object), expect.any(Function))

    await act(async () => getAnimationCallback(timingMock)(true))
    expect(registry.getSnapshot()[0].phase).toBe('entering')
    expect(completeEnter).not.toHaveBeenCalled()

    const contentCallback = getAnimationCallback(springMock)
    await act(async () => contentCallback(true))
    expect(registry.getSnapshot()[0].phase).toBe('entered')
    expect(completeEnter).toHaveBeenCalledTimes(1)
    expect(completeEnter).toHaveBeenCalledWith(id, entry.generation)

    await act(async () => {
      getAnimationCallback(timingMock)(true)
      contentCallback(true)
    })
    expect(completeEnter).toHaveBeenCalledTimes(1)
    await utils.unmount()
  })

  it('keeps an exiting entry mounted until Timing Mask and Spring Content both finish', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry)
    registry.completeEnter(id, entry.generation)
    registry.update(id, { visible: false })
    const exiting = registry.getSnapshot()[0]
    const completeExit = jest.spyOn(registry, 'completeExit')

    const utils = await renderHook(() => useOverlayTransition(exiting, registry), {
      wrapper: createMotionWrapper,
    })

    expect(timingMock).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ duration: 260 }),
      expect.any(Function),
    )
    expect(springMock).toHaveBeenCalledWith(0, expect.any(Object), expect.any(Function))

    await act(async () => getAnimationCallback(springMock)(true))
    expect(registry.getSnapshot()).toHaveLength(1)
    expect(registry.getSnapshot()[0].phase).toBe('exiting')
    expect(completeExit).not.toHaveBeenCalled()

    await act(async () => getAnimationCallback(timingMock)(true))
    expect(registry.getSnapshot()).toEqual([])
    expect(completeExit).toHaveBeenCalledTimes(1)
    await utils.unmount()
  })

  it('keeps the same SharedValues and rejects stale callbacks when Enter and Exit reverse', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry)
    const completeEnter = jest.spyOn(registry, 'completeEnter')
    const completeExit = jest.spyOn(registry, 'completeExit')
    const utils = await renderHook(
      ({ currentEntry }: { currentEntry: OverlayEntry }) =>
        useOverlayTransition(currentEntry, registry),
      { initialProps: { currentEntry: entry }, wrapper: createMotionWrapper },
    )
    const maskValue = utils.result.current.maskProgress
    const contentValue = utils.result.current.contentProgress
    const oldEnterMask = getAnimationCallback(timingMock)
    const oldEnterContent = getAnimationCallback(springMock)

    await act(async () => {
      maskValue.set(0.4)
      contentValue.set(0.55)
    })
    registry.update(id, { visible: false })
    const exiting = registry.getSnapshot()[0]
    await utils.rerender({ currentEntry: exiting })

    expect(exiting).toMatchObject({ id, phase: 'exiting', generation: 2 })
    expect(utils.result.current.maskProgress).toBe(maskValue)
    expect(utils.result.current.contentProgress).toBe(contentValue)
    expect(timingMock.mock.calls.at(-1)?.[0]).toBe(0)
    expect(springMock.mock.calls.at(-1)?.[0]).toBe(0)
    const oldExitMask = getAnimationCallback(timingMock, timingMock.mock.calls.length - 1)
    const oldExitContent = getAnimationCallback(springMock, springMock.mock.calls.length - 1)

    await act(async () => {
      oldEnterMask(true)
      oldEnterContent(true)
    })
    expect(registry.getSnapshot()[0].phase).toBe('exiting')
    expect(completeEnter).not.toHaveBeenCalled()

    await act(async () => {
      maskValue.set(0.6)
      contentValue.set(0.65)
    })
    registry.update(id, { visible: true })
    const reopened = registry.getSnapshot()[0]
    await utils.rerender({ currentEntry: reopened })

    expect(reopened).toMatchObject({ id, phase: 'entering', generation: 3 })
    expect(utils.result.current.maskProgress).toBe(maskValue)
    expect(utils.result.current.contentProgress).toBe(contentValue)
    expect(timingMock.mock.calls.at(-1)?.[0]).toBe(1)
    expect(springMock.mock.calls.at(-1)?.[0]).toBe(1)

    await act(async () => {
      oldExitMask(true)
      oldExitContent(true)
    })
    expect(registry.getSnapshot()[0].phase).toBe('entering')
    expect(completeExit).not.toHaveBeenCalled()

    await act(async () => {
      getAnimationCallback(timingMock, timingMock.mock.calls.length - 1)(true)
      getAnimationCallback(springMock, springMock.mock.calls.length - 1)(true)
    })
    expect(registry.getSnapshot()[0].phase).toBe('entered')
    expect(completeEnter).toHaveBeenCalledTimes(1)
    expect(completeExit).not.toHaveBeenCalled()
    await utils.unmount()
  })

  it('does not complete a transition when either active channel reports cancellation', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry)
    const completeEnter = jest.spyOn(registry, 'completeEnter')
    const utils = await renderHook(() => useOverlayTransition(entry, registry), {
      wrapper: createMotionWrapper,
    })

    await act(async () => {
      getAnimationCallback(timingMock)(false)
      getAnimationCallback(springMock)(true)
    })
    expect(registry.getSnapshot()[0]).toMatchObject({ id, phase: 'entering' })
    expect(completeEnter).not.toHaveBeenCalled()
    await utils.unmount()
  })

  it('uses Content alone when Mask is absent', async () => {
    const registry = createOverlayRegistry()
    const { entry } = createEntry(registry, { withMask: false })
    const completeEnter = jest.spyOn(registry, 'completeEnter')
    const utils = await renderHook(() => useOverlayTransition(entry, registry), {
      wrapper: createMotionWrapper,
    })

    expect(timingMock).not.toHaveBeenCalled()
    expect(springMock).toHaveBeenCalledTimes(1)
    await act(async () => getAnimationCallback(springMock)(true))
    expect(registry.getSnapshot()[0].phase).toBe('entered')
    expect(completeEnter).toHaveBeenCalledTimes(1)
    await utils.unmount()
  })

  it('uses distinct enter and exit durations and Arco easings when configured', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry, {
      transition: {
        mask: {
          preset: 'fade',
          enter: { duration: 180, easing: MOTION_EASING.decelerate },
          exit: { duration: 140, easing: MOTION_EASING.accelerate },
        },
        content: {
          preset: 'dialog-zoom',
          enter: { duration: 200, easing: MOTION_EASING.standard },
          exit: { duration: 150, easing: MOTION_EASING.accelerate },
        },
      },
    })
    const utils = await renderHook(
      ({ currentEntry }: { currentEntry: OverlayEntry }) =>
        useOverlayTransition(currentEntry, registry),
      { initialProps: { currentEntry: entry }, wrapper: createMotionWrapper },
    )

    expect(timingMock).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ duration: 200, easing: MOTION_EASING.standard }),
      expect.any(Function),
    )
    expect(timingMock).toHaveBeenNthCalledWith(
      2,
      1,
      expect.objectContaining({ duration: 180, easing: MOTION_EASING.decelerate }),
      expect.any(Function),
    )

    registry.completeEnter(id, entry.generation)
    registry.update(id, { visible: false })
    timingMock.mockClear()
    await utils.rerender({ currentEntry: registry.getSnapshot()[0] })

    expect(timingMock).toHaveBeenNthCalledWith(
      1,
      0,
      expect.objectContaining({ duration: 150, easing: MOTION_EASING.accelerate }),
      expect.any(Function),
    )
    expect(timingMock).toHaveBeenNthCalledWith(
      2,
      0,
      expect.objectContaining({ duration: 140, easing: MOTION_EASING.accelerate }),
      expect.any(Function),
    )
    await utils.unmount()
  })

  it('defers entering animation while ready is false until initial measurement completes', async () => {
    const registry = createOverlayRegistry()
    const id = registry.mount({
      content: 'floating-content',
      ready: false,
      transition: { content: { preset: 'scale-fade', enter: { duration: 160 } } },
      backBehavior: 'dismiss',
      onBack: jest.fn(),
      theme: getDefaultTheme('light'),
      themeScope: {},
    })
    const utils = await renderHook(
      ({ currentEntry }: { currentEntry: OverlayEntry }) =>
        useOverlayTransition(currentEntry, registry),
      { initialProps: { currentEntry: registry.getSnapshot()[0] }, wrapper: createMotionWrapper },
    )

    expect(timingMock).not.toHaveBeenCalled()
    expect(utils.result.current.contentProgress.get()).toBe(0)

    registry.update(id, { ready: true })
    await utils.rerender({ currentEntry: registry.getSnapshot()[0] })

    expect(timingMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 160 }),
      expect.any(Function),
    )
    await utils.unmount()
  })
})

describe('Overlay transition progress listeners', () => {
  it('schedules no callbacks without a listener and follows dynamic listener changes', async () => {
    const registry = createOverlayRegistry()
    const { id, entry } = createEntry(registry)
    registry.completeEnter(id, entry.generation)
    const onProgress = jest.fn()
    const utils = await renderHook(
      ({ currentEntry }: { currentEntry: OverlayEntry }) =>
        useOverlayTransition(currentEntry, registry),
      { initialProps: { currentEntry: registry.getSnapshot()[0] }, wrapper: createMotionWrapper },
    )
    const generation = entry.generation
    let [maskReaction, contentReaction] = getLatestProgressReactions()
    let maskPrevious: number | null | undefined = null
    let contentPrevious: number | null | undefined = null

    maskPrevious = maskReaction.prepare()
    maskReaction.react(maskPrevious, null)
    contentPrevious = contentReaction.prepare()
    contentReaction.react(contentPrevious, null)
    await act(async () => {
      utils.result.current.maskProgress.set(0.11)
      utils.result.current.contentProgress.set(0.11)
    })
    let maskNext = maskReaction.prepare()
    let contentNext = contentReaction.prepare()
    maskReaction.react(maskNext, maskPrevious)
    contentReaction.react(contentNext, contentPrevious)
    expect(scheduleOnRNMock).not.toHaveBeenCalled()

    registry.update(id, { onTransitionProgress: onProgress })
    await utils.rerender({ currentEntry: registry.getSnapshot()[0] })
    ;[maskReaction, contentReaction] = getLatestProgressReactions()
    maskPrevious = maskReaction.prepare()
    contentPrevious = contentReaction.prepare()
    await act(async () => {
      utils.result.current.maskProgress.set(0.21)
      utils.result.current.contentProgress.set(0.21)
    })
    maskNext = maskReaction.prepare()
    contentNext = contentReaction.prepare()
    await act(async () => {
      maskReaction.react(maskNext, maskPrevious)
      contentReaction.react(contentNext, contentPrevious)
      await Promise.resolve()
    })
    expect(onProgress).toHaveBeenCalledWith('mask', 0.2, generation)
    expect(onProgress).toHaveBeenCalledWith('content', 0.2, generation)
    expect(scheduleOnRNMock).toHaveBeenCalledTimes(2)

    registry.update(id, { onTransitionProgress: undefined })
    await utils.rerender({ currentEntry: registry.getSnapshot()[0] })
    ;[maskReaction, contentReaction] = getLatestProgressReactions()
    maskPrevious = maskReaction.prepare()
    contentPrevious = contentReaction.prepare()
    await act(async () => {
      utils.result.current.maskProgress.set(0.31)
      utils.result.current.contentProgress.set(0.31)
    })
    maskNext = maskReaction.prepare()
    contentNext = contentReaction.prepare()
    maskReaction.react(maskNext, maskPrevious)
    contentReaction.react(contentNext, contentPrevious)
    expect(scheduleOnRNMock).toHaveBeenCalledTimes(2)
    expect(onProgress).toHaveBeenCalledTimes(2)
    await utils.unmount()
  })
})

describe('OverlayEntryTransition local content target handoff', () => {
  it('resets outer content animated style to identity opacity and transform when claimed locally', async () => {
    const updaters: Array<() => Record<string, unknown>> = []
    jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation(((updater: () => unknown) => {
      updaters.push(updater as () => Record<string, unknown>)
      return updater()
    }) as typeof Reanimated.useAnimatedStyle)

    function LocalTargetConsumer() {
      const ctx = useOverlayTransitionContext()
      const setLocalContentTarget = ctx?.setLocalContentTarget
      useLayoutEffect(() => {
        if (!setLocalContentTarget) return
        setLocalContentTarget(true)
        return () => setLocalContentTarget(false)
      }, [setLocalContentTarget])
      return null
    }

    const registry = createOverlayRegistry()
    registry.mount({
      content: createElement(LocalTargetConsumer),
      ready: false,
      transition: { content: { preset: 'scale-fade', enter: { duration: 160 } } },
      backBehavior: 'dismiss',
      onBack: jest.fn(),
      theme: getDefaultTheme('light'),
      themeScope: {},
    })
    const entry = registry.getSnapshot()[0]

    await render(
      createElement(
        createMotionWrapper,
        null,
        createElement(OverlayEntryTransition, { entry, registry }),
      ),
    )

    const contentUpdater = updaters.at(-1)
    expect(contentUpdater).toBeDefined()
    expect(contentUpdater?.()).toEqual({ opacity: 1, transform: [] })
  })
})
