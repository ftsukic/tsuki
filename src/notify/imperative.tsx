import type { ReactNode } from 'react'
import { mountPortal, unmountPortal } from '../portal'
import { Notify } from './notify'
import type { NotifyMethods, NotifyProps } from './interface'

let notifyKey: number | null = null
let notifyRef: { current: NotifyMethods | null } | null = null
let defaultOptions: Partial<NotifyProps> = {}

export function showNotify(options: NotifyProps | string): NotifyMethods {
  closeNotify()
  const normalized: NotifyProps = {
    ...defaultOptions,
    ...(typeof options === 'string' ? { message: options } : options),
  }
  const ref = { current: null as NotifyMethods | null }
  const key = mountPortal(
    <Notify
      {...normalized}
      ref={ref}
      onClosed={() => {
        normalized.onClosed?.()
        if (notifyKey === key) {
          notifyKey = null
          notifyRef = null
          unmountPortal(key)
        }
      }}
    />,
  )
  notifyKey = key
  notifyRef = ref

  return {
    close: () => {
      if (notifyKey === key) notifyRef?.current?.close()
    },
    setMessage: (message: ReactNode) => {
      if (notifyKey === key) notifyRef?.current?.setMessage(message)
    },
  }
}

export function closeNotify(): void {
  if (notifyKey === null) return
  const key = notifyKey
  notifyKey = null
  notifyRef = null
  unmountPortal(key)
}

export function setNotifyDefaultOptions(options: Partial<NotifyProps>): void {
  defaultOptions = { ...defaultOptions, ...options }
}

export function resetNotifyDefaultOptions(): void {
  defaultOptions = {}
}
