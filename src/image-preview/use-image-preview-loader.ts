import { useCallback, useEffect, useMemo, useState } from 'react'
import { Image } from 'react-native'
import type { ImageDimensions, NormalizedImage } from './utils'
import { cacheImageDimensions, getCachedImageDimensions, getImageSourceUri } from './utils'

const readyImageKeys = new Set<string>()

function getImageReadyKey(image: NormalizedImage, index: number) {
  const uri = getImageSourceUri(image)
  if (uri) return `uri:${uri}`
  if (image.key !== undefined) return `key:${String(image.key)}`
  return `source:${String(image.source)}:${index}`
}

function addToSet(current: Set<string>, key: string) {
  if (current.has(key)) return current
  const next = new Set(current)
  next.add(key)
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
  isImageReady: (index: number) => boolean
  markImageReady: (index: number, dimensions?: ImageDimensions) => void
  prepareIndex: (index: number) => void
}

/** Records image readiness and prefetches neighbors; FlatList owns page mounting. */
export function useImagePreviewLoader(
  normalizedImages: NormalizedImage[],
  activeIndex: number,
  visible: boolean,
  loop: boolean,
  enableNativePrefetch: boolean,
): ImagePreviewLoader {
  const imageKeys = useMemo(
    () => normalizedImages.map((image, index) => getImageReadyKey(image, index)),
    [normalizedImages],
  )
  const [readyKeys, setReadyKeys] = useState<Set<string>>(() => {
    return new Set(imageKeys.filter((key) => readyImageKeys.has(key)))
  })
  const [, setDimensionsVersion] = useState(0)
  const preparingRef = useMemo(() => new Set<number>(), [])
  const sourceSignature = useMemo(() => imageKeys.join('|'), [imageKeys])

  const loadedIndices = useMemo(() => {
    const indices = new Set<number>()
    imageKeys.forEach((key, index) => {
      if (readyKeys.has(key)) indices.add(index)
    })
    return indices
  }, [imageKeys, readyKeys])

  const isImageReady = useCallback(
    (index: number) => Boolean(imageKeys[index] && readyKeys.has(imageKeys[index])),
    [imageKeys, readyKeys],
  )

  const markImageReady = useCallback(
    (index: number, dimensions?: ImageDimensions) => {
      const image = normalizedImages[index]
      if (dimensions) {
        cacheImageDimensions(getImageSourceUri(image), dimensions)
        setDimensionsVersion((value) => value + 1)
      }
      const key = imageKeys[index]
      if (!key) return
      readyImageKeys.add(key)
      setReadyKeys((current) => addToSet(current, key))
    },
    [imageKeys, normalizedImages],
  )

  const prepareIndex = useCallback(
    (index: number) => {
      if (
        !enableNativePrefetch ||
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
    [enableNativePrefetch, normalizedImages, preparingRef],
  )

  useEffect(() => {
    preparingRef.clear()
    setReadyKeys(new Set(imageKeys.filter((key) => readyImageKeys.has(key))))
  }, [imageKeys, preparingRef, sourceSignature])

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
    if (!visible || activeIndex < 0 || activeIndex >= normalizedImages.length) return
    prepareIndex(activeIndex)
    getAdjacentIndices(activeIndex, normalizedImages.length, loop).forEach(prepareIndex)
  }, [activeIndex, loop, normalizedImages.length, prepareIndex, visible])

  return { isImageReady, loadedIndices, markImageReady, prepareIndex }
}

export type { NormalizedImage }
