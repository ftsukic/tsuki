import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import {
  closeNotify,
  closeToast,
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
})
