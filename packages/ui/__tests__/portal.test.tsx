import { act, render, screen } from '@testing-library/react-native'
import {
  ConfigProvider,
  mountPortal,
  Portal,
  PortalHost,
  unmountPortal,
  updatePortal,
  useToken,
} from '../src'
import type { PortalManager } from '../src/portal/manager'
import { Text, View } from 'react-native'
import type { ReactNode } from 'react'

function TokenProbe() {
  const { token } = useToken()
  return <Text testID="token">{token.colorPrimary}</Text>
}

describe('Portal', () => {
  it('mounts portal content above the host children and updates it', async () => {
    const { rerender } = await render(
      <Portal.Host>
        <Text testID="base">base</Text>
        <Portal>
          <Text testID="portal">first</Text>
        </Portal>
      </Portal.Host>,
    )

    expect(screen.getByTestId('base')).toBeTruthy()
    expect(screen.getByTestId('portal')).toHaveTextContent('first')

    await rerender(
      <Portal.Host>
        <Text testID="base">base</Text>
        <Portal>
          <Text testID="portal">second</Text>
        </Portal>
      </Portal.Host>,
    )

    expect(screen.getByTestId('portal')).toHaveTextContent('second')
  })

  it('keeps portal order when an earlier portal updates', async () => {
    const { rerender } = await render(
      <PortalHost>
        <Portal>
          <Text testID="first">first</Text>
        </Portal>
        <Portal>
          <Text testID="second">second</Text>
        </Portal>
      </PortalHost>,
    )

    await rerender(
      <PortalHost>
        <Portal>
          <Text testID="first">updated</Text>
        </Portal>
        <Portal>
          <Text testID="second">second</Text>
        </Portal>
      </PortalHost>,
    )

    expect(screen.getAllByText(/updated|second/).map((node) => node.props.children)).toEqual([
      'updated',
      'second',
    ])
  })

  it('unmounts portal content with the Portal component', async () => {
    const { rerender } = await render(
      <PortalHost>
        <Portal>
          <Text testID="portal">content</Text>
        </Portal>
      </PortalHost>,
    )

    await rerender(
      <PortalHost>
        <View testID="base" />
      </PortalHost>,
    )

    expect(screen.queryByTestId('portal')).toBeNull()
  })

  it('cleans portal content when the host unmounts', async () => {
    const { unmount } = await render(
      <PortalHost>
        <Portal>
          <Text testID="portal">content</Text>
        </Portal>
      </PortalHost>,
    )

    expect(screen.getByTestId('portal')).toBeTruthy()
    await unmount()

    expect(screen.queryByTestId('portal')).toBeNull()
  })

  it('preserves the current ConfigProvider theme in portal content', async () => {
    await render(
      <ConfigProvider theme={{ token: { colorPrimary: '#123456' } }}>
        <PortalHost>
          <Portal>
            <TokenProbe />
          </Portal>
        </PortalHost>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('token')).toHaveTextContent('#123456')
  })

  it('renders each portal in an absolute, non-blocking host layer', async () => {
    await render(
      <PortalHost>
        <Portal>
          <Text testID="portal">content</Text>
        </Portal>
      </PortalHost>,
    )

    const layer = screen.getByTestId('portal').parent
    expect(layer?.props.pointerEvents).toBe('box-none')
    expect(layer?.props.collapsable).toBe(false)
    expect(layer?.props.style).toBeTruthy()
  })

  it('queues mount, update, and unmount operations until the manager is ready', () => {
    type HostInternals = {
      manager: PortalManager | null
      mount: (children: ReactNode) => number
      update: (key: number, children: ReactNode) => void
      unmount: (key: number) => void
    }
    const manager = {
      mount: jest.fn(),
      update: jest.fn(),
      unmount: jest.fn(),
    } as unknown as PortalManager
    const host = new PortalHost({ children: null })
    const internals = host as unknown as HostInternals
    const retainedKey = internals.mount(<Text>first</Text>)
    internals.update(retainedKey, <Text>updated</Text>)
    const removedKey = internals.mount(<Text>removed</Text>)
    internals.unmount(removedKey)
    internals.manager = manager

    host.componentDidMount()

    expect(manager.mount).toHaveBeenCalledTimes(1)
    expect(manager.mount).toHaveBeenCalledWith(retainedKey, expect.anything())
    expect(manager.update).not.toHaveBeenCalled()
    expect(manager.unmount).not.toHaveBeenCalled()

    host.componentWillUnmount()
  })

  it('mounts, updates, and unmounts imperative portal entries in order', async () => {
    const view = await render(
      <PortalHost>
        <Text testID="imperative-base">base</Text>
      </PortalHost>,
    )

    let firstKey!: number
    let secondKey!: number
    await act(async () => {
      firstKey = mountPortal(<Text testID="imperative-first">first</Text>)
      secondKey = mountPortal(<Text testID="imperative-second">second</Text>)
    })

    expect(screen.getByTestId('imperative-base')).toBeTruthy()
    expect(screen.getByTestId('imperative-first')).toHaveTextContent('first')
    expect(screen.getByTestId('imperative-second')).toHaveTextContent('second')

    await act(async () => {
      updatePortal(firstKey, <Text testID="imperative-first">updated</Text>)
    })
    expect(screen.getAllByText(/updated|second/).map((node) => node.props.children)).toEqual([
      'updated',
      'second',
    ])

    await act(async () => unmountPortal(firstKey))
    expect(screen.queryByTestId('imperative-first')).toBeNull()
    expect(screen.getByTestId('imperative-second')).toBeTruthy()

    await act(async () => unmountPortal(secondKey))
    expect(screen.queryByTestId('imperative-second')).toBeNull()
    await view.unmount()
  })

  it('requires and releases the active PortalHost for imperative mounts', async () => {
    expect(() => mountPortal(<Text>without host</Text>)).toThrow(
      'PortalHost must be rendered before mounting an imperative portal',
    )

    const view = await render(<PortalHost />)
    let key!: number
    await act(async () => {
      key = mountPortal(<Text testID="released-portal">content</Text>)
    })
    expect(screen.getByTestId('released-portal')).toBeTruthy()

    await view.unmount()
    expect(screen.queryByTestId('released-portal')).toBeNull()
    expect(() => mountPortal(<Text>after host</Text>)).toThrow(
      'PortalHost must be rendered before mounting an imperative portal',
    )
    updatePortal(key, <Text>ignored update</Text>)
    unmountPortal(key)
  })

  it('requires a PortalHost', async () => {
    await expect(
      render(
        <Portal>
          <Text>content</Text>
        </Portal>,
      ),
    ).rejects.toThrow('Portal must be rendered inside Portal.Host')
  })
})
