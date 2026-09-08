import { Component } from 'react'
import type { ReactNode } from 'react'
import type { PortalMethods } from './interface'

interface PortalConsumerProps {
  manager: PortalMethods | null
  children: ReactNode
}

export class PortalConsumer extends Component<PortalConsumerProps> {
  static displayName = 'PortalConsumer'

  private key: number | null = null

  componentDidMount() {
    this.key = this.getManager().mount(this.props.children)
  }

  componentDidUpdate() {
    this.getManager().update(this.key as number, this.props.children)
  }

  componentWillUnmount() {
    this.getManager().unmount(this.key as number)
    this.key = null
  }

  render() {
    return null
  }

  private getManager(): PortalMethods {
    const { manager } = this.props
    if (!manager) {
      throw new Error(
        'Looks like you forgot to wrap your root component with `Provider` component from `@ftsukic/tsuki`.',
      )
    }
    return manager
  }
}
