import type { PopupPageProps } from './interface'
import { Popup } from './popup'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function PopupPage({ safeAreaInsetTop, style, ...props }: PopupPageProps) {
  const insets = useSafeAreaInsets()

  return (
    <Popup
      {...props}
      position="bottom"
      safeAreaInsetTop
      style={[{ paddingTop: safeAreaInsetTop ?? insets.top }, style]}
    />
  )
}
