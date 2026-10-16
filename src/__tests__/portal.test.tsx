import { act, fireEvent, render, screen } from '@testing-library/react-native'
import {
  ConfigProvider,
  mountPortal,
  Portal,
  PortalHost,
  unmountPortal,
  updatePortal,
  useToken,
} from '..'
import { PortalHostContainer } from '../portal/portal-host'
import type { PortalManager } from '../portal/portal-manager'
import { StyleSheet, Text, View } from 'react-native'
import { useEffect, type ReactNode } from 'react'
import PortalImperativeExample from '../portal/__fixtures__/examples/imperative'

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
      <ConfigProvider theme={{ seed: { colorPrimary: '#123456' } }}>
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

  it('renders the manager as sibling absolute portal entries', async () => {
    await render(
      <PortalHost>
        <Text testID="base">base</Text>
        <Portal>
          <Text testID="portal">content</Text>
        </Portal>
      </PortalHost>,
    )

    const entry = screen.getByTestId('portal').parent
    const hostContent = screen.getByTestId('base').parent

    expect(StyleSheet.flatten(hostContent?.props.style)).toMatchObject({ flex: 1 })
    expect(hostContent?.props.pointerEvents).toBeUndefined()
    expect(hostContent?.props.collapsable).toBe(false)
    expect(StyleSheet.flatten(entry?.props.style)).toMatchObject(StyleSheet.absoluteFill)
    expect(entry?.props.pointerEvents).toBe('box-none')
    expect(entry?.props.collapsable).toBe(false)
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
    const host = new PortalHostContainer({ children: null })
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

  it('restores the previous imperative owner when the latest PortalHost unmounts', async () => {
    function Hosts({ showSecond }: { showSecond: boolean }) {
      return (
        <>
          <PortalHost>
            <Text testID="first-host">first host</Text>
          </PortalHost>
          {showSecond ? (
            <PortalHost>
              <Text testID="second-host">second host</Text>
            </PortalHost>
          ) : null}
        </>
      )
    }

    const view = await render(<Hosts showSecond />)

    await act(async () => {
      mountPortal(<Text testID="second-entry">second entry</Text>)
    })
    expect(screen.getByTestId('second-entry')).toBeTruthy()

    await view.rerender(<Hosts showSecond={false} />)
    await act(async () => {
      mountPortal(<Text testID="restored-entry">restored entry</Text>)
    })

    expect(screen.getByTestId('restored-entry')).toBeTruthy()
    await view.unmount()
  })

  it('routes existing keys to their original host and ignores released keys', async () => {
    function Hosts({ first, second }: { first: boolean; second: boolean }) {
      return (
        <>
          {first ? <PortalHost key="first" /> : null}
          {second ? <PortalHost key="second" /> : null}
        </>
      )
    }
    const view = await render(<Hosts first second={false} />)
    let retainedKey!: number
    let staleKey!: number
    await act(async () => {
      retainedKey = mountPortal(<Text>保留</Text>)
      staleKey = mountPortal(<Text>随宿主释放</Text>)
    })
    await view.rerender(<Hosts first second />)
    let newestKey!: number
    await act(async () => {
      newestKey = mountPortal(<Text>新宿主</Text>)
      updatePortal(retainedKey, <Text>原宿主更新</Text>)
    })
    expect(screen.getByText('原宿主更新')).toBeTruthy()
    await act(async () => {
      unmountPortal(retainedKey)
    })
    expect(screen.queryByText('原宿主更新')).toBeNull()
    await act(async () => {
      updatePortal(retainedKey, <Text>已释放 key</Text>)
    })
    expect(screen.queryByText('已释放 key')).toBeNull()
    await view.rerender(<Hosts first={false} second />)
    await act(async () => {
      updatePortal(staleKey, <Text>失效宿主</Text>)
      unmountPortal(staleKey)
      updatePortal(newestKey, <Text>新宿主更新</Text>)
    })
    expect(screen.queryByText('失效宿主')).toBeNull()
    expect(screen.getByText('新宿主更新')).toBeTruthy()
  })

  it('releases imperative example entries when switching examples', async () => {
    const view = await render(
      <PortalHost>
        <PortalImperativeExample />
      </PortalHost>,
    )
    // RNTL 14 的事件返回 Promise；当前 lint 规则仍按旧版同步签名判断。
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByText('mountPortal'))
    expect(screen.getByText('命令式 Portal 内容')).toBeTruthy()
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByText('updatePortal'))
    expect(screen.getByText('已更新的 Portal 内容')).toBeTruthy()
    await view.rerender(
      <PortalHost>
        <Text>下一案例</Text>
      </PortalHost>,
    )
    expect(screen.queryByText('已更新的 Portal 内容')).toBeNull()
  })

  it('initializes imperative entries in useEffect and releases them with the caller', async () => {
    function StartupPortal() {
      useEffect(() => {
        const key = mountPortal(<Text>初始化提示</Text>)
        return () => unmountPortal(key)
      }, [])
      return null
    }
    const view = await render(
      <PortalHost>
        <StartupPortal />
      </PortalHost>,
    )
    expect(screen.getByText('初始化提示')).toBeTruthy()
    await view.rerender(<PortalHost />)
    expect(screen.queryByText('初始化提示')).toBeNull()
  })

  it('requires a PortalHost', async () => {
    await expect(
      render(
        <Portal>
          <Text>content</Text>
        </Portal>,
      ),
    ).rejects.toThrow()
  })
})
