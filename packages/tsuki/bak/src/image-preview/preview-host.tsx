import type { ReactNode } from 'react'
import { ImagePreviewSourcesContext } from './context'
import type { ImagePreviewSourcesContextValue } from './context'
import { mountPortal, updatePortal, unmountPortal } from '../portal/imperative'

const hosts: ImagePreviewSourcesContextValue[] = []
const entries = new Map<
  number,
  {
    host: ImagePreviewSourcesContextValue | undefined
    update: (node: ReactNode) => void
    unmount: () => void
  }
>()
let nextKey = -1
export function registerPreviewHost(host: ImagePreviewSourcesContextValue) {
  hosts.push(host)
  return () => {
    const index = hosts.indexOf(host)
    if (index >= 0) hosts.splice(index, 1)
    for (const entry of entries.values()) if (entry.host === host) entry.unmount()
  }
}
export function mountPreviewPortal(node: ReactNode): number {
  const host = hosts[hosts.length - 1]
  const wrap = (child: ReactNode) =>
    host ? (
      <ImagePreviewSourcesContext.Provider value={host}>
        {child}
      </ImagePreviewSourcesContext.Provider>
    ) : (
      child
    )
  const nativeKey = mountPortal(wrap(node))
  const key = nextKey--
  entries.set(key, {
    host,
    update: (child) => updatePortal(nativeKey, wrap(child)),
    unmount: () => {
      entries.delete(key)
      unmountPortal(nativeKey)
    },
  })
  return key
}
export function updatePreviewPortal(key: number, node: ReactNode) {
  entries.get(key)?.update(node)
}
export function unmountPreviewPortal(key: number) {
  entries.get(key)?.unmount()
}
