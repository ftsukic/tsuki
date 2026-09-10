import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image } from 'react-native'
import type { ImageDimensions, NormalizedImage } from './utils'
import { cacheImageDimensions, getCachedImageDimensions, getImageSourceUri } from './utils'

function addToSet(current: Set<number>, index: number) {
  if (current.has(index)) return current
  const next = new Set(current)
  next.add(index)
  return next
}

function getAdjacentIndices(index: number, count: number, loop: boolean) {
  const result = new Set<number>()
  if (count <= 1) return result
  for (const candidate of [index - 1, index + 1]) {
    if (loop) result.add(((candidate % count) + count) % count)
    else if (candidate >= 0 && candidate < count) result.add(candidate)
  }
  return result
}

export interface ImagePreviewLoader {
  loadedIndices: ReadonlySet<number>
  markImageReady: (index: number, dimensions?: ImageDimensions) => void
  prepareIndex: (index: number) => void
}

/** Records image readiness and prefetches neighbors; FlatList owns page mounting. */
export function useImagePreviewLoader(
  normalizedImages: NormalizedImage[],
  activeIndex: number,
  visible: boolean,
  loop: boolean,
  hasCustomRenderer: boolean,
): ImagePreviewLoader {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set())
  const [activeReady, setActiveReady] = useState(false)
  const [, setDimensionsVersion] = useState(0)
  const preparingRef = useMemo(() => new Set<number>(), [])
  const sourceSignature = useMemo(
    () =>
      normalizedImages
        .map((image, index) => getImageSourceUri(image) ?? String(image.key ?? index))
        .join('|'),
    [normalizedImages],
  )

  const markImageReady = useCallback(
    (index: number, dimensions?: ImageDimensions) => {
      const image = normalizedImages[index]
      if (dimensions) {
        cacheImageDimensions(getImageSourceUri(image), dimensions)
        setDimensionsVersion((value) => value + 1)
      }
      setLoadedIndices((current) => addToSet(current, index))
      if (index === activeIndex) setActiveReady(true)
    },
    [activeIndex, normalizedImages],
  )

  const prepareIndex = useCallback(
    (index: number) => {
      if (
        hasCustomRenderer ||
        index < 0 ||
        index >= normalizedImages.length ||
        preparingRef.has(index)
      )
        return
      const uri = getImageSourceUri(normalizedImages[index])
      if (!uri) return
      try {
        if (typeof Image.prefetch !== 'function') return
        preparingRef.add(index)
        const result = Image.prefetch(uri)
        if (result && typeof result.then === 'function') {
          void result.then(
            () => preparingRef.delete(index),
            () => preparingRef.delete(index),
          )
        } else {
          preparingRef.delete(index)
        }
      } catch {
        preparingRef.delete(index)
      }
    },
    [hasCustomRenderer, normalizedImages, preparingRef],
  )

  useEffect(() => {
    preparingRef.clear()
    setLoadedIndices(new Set())
    setActiveReady(false)
  }, [preparingRef, sourceSignature, visible])

  useEffect(() => {
    if (!visible || activeIndex < 0 || activeIndex >= normalizedImages.length) return
    const image = normalizedImages[activeIndex]
    const uri = getImageSourceUri(image)
    if (!uri || (image.width && image.height) || getCachedImageDimensions(image)) return
    if (typeof Image.getSize !== 'function') return

    try {
      Image.getSize(
        uri,
        (width, height) => {
          cacheImageDimensions(uri, { width, height })
          setDimensionsVersion((value) => value + 1)
        },
        () => undefined,
      )
    } catch {
      // onLoad still provides a final size if getSize is unavailable on a platform.
    }
  }, [activeIndex, normalizedImages, visible])

  useEffect(() => {
    if (!visible || !activeReady) return
    getAdjacentIndices(activeIndex, normalizedImages.length, loop).forEach(prepareIndex)
  }, [activeIndex, activeReady, loop, normalizedImages.length, prepareIndex, visible])

  return { loadedIndices, markImageReady, prepareIndex }
}

export type { NormalizedImage }
