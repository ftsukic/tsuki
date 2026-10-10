import { Component } from 'react'
import { PortalContext } from './context'
import { PortalConsumer } from './portal-consumer'
import { PortalHost } from './portal-host'
import { SwipeCellPressContext } from '../swipe-cell/context'
import { ThemeContext } from '../theme/context'
import type { PortalProps } from './types'

export class Portal extends Component<PortalProps> {
  static displayName = 'Portal'
  static Host = PortalHost

  render() {
    return (
      <PortalContext.Consumer>
        {(manager) => {
          return (
            <ThemeContext.Consumer>
              {(theme) => (
                <PortalConsumer manager={manager}>
                  <ThemeContext.Provider value={theme}>
                    <SwipeCellPressContext.Provider value={null}>
                      {this.props.children}
                    </SwipeCellPressContext.Provider>
                  </ThemeContext.Provider>
                </PortalConsumer>
              )}
            </ThemeContext.Consumer>
          )
        }}
      </PortalContext.Consumer>
    )
  }
}
