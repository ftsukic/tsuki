import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  closeNotify,
  closeToast,
  GestureProvider,
  Popup,
  Provider,
  resetDialogDefaultOptions,
  resetNotifyDefaultOptions,
  resetToastDefaultOptions,
  showDialog,
  showNotify,
  showToast,
  useToken,
} from '..'

function ThemeProbe() {
  const { token } = useToken()
  return <Text testID="theme-probe">{token.colorPrimary}</Text>
}

describe('Provider', () => {
  afterEach(() => {
    cleanup()
    resetDialogDefaultOptions()
    resetNotifyDefaultOptions()
    resetToastDefaultOptions()
    jest.restoreAllMocks()
  })

  it('provides theme and Portal context to floating content', async () => {
    const view = await render(
      <Provider theme={{ token: { colorPrimary: '#123456', motion: false } }}>
        <Popup visible>
          <ThemeProbe />
        </Popup>
      </Provider>,
    )

    expect(screen.getByTestId('theme-probe')).toHaveTextContent('#123456')
    await view.unmount()
  })

  it('mounts Dialog, Toast, and Notify command APIs without individual providers', async () => {
    const view = await render(<Provider theme={{ token: { motion: false } }} />)

    await act(async () => {
      showToast({ duration: 0, message: '统一 Toast' })
    })
    expect(screen.getByText('统一 Toast')).toBeTruthy()
    await act(async () => closeToast())

    await act(async () => {
      showNotify({ duration: 0, message: '统一 Notify' })
    })
    expect(screen.getByText('统一 Notify')).toBeTruthy()
    await act(async () => closeNotify())

    let pending!: Promise<unknown>
    await act(async () => {
      pending = showDialog({ message: '统一 Dialog' })
    })
    expect(screen.getByText('统一 Dialog')).toBeTruthy()
    fireEvent.press(screen.getByTestId('dialog-confirm-button'))
    await expect(pending).resolves.toBe('confirm')
    await view.unmount()
  })

  it('supports multiple provider roots', async () => {
    await render(
      <>
        <Provider>
          <Text testID="first-provider">first</Text>
        </Provider>
        <Provider>
          <Text testID="second-provider">second</Text>
        </Provider>
      </>,
    )

    expect(screen.getByTestId('first-provider')).toHaveTextContent('first')
    expect(screen.getByTestId('second-provider')).toHaveTextContent('second')
  })

  it('does not add a gesture root by default', async () => {
    const view = await render(
      <Provider>
        <Text testID="default-provider-child">child</Text>
      </Provider>,
    )

    expect(screen.getByTestId('default-provider-child')).toHaveTextContent('child')
    // The tree shape verifies that the disabled capability does not add a wrapper.
    expect(view.root?.queryAll((instance) => instance.type === 'View')).toHaveLength(1)
    await view.unmount()
  })

  it('optionally wraps content with GestureHandlerRootView', async () => {
    const view = await render(
      <Provider gesture>
        <Text testID="gesture-provider-child">child</Text>
      </Provider>,
    )

    expect(screen.getByTestId('gesture-provider-child')).toHaveTextContent('child')
    // The tree shape verifies that the enabled capability adds one root wrapper.
    expect(view.root?.queryAll((instance) => instance.type === 'View')).toHaveLength(2)
    await view.unmount()
  })

  it('works inside an externally provided gesture root', async () => {
    const view = await render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider>
          <Text testID="external-gesture-provider-child">child</Text>
        </Provider>
      </GestureHandlerRootView>,
    )

    expect(screen.getByTestId('external-gesture-provider-child')).toHaveTextContent('child')
    // The tree shape verifies that Provider does not add a second root inside the external one.
    expect(view.root?.queryAll((instance) => instance.type === 'View')).toHaveLength(2)
    await view.unmount()
  })

  it('passes through children when GestureProvider is disabled', async () => {
    const view = await render(
      <GestureProvider>
        <Text testID="disabled-gesture-child">child</Text>
      </GestureProvider>,
    )

    expect(view.root?.type).toBe('Text')
    expect(view.root?.props).toMatchObject({ testID: 'disabled-gesture-child' })
    await view.unmount()
  })

  it('uses a flex root when GestureProvider is enabled', async () => {
    const view = await render(
      <GestureProvider enabled>
        <Text testID="enabled-gesture-child">child</Text>
      </GestureProvider>,
    )

    expect(view.root?.type).toBe('View')
    expect(view.root?.props).toMatchObject({ style: { flex: 1 } })
    expect(screen.getByTestId('enabled-gesture-child')).toHaveTextContent('child')
    await view.unmount()
  })
})
