import { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'

interface PortalItem {
  key: number
  children: ReactNode
}

interface PortalManagerState {
  portals: PortalItem[]
}

/** Renders the portal entries managed by the nearest PortalHost. */
export class PortalManager extends PureComponent<Record<string, unknown>, PortalManagerState> {
  static displayName = 'PortalManager'

  state: PortalManagerState = { portals: [] }

  mount = (key: number, children: ReactNode) => {
    this.setState((state) => ({
      portals: [...state.portals, { key, children }],
    }))
  }

  update = (key: number, children: ReactNode) => {
    this.setState((state) => ({
      portals: state.portals.map((portal) =>
        portal.key === key ? { ...portal, children } : portal,
      ),
    }))
  }

  unmount = (key: number) => {
    this.setState((state) => ({
      portals: state.portals.filter((portal) => portal.key !== key),
    }))
  }

  render() {
    return this.state.portals.map(({ key, children }) => (
      <View key={key} collapsable={false} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {children}
      </View>
    ))
  }
}
