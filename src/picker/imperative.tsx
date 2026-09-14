import { useEffect, useRef, useState } from 'react'
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
  selection: Pick<PickerResult, 'values' | 'options'>
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
  if (record.settled) return false
  record.settled = true
  record.resolve(result)
  return true
}

function closeRecord(record: PickerRecord, result: PickerResult) {
  if (record.settled) return false
  const closingRecord = updateRecord(record, { show: false })
  return settleRecord(closingRecord, result)
}

function cancelCurrentRecord() {
  const record = currentRecord
  if (!record || record.settled) return

  const settled = closeRecord(record, { action: 'cancel', ...record.selection })
  if (settled) record.options.onCancel?.()
}

function PickerMethod({ record }: { record: PickerRecord }) {
  const {
    duration,
    overlay,
    closeOnPressOverlay,
    safeAreaInsetBottom,
    value,
    defaultValue,
    ...pickerOptions
  } = record.options
  void value
  void defaultValue
  const [draftValues, setDraftValues] = useState(record.selection.values)
  const selectionRef = useRef<Pick<PickerResult, 'values' | 'options'>>(record.selection)
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      const current = recordRef.current
      if (currentRecord !== current || current.settled) return
      if (settleRecord(current, { action: 'cancel', ...current.selection })) {
        current.options.onCancel?.()
      }
      currentRecord = null
    },
    [],
  )

  useEffect(() => {
    selectionRef.current = record.selection
  }, [record])

  const close = (result: PickerResult, callback?: () => void) => {
    const current = recordRef.current
    if (currentRecord !== current || current.settled) return
    if (closeRecord(current, result)) callback?.()
  }

  const handleCancel = () => {
    const current = recordRef.current
    close({ action: 'cancel', ...selectionRef.current }, () => current.options.onCancel?.())
  }

  const handleChange = (values: PickerResult['values'], options: PickerResult['options']) => {
    const current = recordRef.current
    if (currentRecord !== current || current.settled) return
    const selection = { values, options }
    setDraftValues(values)
    selectionRef.current = selection
    current.selection = selection
    current.options.onChange?.(values, options)
  }

  const handleConfirm = (values: PickerResult['values'], options: PickerResult['options']) => {
    const current = recordRef.current
    if (currentRecord !== current || current.settled) return
    const selection = { values, options }
    setDraftValues(values)
    selectionRef.current = selection
    current.selection = selection
    close({ action: 'confirm', ...selection }, () => current.options.onConfirm?.(values, options))
  }

  return (
    <PopupContent
      closeOnPressOverlay={closeOnPressOverlay ?? true}
      destroyOnClosed
      duration={duration}
      onRequestClose={handleCancel}
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
        value={draftValues}
        onCancel={handleCancel}
        onChange={handleChange}
        onConfirm={handleConfirm}
      />
    </PopupContent>
  )
}

export function showPicker(options: PickerOptions): Promise<PickerResult> {
  return new Promise((resolve) => {
    cancelCurrentRecord()

    const record: PickerRecord = {
      key: null,
      options,
      resolve,
      selection: resolvePickerSelection(options),
      settled: false,
      show: true,
    }
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
  cancelCurrentRecord()
}
