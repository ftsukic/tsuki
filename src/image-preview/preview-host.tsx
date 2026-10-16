import type { ReactNode } from 'react'
import { ImagePreviewSourcesContext } from './context'
import type { ImagePreviewSourcesContextValue } from './context'
import { PortalContext, PortalDestinationContext } from '../portal/context'
import { mountPortal, updatePortal, unmountPortal } from '../portal/portal-host'

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
  const manager = host?.rootManager
  const wrap = (child: ReactNode) =>
    host ? (
      <PortalContext.Provider value={manager}>
        <PortalDestinationContext.Provider value={host.rootDestination}>
          <ImagePreviewSourcesContext.Provider value={host}>
            {child}
          </ImagePreviewSourcesContext.Provider>
        </PortalDestinationContext.Provider>
      </PortalContext.Provider>
    ) : (
      child
    )
  const nativeKey = manager ? manager.mount(wrap(node)) : mountPortal(node)
  const key = nextKey--
  entries.set(key, {
    host,
    update: (child) =>
      manager ? manager.update(nativeKey, wrap(child)) : updatePortal(nativeKey, child),
    unmount: () => {
      entries.delete(key)
      if (manager) manager.unmount(nativeKey)
      else unmountPortal(nativeKey)
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
