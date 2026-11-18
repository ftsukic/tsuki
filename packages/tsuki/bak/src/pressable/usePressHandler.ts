import { useCallback, useRef } from 'react'
import type { PressableProps } from 'react-native'

type PressHandler = NonNullable<PressableProps['onPress']>
interface PressHandlerOptions {
  disabled?: boolean
  onPress?: PressableProps['onPress']
  onPressDebounceWait?: number
}

export function usePressHandler({
  disabled = false,
  onPress,
  onPressDebounceWait,
}: PressHandlerOptions): PressHandler {
  const lastPressTime = useRef(0)

  return useCallback<PressHandler>(
    (event) => {
      if (!onPress || disabled) return

      const now = Date.now()
      if (onPressDebounceWait !== undefined && now - lastPressTime.current < onPressDebounceWait) {
        return
      }

      lastPressTime.current = now
      onPress(event)
    },
    [disabled, onPress, onPressDebounceWait],
  )
}
