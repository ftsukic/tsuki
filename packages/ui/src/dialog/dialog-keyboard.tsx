import Dialog from './dialog'
import type { DialogKeyboardProps } from './interface'
import { memo, useEffect, useMemo, useState } from 'react'
import { Keyboard, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function DialogKeyboard({ style, safeAreaTop, ...props }: DialogKeyboardProps) {
  const insets = useSafeAreaInsets()
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const dialogStyle = useMemo<ViewStyle>(
    () => ({ position: 'absolute', top: safeAreaTop ?? insets.top }),
    [insets.top, safeAreaTop],
  )

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return <Dialog {...props} style={keyboardVisible ? [dialogStyle, style] : style} />
}

export default memo(DialogKeyboard)
