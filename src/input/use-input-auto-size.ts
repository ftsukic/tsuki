import { useCallback, useMemo, useState } from 'react'

interface UseInputAutoSizeOptions {
  enabled: boolean
  value: string
  minRows: number
  maxRows: number
  lineHeight: number
  verticalPadding: number
  wordLimitPadding: number
}

export function useInputAutoSize({
  enabled,
  value,
  minRows,
  maxRows,
  lineHeight,
  verticalPadding,
  wordLimitPadding,
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

  const onContentSizeChange = useCallback(
    (nextHeight: number) => {
      if (!enabled) return
      const normalizedHeight = Math.ceil(nextHeight)
      setContentHeight((previousHeight) =>
        previousHeight === normalizedHeight ? previousHeight : normalizedHeight,
      )
    },
    [enabled],
  )

  const inputStyle = useMemo(
    () => (enabled ? { minHeight, height, maxHeight } : undefined),
    [enabled, height, maxHeight, minHeight],
  )

  return { inputStyle, scrollEnabled, onContentSizeChange }
}
