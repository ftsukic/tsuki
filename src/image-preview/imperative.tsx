import { useEffect, useRef } from 'react'
import { mountPortal, unmountPortal, updatePortal } from '../portal'
import type { PortalKey } from '../portal'
import { ImagePreviewContent } from './image-preview'
import type { ImagePreviewCloseReason, ImagePreviewImperativeOptions } from './types'

interface ImagePreviewRecord {
  key: PortalKey | null
  options: ImagePreviewImperativeOptions
  visible: boolean
}

let currentRecord: ImagePreviewRecord | null = null

const defaultOptions: ImagePreviewImperativeOptions = {
  images: [],
  startPosition: 0,
  loop: true,
  showIndex: true,
  showIndicators: false,
  minZoom: 0.5,
  maxZoom: 3,
  doubleTapZoom: 2,
  closeable: false,
  closeOnPressImage: true,
  closeOnPressOverlay: true,
  closeOnGesture: true,
}

let currentOptions: ImagePreviewImperativeOptions = { ...defaultOptions }

function renderRecord(record: ImagePreviewRecord) {
  return <ImagePreviewMethod record={record} />
}

function replaceRecord(record: ImagePreviewRecord, next: Partial<ImagePreviewRecord>) {
  const nextRecord = { ...record, ...next }
  currentRecord = nextRecord
  if (nextRecord.key !== null) updatePortal(nextRecord.key, renderRecord(nextRecord))
}

function ImagePreviewMethod({ record }: { record: ImagePreviewRecord }) {
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(
    () => () => {
      if (currentRecord === recordRef.current) currentRecord = null
    },
    [],
  )

  const handleRequestClose = (reason: ImagePreviewCloseReason) => {
    const current = recordRef.current
    if (currentRecord !== current || !current.visible) return
    replaceRecord(current, { visible: false })
    current.options.onRequestClose?.(reason)
  }

  const handleClosed = () => {
    const current = recordRef.current
    if (currentRecord === current) currentRecord = null
    current.options.onClosed?.()
    if (current.key !== null) unmountPortal(current.key)
  }

  return (
    <ImagePreviewContent
      {...record.options}
      onClosed={handleClosed}
      onRequestClose={handleRequestClose}
      visible={record.visible}
    />
  )
}

ImagePreviewMethod.displayName = 'ImagePreview.Method'

export function showImagePreview(options: ImagePreviewImperativeOptions): void {
  const nextOptions = { ...currentOptions, ...options }
  if (currentRecord?.key !== null && currentRecord) {
    replaceRecord(currentRecord, { options: nextOptions, visible: true })
    return
  }

  const record: ImagePreviewRecord = {
    key: null,
    options: nextOptions,
    visible: true,
  }
  currentRecord = record
  try {
    record.key = mountPortal(renderRecord(record))
  } catch (error) {
    if (currentRecord === record) currentRecord = null
    throw error
  }
}

export function closeImagePreview(): void {
  const current = currentRecord
  if (!current || current.key === null || !current.visible) return
  replaceRecord(current, { visible: false })
}

export function setImagePreviewDefaultOptions(options: ImagePreviewImperativeOptions): void {
  currentOptions = { ...currentOptions, ...options }
}

export function resetImagePreviewDefaultOptions(): void {
  currentOptions = { ...defaultOptions }
}
