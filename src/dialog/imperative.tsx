import { useEffect, useRef } from 'react'
import { DialogContent } from './dialog'
import type { DialogAction, DialogBeforeClose, DialogOptions } from './interface'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import type { PortalKey } from '../portal'

interface DialogRecord {
  key: PortalKey | null
  options: DialogOptions
  resolve: (action: DialogAction | undefined) => void
  show: boolean
  settled: boolean
}

let currentRecord: DialogRecord | null = null

const defaultOptions: DialogOptions = {
  title: '',
  message: '',
  theme: 'default',
  messageAlign: 'center',
  showConfirmButton: true,
  showCancelButton: false,
  cancelButtonText: '取消',
  confirmButtonText: '确认',
  overlay: true,
  closeOnClickOverlay: false,
}

let currentOptions: DialogOptions = { ...defaultOptions }

function replaceRecord(record: DialogRecord, next: Partial<DialogRecord>) {
  const nextRecord = { ...record, ...next }
  currentRecord = nextRecord
  if (nextRecord.key !== null) {
    updatePortal(nextRecord.key, <DialogMethod record={nextRecord} />)
  }
}

function settleRecord(record: DialogRecord, action: DialogAction | undefined) {
  if (record.settled) return

  record.settled = true
  record.resolve(action)
}

function wrapBeforeClose(
  beforeClose: DialogBeforeClose | undefined,
  actionRef: { current: DialogAction | null },
): DialogBeforeClose | undefined {
  if (!beforeClose) return undefined

  return async (action) => {
    try {
      const result = await beforeClose(action)
      if (result === false) actionRef.current = null
      else actionRef.current = action
      return result
    } catch (error) {
      actionRef.current = null
      throw error
    }
  }
}

function DialogMethod({ record }: { record: DialogRecord }) {
  const actionRef = useRef<DialogAction | null>(null)
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(() => {
    actionRef.current = null
  }, [record])

  useEffect(
    () => () => {
      if (currentRecord === recordRef.current) currentRecord = null
    },
    [],
  )

  const handleShowChange = (show: boolean) => {
    if (show || currentRecord !== recordRef.current) return

    const current = recordRef.current
    const action = actionRef.current
    actionRef.current = null
    settleRecord(current, action ?? undefined)
    replaceRecord(current, { show: false })
  }

  const handleClose = () => {
    const current = recordRef.current
    settleRecord(current, undefined)
    if (currentRecord === current) currentRecord = null
    if (current.key !== null) unmountPortal(current.key)
  }

  return (
    <DialogContent
      {...record.options}
      show={record.show}
      beforeClose={wrapBeforeClose(record.options.beforeClose, actionRef)}
      onConfirm={() => {
        actionRef.current = 'confirm'
      }}
      onCancel={() => {
        actionRef.current = 'cancel'
      }}
      onShowChange={handleShowChange}
      onClose={handleClose}
    />
  )
}

/** Displays a Dialog through the active PortalHost. */
export function showDialog(options: DialogOptions = {}): Promise<DialogAction | undefined> {
  let resolvePromise!: (action: DialogAction | undefined) => void
  const promise = new Promise<DialogAction | undefined>((resolve) => {
    resolvePromise = resolve
  })

  if (currentRecord?.key !== null && currentRecord) {
    replaceRecord(currentRecord, {
      options: { ...currentOptions, ...options },
      resolve: resolvePromise,
      show: true,
      settled: false,
    })
    return promise
  }

  const record: DialogRecord = {
    key: null,
    options: { ...currentOptions, ...options },
    resolve: resolvePromise,
    show: true,
    settled: false,
  }
  currentRecord = record
  try {
    record.key = mountPortal(<DialogMethod record={record} />)
  } catch (error) {
    if (currentRecord === record) currentRecord = null
    throw error
  }
  return promise
}

/** Displays a Dialog with a cancel action by default. */
export function showConfirmDialog(options: DialogOptions = {}) {
  return showDialog({ showCancelButton: true, ...options })
}

/** Closes the current imperative Dialog and resolves its Promise with undefined. */
export function closeDialog(): void {
  const current = currentRecord
  if (!current || current.key === null) return

  currentRecord = { ...current, show: false }
  updatePortal(current.key, <DialogMethod record={currentRecord} />)
}

export function setDialogDefaultOptions(options: DialogOptions): void {
  currentOptions = { ...currentOptions, ...options }
}

export function resetDialogDefaultOptions(): void {
  currentOptions = { ...defaultOptions }
}
