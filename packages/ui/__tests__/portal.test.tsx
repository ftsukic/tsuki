import { act, render, screen } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import {
  mountPortal,
  Portal,
  PortalHost,
  ThemeProvider,
  unmountPortal,
  updatePortal,
  useToken,
} from '../src'

function TokenProbe() {
  const { token } = useToken()
  return <Text testID="token">{token.colorPrimary}</Text>
}

describe('Portal', () => {
  it('mounts portal content above the host children and updates it', async () => {
    const { rerender } = await render(
      <PortalHost>
        <Text testID="base">base</Text>
        <Portal>
          <Text testID="portal">first</Text>
        </Portal>
      </PortalHost>,
    )

    expect(screen.getByTestId('base')).toBeTruthy()
    expect(screen.getByTestId('portal')).toHaveTextContent('first')

    await rerender(
      <PortalHost>
        <Text testID="base">base</Text>
        <Portal>
          <Text testID="portal">second</Text>
        </Portal>
      </PortalHost>,
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

  it('uses the host ancestor context for portal content', async () => {
    await render(
      <ThemeProvider theme={{ token: { colorPrimary: '#123456' } }}>
        <PortalHost>
          <Portal>
            <TokenProbe />
          </Portal>
        </PortalHost>
      </ThemeProvider>,
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

  it('mounts, updates, and unmounts imperative portal entries in order', async () => {
    const view = await render(
      <PortalHost>
        <Text testID="imperative-base">base</Text>
      </PortalHost>,
    )

    let firstKey!: ReturnType<typeof mountPortal>
    let secondKey!: ReturnType<typeof mountPortal>
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

    const view = await render(<PortalHost>{null}</PortalHost>)
    let key!: ReturnType<typeof mountPortal>
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
    ).rejects.toThrow('Portal must be rendered inside PortalHost')
  })
})
