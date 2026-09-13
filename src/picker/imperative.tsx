import { useEffect, useRef } from 'react'
import { PopupContent } from '../popup/popup'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import { Picker } from './picker'
import type { PortalKey } from '../portal'
import type { PickerOptions, PickerResult } from './types'
import { resolvePickerState } from './utils'

interface PickerRecord {
  key: PortalKey | null
  options: PickerOptions
  resolve: (result: PickerResult) => void
  show: boolean
  settled: boolean
}

let currentRecord: PickerRecord | null = null

function resolvePickerSelection(options: PickerOptions): Pick<PickerResult, 'values' | 'options'> {
  const { values, options: selectedOptions } = resolvePickerState(
    options.columns,
    options.value ?? options.defaultValue,
  )
  return { options: selectedOptions, values }
}

function updateRecord(record: PickerRecord, next: Partial<PickerRecord>): PickerRecord {
  const nextRecord = { ...record, ...next }
  currentRecord = nextRecord
  if (nextRecord.key !== null) updatePortal(nextRecord.key, <PickerMethod record={nextRecord} />)
  return nextRecord
}

function settleRecord(record: PickerRecord, result: PickerResult) {
  if (record.settled || currentRecord !== record) return
  record.settled = true
  record.resolve(result)
}

function PickerMethod({ record }: { record: PickerRecord }) {
  const { duration, overlay, closeOnPressOverlay, safeAreaInsetBottom, ...pickerOptions } =
    record.options
  const selectionRef = useRef<Pick<PickerResult, 'values' | 'options'>>(
    resolvePickerSelection(record.options),
  )
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      if (currentRecord === recordRef.current) currentRecord = null
    },
    [],
  )

  useEffect(() => {
    selectionRef.current = resolvePickerSelection(record.options)
  }, [record])

  const close = (result: PickerResult) => {
    const current = recordRef.current
    if (currentRecord !== current) return
    const closingRecord = updateRecord(current, { show: false })
    settleRecord(closingRecord, result)
  }

  return (
    <PopupContent
      closeOnPressOverlay={closeOnPressOverlay ?? true}
      destroyOnClosed
      duration={duration}
      onRequestClose={() => close({ action: 'cancel', ...selectionRef.current })}
      overlay={overlay ?? true}
      position="bottom"
      round
      safeAreaInsetBottom={safeAreaInsetBottom ?? true}
      visible={record.show}
      onClosed={() => {
        if (record.key !== null) unmountPortal(record.key)
      }}
    >
      <Picker
        {...pickerOptions}
        onCancel={() => close({ action: 'cancel', ...selectionRef.current })}
        onChange={(values, options) => {
          selectionRef.current = { values, options }
          record.options.onChange?.(values, options)
        }}
        onConfirm={(values, options) => {
          selectionRef.current = { values, options }
          record.options.onChange?.(values, options)
          record.options.onConfirm?.(values, options)
          close({ action: 'confirm', values, options })
        }}
      />
    </PopupContent>
  )
}

export function showPicker(options: PickerOptions): Promise<PickerResult> {
  return new Promise((resolve) => {
    if (currentRecord) {
      updateRecord(currentRecord, { options, resolve, show: true })
      return
    }

    const record: PickerRecord = { key: null, options, resolve, settled: false, show: true }
    currentRecord = record
    try {
      record.key = mountPortal(<PickerMethod record={record} />)
    } catch (error) {
      if (currentRecord === record) currentRecord = null
      throw error
    }
  })
}

export function closePicker(): void {
  const record = currentRecord
  if (!record || record.key === null) return
  updateRecord(record, { show: false })
}
