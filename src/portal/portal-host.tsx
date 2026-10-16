import { Component } from 'react'
import { PortalBackendProvider } from './backend-provider'
import { StyleSheet, View } from 'react-native'
import { PortalBackendContext, PortalDestinationContext, PortalContext } from './context'
import { PortalManager } from './portal-manager'
import { BackgroundScrollLockContext, createScrollLockStore } from './scroll-lock'
import type { PortalHostProps, PortalKey, PortalMethods } from './types'
import type { ContextType, ReactNode } from 'react'

const hostRegistry: PortalMethods[] = []
let nextPortalKey = 0
let nextHostKey = 0
const portalOwners = new Map<PortalKey, PortalMethods>()

type Operation =
  | { type: 'mount'; key: number; children: ReactNode }
  | { type: 'update'; key: number; children: ReactNode }
  | { type: 'unmount'; key: number }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export class PortalHostContainer extends Component<PortalHostProps> {
  static displayName = 'Portal.Host'
  static contextType = PortalBackendContext
  private readonly hostName = `tsuki-portal-${nextHostKey++}`

  private readonly scrollLock = createScrollLockStore()
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
    hostRegistry.push(this.methods)
    this.flushQueue()
  }

  componentWillUnmount() {
    const hostIndex = hostRegistry.indexOf(this.methods)
    if (hostIndex >= 0) hostRegistry.splice(hostIndex, 1)
    this.queue = []
    for (const [key, owner] of portalOwners) {
      if (owner === this.methods) portalOwners.delete(key)
    }
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
    const backend = this.context as ContextType<typeof PortalBackendContext>
    const NativeHost = backend?.Host
    return (
      <BackgroundScrollLockContext.Provider value={this.scrollLock}>
        <PortalContext.Provider value={this.methods}>
          <PortalDestinationContext.Provider value={{ backend, hostName: this.hostName }}>
            <View collapsable={false} style={styles.container}>
              <View collapsable={false} style={styles.container}>
                {this.props.children}
              </View>
              <PortalManager ref={this.setManager} backend={backend} hostName={this.hostName} />
              {NativeHost ? (
                <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                  <NativeHost name={this.hostName} style={styles.container} />
                </View>
              ) : null}
            </View>
          </PortalDestinationContext.Provider>
        </PortalContext.Provider>
      </BackgroundScrollLockContext.Provider>
    )
  }
}

export function mountPortal(children: ReactNode): PortalKey {
  const owner = hostRegistry[hostRegistry.length - 1]
  if (!owner) {
    throw new Error('PortalHost must be rendered before mounting an imperative portal')
  }

  const key = owner.mount(children)
  portalOwners.set(key, owner)
  return key
}

export function updatePortal(key: PortalKey, children: ReactNode): void {
  portalOwners.get(key)?.update(key, children)
}

export function unmountPortal(key: PortalKey): void {
  const owner = portalOwners.get(key)
  portalOwners.delete(key)
  owner?.unmount(key)
}

/** Select a backend once, or inherit the nearest Provider/Host configuration. */
export function PortalHost({ children, teleport, portalBackend }: PortalHostProps) {
  return (
    <PortalBackendProvider backend={portalBackend} teleport={teleport}>
      <PortalHostContainer>{children}</PortalHostContainer>
    </PortalBackendProvider>
  )
}

PortalHost.displayName = 'Portal.Host'
