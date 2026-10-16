import { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { PortalDestinationContext, PortalContext } from './context'
import { PortalConsumer } from './portal-consumer'
import { PortalHost } from './portal-host'
import { SwipeCellPressContext } from '../swipe-cell/context'
import { ThemeContext } from '../theme/context'
import type { PortalProps } from './types'

function PortalComponent({ children }: PortalProps) {
  const destination = useContext(PortalDestinationContext)
  const manager = useContext(PortalContext)
  const theme = useContext(ThemeContext)
  const NativePortal = destination?.backend?.Portal
  const content = (
    <SwipeCellPressContext.Provider value={null}>{children}</SwipeCellPressContext.Provider>
  )

  if (NativePortal) {
    return (
      <NativePortal hostName={destination.hostName}>
        <View collapsable={false} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {content}
        </View>
      </NativePortal>
    )
  }

  return (
    <PortalConsumer manager={manager}>
      <ThemeContext.Provider value={theme}>{content}</ThemeContext.Provider>
    </PortalConsumer>
  )
}

export const Portal = Object.assign(PortalComponent, {
  displayName: 'Portal',
  Host: PortalHost,
})
