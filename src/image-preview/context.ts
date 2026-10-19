import { createContext } from 'react'
import type { RefObject } from 'react'
import type { View } from 'react-native'
import type { ImagePreviewRect } from './types'

export type ImagePreviewSourceRect = ImagePreviewRect & { clip?: ImagePreviewRect }

/** Private bridge between the data-driven viewer and mounted message thumbnails. */
export interface ImagePreviewSourcesContextValue {
  register: (
    id: string,
    ref: RefObject<View | null>,
    clipRef?: RefObject<View | null>,
  ) => () => void
  measure: (id: string) => Promise<ImagePreviewSourceRect | null>
  hide: (owner: symbol, id: string | null) => void
  subscribe: (id: string, listener: () => void) => () => void
  isHidden: (id: string) => boolean
}

export const ImagePreviewSourcesContext = createContext<ImagePreviewSourcesContextValue | null>(
  null,
)
