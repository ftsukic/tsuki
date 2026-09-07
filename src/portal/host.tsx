import { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import { PortalContext } from './context'
import { PortalManager } from './manager'
import type { PortalHostProps, PortalKey, PortalMethods } from './interface'
import type { ReactNode } from 'react'

let activeManager: PortalMethods | null = null
let nextPortalKey = 0

type Operation =
  | { type: 'mount'; key: number; children: ReactNode }
  | { type: 'update'; key: number; children: ReactNode }
  | { type: 'unmount'; key: number }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export class PortalHost extends Component<PortalHostProps> {
  static displayName = 'Portal.Host'

  private manager: PortalManager | null = null
  private queue: Operation[] = []

  private readonly methods: PortalMethods = {
    mount: (children) => this.mount(children),
    update: (key, children) => this.update(key, children),
    unmount: (key) => this.unmount(key),
  }

  private readonly setManager = (manager: PortalManager | null) => {
    this.manager = manager
  }

  componentDidMount() {
    activeManager = this.methods
    this.flushQueue()
  }

  componentWillUnmount() {
    if (activeManager === this.methods) activeManager = null
    this.queue = []
  }

  private flushQueue() {
    const queue = this.queue
    this.queue = []

    for (const operation of queue) {
      if (!this.manager) {
        this.queue.push(operation)
        continue
      }

      switch (operation.type) {
        case 'mount':
          this.manager.mount(operation.key, operation.children)
          break
        case 'update':
          this.manager.update(operation.key, operation.children)
          break
        case 'unmount':
          this.manager.unmount(operation.key)
          break
      }
    }
  }

  private readonly mount = (children: ReactNode): PortalKey => {
    const key = nextPortalKey++

    if (this.manager) {
      this.manager.mount(key, children)
    } else {
      this.queue.push({ type: 'mount', key, children })
    }

    return key
  }

  private readonly update = (key: number, children: ReactNode) => {
    if (this.manager) {
      this.manager.update(key, children)
      return
    }

    const mountIndex = this.queue.findIndex(
      (operation) => operation.type === 'mount' && operation.key === key,
    )
    if (mountIndex >= 0) {
      this.queue[mountIndex] = { type: 'mount', key, children }
      return
    }

    const updateIndex = this.queue.findIndex(
      (operation) => operation.type === 'update' && operation.key === key,
    )
    if (updateIndex >= 0) {
      this.queue[updateIndex] = { type: 'update', key, children }
      return
    }

    this.queue.push({ type: 'update', key, children })
  }

  private readonly unmount = (key: number) => {
    if (this.manager) {
      this.manager.unmount(key)
      return
    }

    this.queue = this.queue.filter((operation) => operation.key !== key)
  }

  render() {
    return (
      <PortalContext.Provider value={this.methods}>
        <View collapsable={false} pointerEvents="box-none" style={styles.container}>
          {this.props.children}
        </View>
        <PortalManager ref={this.setManager} />
      </PortalContext.Provider>
    )
  }
}

export function mountPortal(children: ReactNode): PortalKey {
  if (!activeManager) {
    throw new Error('PortalHost must be rendered before mounting an imperative portal')
  }

  return activeManager.mount(children)
}

export function updatePortal(key: PortalKey, children: ReactNode): void {
  activeManager?.update(key, children)
}

export function unmountPortal(key: PortalKey): void {
  activeManager?.unmount(key)
}
