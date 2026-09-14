import { useEffect, useRef } from 'react'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import type { PortalKey } from '../portal'
import { ActionSheetContent } from './action-sheet'
import type { ActionSheetAction, ActionSheetOptions, ActionSheetResult } from './types'

interface ActionSheetRecord {
  key: PortalKey | null
  options: ActionSheetOptions
  resolve: (result: ActionSheetResult | undefined) => void
  visible: boolean
  settled: boolean
}

let currentRecord: ActionSheetRecord | null = null

const defaultOptions: ActionSheetOptions = {
  actions: [],
  cancelText: '取消',
  closeOnAction: true,
  closeOnPressOverlay: true,
  overlay: true,
  safeAreaInsetBottom: true,
}

let currentOptions: ActionSheetOptions = { ...defaultOptions }

function replaceRecord(record: ActionSheetRecord, next: Partial<ActionSheetRecord>) {
  const nextRecord = { ...record, ...next }
  currentRecord = nextRecord
  if (nextRecord.key !== null) {
    updatePortal(nextRecord.key, <ActionSheetMethod record={nextRecord} />)
  }
}

function settleRecord(record: ActionSheetRecord, result: ActionSheetResult | undefined) {
  if (record.settled) return
  record.settled = true
  record.resolve(result)
}

function ActionSheetMethod({ record }: { record: ActionSheetRecord }) {
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      const current = recordRef.current
      if (currentRecord !== current) return
      settleRecord(current, 'cancel')
      currentRecord = null
    },
    [],
  )

  const handleAction = (action: ActionSheetAction) => {
    const current = recordRef.current
    if (currentRecord === current) settleRecord(current, action)
  }

  const handleCancel = () => {
    const current = recordRef.current
    if (currentRecord === current) settleRecord(current, 'cancel')
  }

  const handleRequestClose = (reason: 'action' | 'cancel' | 'overlay') => {
    const current = recordRef.current
    if (currentRecord !== current || !current.visible) return
    if (reason === 'overlay') settleRecord(current, 'cancel')
    replaceRecord(current, { visible: false })
  }

  const handleClosed = () => {
    const current = recordRef.current
    if (currentRecord === current) currentRecord = null
    if (current.key !== null) unmountPortal(current.key)
  }

  return (
    <ActionSheetContent
      {...record.options}
      visible={record.visible}
      onAction={handleAction}
      onCancelAction={handleCancel}
      onRequestClose={handleRequestClose}
      onClosed={handleClosed}
    />
  )
}

ActionSheetMethod.displayName = 'ActionSheet.Method'

export function showActionSheet(
  options: ActionSheetOptions = {},
): Promise<ActionSheetResult | undefined> {
  let resolvePromise!: (result: ActionSheetResult | undefined) => void
  const promise = new Promise<ActionSheetResult | undefined>((resolve) => {
    resolvePromise = resolve
  })
  const nextOptions = { ...currentOptions, ...options }

  if (currentRecord?.key !== null && currentRecord) {
    settleRecord(currentRecord, 'cancel')
    replaceRecord(currentRecord, {
      options: nextOptions,
      resolve: resolvePromise,
      settled: false,
      visible: true,
    })
    return promise
  }

  const record: ActionSheetRecord = {
    key: null,
    options: nextOptions,
    resolve: resolvePromise,
    settled: false,
    visible: true,
  }
  currentRecord = record
  try {
    record.key = mountPortal(<ActionSheetMethod record={record} />)
  } catch (error) {
    if (currentRecord === record) currentRecord = null
    throw error
  }
  return promise
}

export function closeActionSheet(): void {
  const current = currentRecord
  if (!current || current.key === null) return

  settleRecord(current, 'cancel')
  replaceRecord(current, { visible: false })
}

export function setActionSheetDefaultOptions(options: ActionSheetOptions): void {
  currentOptions = { ...currentOptions, ...options }
}

export function resetActionSheetDefaultOptions(): void {
  currentOptions = { ...defaultOptions }
}
