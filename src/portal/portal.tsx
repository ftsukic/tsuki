import { Component } from 'react'
import { PortalContext } from './context'
import { PortalConsumer } from './consumer'
import { PortalHost } from './host'
import { ThemeContext } from '../theme/provider'
import type { PortalProps } from './interface'

export class Portal extends Component<PortalProps> {
  static displayName = 'Portal'
  static Host = PortalHost

  render() {
    return (
      <PortalContext.Consumer>
        {(manager) => {
          if (!manager) {
            throw new Error('Portal must be rendered inside Portal.Host')
          }

          return (
            <ThemeContext.Consumer>
              {(theme) => (
                <PortalConsumer manager={manager}>
                  <ThemeContext.Provider value={theme}>{this.props.children}</ThemeContext.Provider>
                </PortalConsumer>
              )}
            </ThemeContext.Consumer>
          )
        }}
      </PortalContext.Consumer>
    )
  }
}
