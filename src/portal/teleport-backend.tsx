import { Platform, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { Portal, PortalHost, PortalProvider } from 'react-native-teleport'
import type { PortalBackend } from './types'
import type { PropsWithChildren } from 'react'

function TeleportProvider({ children }: PropsWithChildren) {
  if (!['ios', 'android', 'web'].includes(Platform.OS)) {
    throw new Error(
      'Teleport is supported only on iOS, Android and Web. Use the default Tsuki Portal on this platform.',
    )
  }
  return <PortalProvider>{children}</PortalProvider>
}

function TeleportHost({ name, style }: { name: string; style?: StyleProp<ViewStyle> }) {
  return (
    <PortalHost name={name} style={style}>
      {/* Keep an empty native host materialized before any portals are mounted. */}
      <View collapsable={false} pointerEvents="none" style={{ width: 1, height: 1 }} />
    </PortalHost>
  )
}

/** Import this optional entry only in apps with Teleport installed and linked. */
export const teleportPortalBackend: PortalBackend = {
  Provider: TeleportProvider,
  Host: TeleportHost,
  Portal,
}
