import { useEffect, useRef } from 'react'
import { Toast } from './toast'
import type { ToastInstance, ToastMessage, ToastOptions, ToastType } from './interface'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import type { PortalKey } from '../portal'

interface ToastRecord {
  id: number
  key: PortalKey | null
  options: ToastOptions
  show: boolean
  instance: ToastInstance
}

let records: ToastRecord[] = []
let nextId = 0
let allowMultiple = false

const defaultOptions: ToastOptions = {
  type: 'text',
  message: '',
  duration: 2000,
  position: 'middle',
  loadingType: 'circular',
  overlay: false,
  forbidClick: false,
  closeOnClick: false,
  closeOnClickOverlay: false,
}

let currentOptions: ToastOptions = { ...defaultOptions }
const typeOptions = new Map<ToastType, ToastOptions>()

function findRecord(id: number) {
  return records.find((record) => record.id === id)
}

function updateRecord(record: ToastRecord, next: Partial<ToastRecord>) {
  const nextRecord = { ...record, ...next }
  records = records.map((current) => (current.id === record.id ? nextRecord : current))
  if (nextRecord.key !== null) {
    updatePortal(nextRecord.key, <ToastMethod record={nextRecord} />)
  }
}

function removeRecord(record: ToastRecord) {
  const current = findRecord(record.id)
  if (!current || current.key !== record.key) return

  records = records.filter((item) => item.id !== record.id)
  if (record.key !== null) unmountPortal(record.key)
}

function createInstance(id: number): ToastInstance {
  return {
    get message() {
      return findRecord(id)?.options.message ?? ''
    },
    set message(message) {
      const record = findRecord(id)
      if (record) updateRecord(record, { options: { ...record.options, message } })
    },
    close: () => {
      const record = findRecord(id)
      if (record) updateRecord(record, { show: false })
    },
  }
}

function ToastMethod({ record }: { record: ToastRecord }) {
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      const currentRecord = recordRef.current
      const current = findRecord(currentRecord.id)
      if (current?.key === currentRecord.key) {
        records = records.filter((item) => item.id !== currentRecord.id)
      }
    },
    [],
  )

  return (
    <Toast
      {...record.options}
      show={record.show}
      onClose={() => {
        record.options.onClose?.()
        removeRecord(record)
      }}
      onShowChange={(show) => {
        if (!show) updateRecord(record, { show: false })
      }}
    />
  )
}

function parseOptions(input?: ToastOptions | string | number): ToastOptions {
  if (typeof input === 'string' || typeof input === 'number') return { message: input }
  return input ?? {}
}

function resolveOptions(type: ToastType | undefined, input?: ToastOptions | string | number) {
  const parsed = parseOptions(input)
  return {
    ...currentOptions,
    ...typeOptions.get(type ?? parsed.type ?? currentOptions.type ?? 'text'),
    ...parsed,
    ...(type ? { type } : null),
  }
}

function showResolvedToast(options: ToastOptions): ToastInstance {
  if (!allowMultiple && records.length > 0) {
    const record = records[records.length - 1]
    updateRecord(record, { options, show: true })
    return record.instance
  }

  const record: ToastRecord = {
    id: nextId++,
    key: null,
    options,
    show: true,
    instance: createInstance(nextId - 1),
  }
  records = [...records, record]

  try {
    record.key = mountPortal(<ToastMethod record={record} />)
  } catch (error) {
    records = records.filter((current) => current.id !== record.id)
    throw error
  }

  return record.instance
}

/** Displays a Toast through the active PortalHost. */
export function showToast(input?: ToastOptions | string | number): ToastInstance {
  return showResolvedToast(resolveOptions(undefined, input))
}

export function showLoadingToast(input?: ToastOptions | string | number): ToastInstance {
  return showResolvedToast(resolveOptions('loading', input))
}

export function showSuccessToast(input?: ToastOptions | string | number): ToastInstance {
  return showResolvedToast(resolveOptions('success', input))
}

export function showFailToast(input?: ToastOptions | string | number): ToastInstance {
  return showResolvedToast(resolveOptions('fail', input))
}

export function closeToast(all = false): void {
  if (all) {
    for (const record of records) updateRecord(record, { show: false })
    return
  }

  const record = allowMultiple ? records[0] : records[records.length - 1]
  if (record) updateRecord(record, { show: false })
}

export function allowMultipleToast(value = true): void {
  allowMultiple = value
}

export function setToastDefaultOptions(options: ToastOptions): void
export function setToastDefaultOptions(type: ToastType, options: ToastOptions): void
export function setToastDefaultOptions(
  typeOrOptions: ToastType | ToastOptions,
  options?: ToastOptions,
): void {
  if (typeof typeOrOptions === 'string') {
    typeOptions.set(typeOrOptions, { ...(options ?? {}) })
    return
  }

  currentOptions = { ...currentOptions, ...typeOrOptions }
}

export function resetToastDefaultOptions(type?: ToastType): void {
  if (type) {
    typeOptions.delete(type)
    return
  }

  currentOptions = { ...defaultOptions }
  typeOptions.clear()
}

export type { ToastMessage }
