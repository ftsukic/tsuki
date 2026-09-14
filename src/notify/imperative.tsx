import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import type { PortalKey } from '../portal'
import { NotifyContent } from './notify'
import type { NotifyMethods, NotifyProps } from './types'

interface NotifyRecord {
  id: number
  key: PortalKey | null
  options: NotifyProps
  visible: boolean
  instance: NotifyMethods
}

let records: NotifyRecord[] = []
let currentId: number | null = null
let nextId = 0
let defaultOptions: Partial<NotifyProps> = {}

function findRecord(id: number) {
  return records.find((record) => record.id === id)
}

function updateRecord(record: NotifyRecord, next: Partial<NotifyRecord>) {
  const nextRecord = { ...record, ...next }
  records = records.map((current) => (current.id === record.id ? nextRecord : current))
  if (nextRecord.key !== null) {
    updatePortal(nextRecord.key, <NotifyMethod record={nextRecord} />)
  }
}

function removeRecord(record: NotifyRecord) {
  const current = findRecord(record.id)
  if (!current || current.key !== record.key) return

  records = records.filter((item) => item.id !== record.id)
  if (currentId === record.id) currentId = null
  if (record.key !== null) unmountPortal(record.key)
}

function createInstance(id: number): NotifyMethods {
  return {
    close: () => {
      if (currentId !== id) return
      const record = findRecord(id)
      if (!record) return
      currentId = null
      updateRecord(record, { visible: false })
    },
    setMessage: (message: ReactNode) => {
      if (currentId !== id) return
      const record = findRecord(id)
      if (record) updateRecord(record, { options: { ...record.options, message } })
    },
  }
}

function NotifyMethod({ record }: { record: NotifyRecord }) {
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      const current = findRecord(recordRef.current.id)
      if (!current || current.key !== recordRef.current.key) return

      records = records.filter((item) => item.id !== current.id)
      if (currentId === current.id) currentId = null
    },
    [],
  )

  return (
    <NotifyContent
      {...record.options}
      visible={record.visible}
      onClosed={() => {
        record.options.onClosed?.()
        removeRecord(record)
      }}
    />
  )
}

NotifyMethod.displayName = 'Notify.Method'

export function showNotify(options: NotifyProps | string): NotifyMethods {
  const current = currentId === null ? undefined : findRecord(currentId)
  if (current) {
    currentId = null
    updateRecord(current, { visible: false })
  }

  const normalized: NotifyProps = {
    ...defaultOptions,
    ...(typeof options === 'string' ? { message: options } : options),
  }
  const record: NotifyRecord = {
    id: nextId++,
    key: null,
    options: normalized,
    visible: true,
    instance: createInstance(nextId - 1),
  }
  records = [...records, record]
  currentId = record.id

  try {
    record.key = mountPortal(<NotifyMethod record={record} />)
  } catch (error) {
    records = records.filter((currentRecord) => currentRecord.id !== record.id)
    if (currentId === record.id) currentId = null
    throw error
  }

  return record.instance
}

export function closeNotify(): void {
  if (currentId === null) return
  const current = findRecord(currentId)
  currentId = null
  if (current) updateRecord(current, { visible: false })
}

export function setNotifyDefaultOptions(options: Partial<NotifyProps>): void {
  defaultOptions = { ...defaultOptions, ...options }
}

export function resetNotifyDefaultOptions(): void {
  defaultOptions = {}
}
