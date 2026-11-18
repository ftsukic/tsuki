import { useCallback, useLayoutEffect, useMemo, useState } from 'react'

interface UseInputAutoSizeOptions {
  enabled: boolean
  value: string
  minRows: number
  maxRows: number
  lineHeight: number
  verticalPadding: number
  wordLimitPadding: number
  contentSizeIncludesPadding?: boolean
}

export function useInputAutoSize({
  enabled,
  value,
  minRows,
  maxRows,
  lineHeight,
  verticalPadding,
  wordLimitPadding,
  contentSizeIncludesPadding = true,
}: UseInputAutoSizeOptions) {
  const [contentHeight, setContentHeight] = useState<number>()
  const minHeight = lineHeight * minRows + verticalPadding + wordLimitPadding
  const maxHeight = lineHeight * maxRows + verticalPadding + wordLimitPadding
  const effectiveContentHeight = value.length === 0 ? undefined : contentHeight
  const height = enabled
    ? Math.min(Math.max(effectiveContentHeight ?? minHeight, minHeight), maxHeight)
    : undefined
  const scrollEnabled =
    enabled && effectiveContentHeight !== undefined && effectiveContentHeight > maxHeight

  useLayoutEffect(() => {
    if (value.length === 0 && contentHeight !== undefined) setContentHeight(undefined)
  }, [contentHeight, value])

  const onMeasure = useCallback(
    (nextHeight: number) => {
      if (!enabled) return
      if (value.length === 0) {
        setContentHeight(undefined)
        return
      }
      let normalizedHeight: number

      if (contentSizeIncludesPadding) {
        normalizedHeight = Math.ceil(nextHeight)
      } else {
        const measuredRows = Math.max(1, Math.round(nextHeight / lineHeight))
        normalizedHeight = measuredRows * lineHeight + verticalPadding + wordLimitPadding
      }
      setContentHeight((previousHeight) =>
        previousHeight === normalizedHeight ? previousHeight : normalizedHeight,
      )
    },
    [contentSizeIncludesPadding, enabled, lineHeight, value, verticalPadding, wordLimitPadding],
  )

  const inputStyle = useMemo(
    () => (enabled ? { minHeight, height, maxHeight } : undefined),
    [enabled, height, maxHeight, minHeight],
  )

  return { inputStyle, scrollEnabled, onMeasure }
}
