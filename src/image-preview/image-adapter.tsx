import { Image, StyleSheet } from 'react-native'
import type { ImageSourcePropType, ImageURISource } from 'react-native'
import type { ImagePreviewImageAdapter } from './types'

/** Include headers, sizing variants and request options; a URI alone is not a cache identity. */
export function getImagePreviewSourceKey(source: ImageSourcePropType): string {
  return JSON.stringify(source, (_key, value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value
    return Object.fromEntries(
      Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
    )
  })
}

function getPublicUri(source: ImageSourcePropType): string | undefined {
  if (!source || typeof source === 'number' || Array.isArray(source)) return undefined
  const { uri, headers, method, body } = source as ImageURISource
  if (headers || body || (method && method.toUpperCase() !== 'GET')) return undefined
  return typeof uri === 'string' && /^https?:\/\//i.test(uri) ? uri : undefined
}

export const defaultImagePreviewAdapter: ImagePreviewImageAdapter = {
  render: ({ style, ...props }) => (
    <Image
      {...props}
      accessible={false}
      resizeMode="contain"
      fadeDuration={0}
      style={[style, styles.image]}
    />
  ),
  preload: (source) => {
    const uri = getPublicUri(source)
    // Image.prefetch accepts no headers; private sources load through their mounted neighbor page.
    return uri && typeof Image.prefetch === 'function' ? Image.prefetch(uri) : undefined
  },
}

const styles = StyleSheet.create({ image: { width: '100%', height: '100%' } })
