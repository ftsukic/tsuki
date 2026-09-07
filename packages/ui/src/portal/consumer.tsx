import { Component } from 'react'
import type { ReactNode } from 'react'
import type { PortalMethods } from './interface'

interface PortalConsumerProps {
  manager: PortalMethods
  children: ReactNode
}

export class PortalConsumer extends Component<PortalConsumerProps> {
  static displayName = 'PortalConsumer'

  private key: number | null = null

  componentDidMount() {
    this.key = this.props.manager.mount(this.props.children)
  }

  componentDidUpdate() {
    if (this.key !== null) {
      this.props.manager.update(this.key, this.props.children)
    }
  }

  componentWillUnmount() {
    if (this.key !== null) {
      this.props.manager.unmount(this.key)
      this.key = null
    }
  }

  render() {
    return null
  }
}
