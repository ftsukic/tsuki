import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { runOnUI, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { ImagePreviewSourcesContext } from './context'
import { useMotionValue } from '../motion/useMotionValue'
import { LAYOUT_PRESET } from '../motion/presets'
import { interpolateRect, getSourceRectInViewport } from './utils'
import type { ImagePreviewSourceRect } from './context'
import type { ImagePreviewProps, ImagePreviewRect } from './types'
import type { useImagePreviewInteraction } from './useImagePreviewInteraction'

type Phase = 'closed' | 'opening' | 'open' | 'closing'
interface Options {
  props: ImagePreviewProps
  id: string | undefined
  viewport: ImagePreviewRect
  layoutReady: boolean
  displayReady: boolean
  duration: number
  pageWidth: number
  interaction: ReturnType<typeof useImagePreviewInteraction>
  onBegin: (reopening: boolean) => void
}
/** Only this hook owns transition completion, source ownership and session invalidation. */
export function useImagePreviewSession({
  props,
  id,
  viewport,
  layoutReady,
  displayReady,
  duration,
  pageWidth,
  interaction,
  onBegin,
}: Options) {
  const { visible = false, items } = props
  const sources = useContext(ImagePreviewSourcesContext)
  const owner = useRef(Symbol('preview')).current
  const [phase, setPhase] = useState<Phase>('closed')
  const phaseRef = useRef<Phase>('closed')
  const [prepared, setPrepared] = useState(false)
  const [exitComplete, setExitComplete] = useState(false)
  const [loadingExpired, setLoadingExpired] = useState(false)
  const [session, setSession] = useState(0)
  const generation = useRef(0)
  const sessionRevision = useSharedValue(0)
  const snapshot = useRef({ props, id, viewport, interaction, onBegin, sources })
  snapshot.current = { props, id, viewport, interaction, onBegin, sources }
  const fullClip = useMemo(
    () => ({ x: 0, y: 0, width: viewport.width, height: viewport.height }),
    [viewport.width, viewport.height],
  )
  const fromClip = useSharedValue(fullClip)
  const targetClip = useSharedValue(fullClip)
  const from = useSharedValue(interaction.rect.value)
  const target = useSharedValue(interaction.rect.value)
  const anchored = useSharedValue(false)
  const frozen = useSharedValue(false)
  const paging = useSharedValue(false)
  const closeAlpha = useSharedValue(1)
  const shade = useSharedValue(1)
  const finish = useCallback((value: number) => {
    if (value === 1 && phaseRef.current === 'opening' && snapshot.current.props.visible) {
      phaseRef.current = 'open'
      setPhase('open')
      snapshot.current.props.onOpened?.()
    } else if (value === 0 && phaseRef.current === 'closing' && !snapshot.current.props.visible) {
      setExitComplete(true)
    }
  }, [])
  const ready =
    prepared &&
    layoutReady &&
    (phase === 'closing' || duration === 0 || displayReady || loadingExpired)
  const progress = useMotionValue(
    phase === 'closing' ? 0 : 1,
    { ...LAYOUT_PRESET, duration },
    0,
    true,
    0,
    finish,
    ready && (phase === 'opening' || phase === 'closing'),
  )
  const { rect: interactionRect, dragY } = interaction
  const rect = useDerivedValue(
    () =>
      frozen.value
        ? interpolateRect(target.value, from.value, progress.value)
        : phase === 'opening'
          ? interpolateRect(from.value, interactionRect.value, progress.value)
          : interactionRect.value,
    [phase, interactionRect],
  )
  const clip = useDerivedValue(
    () =>
      frozen.value
        ? interpolateRect(targetClip.value, fromClip.value, progress.value)
        : phase === 'opening'
          ? interpolateRect(fromClip.value, fullClip, progress.value)
          : fullClip,
    [phase, fullClip.width, fullClip.height],
  )
  const opacity = useDerivedValue(
    () =>
      phase === 'closed' || (phase === 'opening' && !ready)
        ? 0
        : frozen.value
          ? closeAlpha.value * (anchored.value ? 1 : progress.value)
          : phase === 'opening' && !anchored.value
            ? progress.value
            : 1,
    [phase, ready],
  )
  const mask = useDerivedValue(
    () =>
      phase === 'closed' || (phase === 'opening' && !ready)
        ? 0
        : frozen.value
          ? progress.value * shade.value
          : progress.value * Math.max(0.25, 1 - dragY.value / viewport.height),
    [phase, ready, viewport.height, dragY],
  )
  // Gate the entire pager, including pre-rendered neighbours, before source/layout preparation.
  const presentation = useDerivedValue(
    () => (phase === 'closed' || (phase === 'opening' && !ready) ? 0 : 1),
    [phase, ready],
  )
  const measure = useCallback(async (mediaId: string | undefined) => {
    if (!mediaId) return null
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const value = await Promise.race([
        Promise.resolve().then(() =>
          snapshot.current.props.getSourceRect
            ? snapshot.current.props.getSourceRect(mediaId)
            : (snapshot.current.sources?.measure(mediaId) ?? null),
        ),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), 160)
        }),
      ])
      const host = snapshot.current.viewport
      const local = getSourceRectInViewport(value, host)
      if (!local) return null
      const bounds = (value as ImagePreviewSourceRect).clip
      if (!bounds) return local as ImagePreviewSourceRect
      const x = Math.max(0, bounds.x - host.x)
      const y = Math.max(0, bounds.y - host.y)
      const right = Math.min(host.width, bounds.x - host.x + bounds.width)
      const bottom = Math.min(host.height, bounds.y - host.y + bounds.height)
      if (
        right <= x ||
        bottom <= y ||
        local.x >= right ||
        local.y >= bottom ||
        local.x + local.width <= x ||
        local.y + local.height <= y
      )
        return null
      return {
        ...local,
        clip: { x, y, width: right - x, height: bottom - y },
      } as ImagePreviewSourceRect
    } catch {
      return null
    } finally {
      if (timer) clearTimeout(timer)
    }
  }, [])
  useEffect(() => {
    const current = snapshot.current
    if (visible && items.length && phaseRef.current !== 'opening' && phaseRef.current !== 'open') {
      generation.current += 1
      sessionRevision.value = generation.current
      const reopening = phaseRef.current === 'closing'
      const currentRect = rect.value
      current.onBegin(reopening)
      current.interaction.reset()
      fromClip.value = reopening ? clip.value : fullClip
      targetClip.value = fullClip
      frozen.value = false
      paging.value = false
      anchored.value = reopening
      from.value = reopening ? currentRect : current.interaction.rect.value
      progress.value = 0
      setPrepared(reopening)
      setExitComplete(false)
      setLoadingExpired(false)
      if (!reopening) setSession((v) => v + 1)
      phaseRef.current = 'opening'
      setPhase('opening')
      current.props.onOpen?.()
    } else if (!visible && phaseRef.current !== 'closed' && phaseRef.current !== 'closing') {
      const revision = ++generation.current
      sessionRevision.value = revision
      phaseRef.current = 'closing'
      current.props.onClose?.()
      const commit = () => {
        if (revision === generation.current) {
          setPhase('closing')
          setPrepared(false)
        }
      }
      const stop = current.interaction.stop
      const currentPageWidth = pageWidth
      const position = current.interaction.position
      const index = current.interaction.index
      const captured = new Promise<boolean>((resolve) => {
        const committed = (moving: boolean) => {
          commit()
          resolve(moving)
        }
        runOnUI(() => {
          'worklet'
          if (sessionRevision.value !== revision) {
            scheduleOnRN(committed, false)
            return
          }
          stop()
          paging.value = Math.abs(position.value - index.value * currentPageWidth) > 1
          fromClip.value = clip.value
          targetClip.value = clip.value
          from.value = rect.value
          target.value = rect.value
          closeAlpha.value = opacity.value
          shade.value = mask.value
          frozen.value = true
          progress.value = 1
          scheduleOnRN(committed, paging.value)
        })()
      })
      void captured
        .then((moving) => (moving ? null : measure(current.id)))
        .then((destination) => {
          if (revision !== generation.current || snapshot.current.props.visible) return
          anchored.value = Boolean(destination)
          if (destination) {
            target.value = destination
            targetClip.value = destination.clip ?? {
              x: 0,
              y: 0,
              width: snapshot.current.viewport.width,
              height: snapshot.current.viewport.height,
            }
          }
          setPrepared(true)
        })
    }
  }, [
    clip,
    fullClip,
    fromClip,
    targetClip,
    pageWidth,
    paging,
    sessionRevision,
    visible,
    items.length,
    rect,
    opacity,
    mask,
    measure,
    from,
    target,
    anchored,
    frozen,
    closeAlpha,
    shade,
    progress,
  ])
  useEffect(() => {
    if (phase !== 'opening' || !layoutReady || prepared) return
    const revision = generation.current
    let cancelled = false
    void measure(id).then((source) => {
      if (cancelled || revision !== generation.current || phaseRef.current !== 'opening') return
      from.value = source ?? snapshot.current.interaction.rect.value
      fromClip.value = source?.clip ?? {
        x: 0,
        y: 0,
        width: snapshot.current.viewport.width,
        height: snapshot.current.viewport.height,
      }
      anchored.value = Boolean(source)
      setPrepared(true)
    })
    return () => {
      cancelled = true
    }
  }, [phase, layoutReady, prepared, id, measure, from, anchored, fromClip])
  useEffect(() => {
    if (phase !== 'opening') return
    // Failed or stalled media must not trap the session; its page still has loading/error UI.
    const timer = setTimeout(() => setLoadingExpired(true), 1000)
    return () => clearTimeout(timer)
  }, [phase, session])
  useLayoutEffect(() => {
    const hide =
      phase !== 'closed' &&
      (phase === 'closing' || (prepared && (duration === 0 || displayReady || loadingExpired)))
    sources?.hide(owner, hide ? (id ?? null) : null)
  }, [sources, owner, phase, prepared, displayReady, loadingExpired, id, duration])
  useEffect(() => {
    if (!exitComplete || phase !== 'closing') return
    if (snapshot.current.props.visible) return
    // Removing the viewer and releasing its source happen in the same React commit.
    // Restoring the source a frame earlier exposes two independently rendered images.
    phaseRef.current = 'closed'
    setPhase('closed')
    snapshot.current.props.onClosed?.()
  }, [exitComplete, phase])
  useEffect(
    () => () => {
      sources?.hide(owner, null)
    },
    [sources, owner],
  )
  useEffect(
    () => () => {
      generation.current += 1
      sessionRevision.value = generation.current
    },
    [sessionRevision],
  )
  return { phase, session, clip, rect, opacity, mask, paging, progress, presentation }
}
