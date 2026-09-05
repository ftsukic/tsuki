import { Button, ConfigProvider } from '../src'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('Button', () => {
  it('renders Vant variants and invokes onPress', async () => {
    const onPress = jest.fn()
    await render(
      <ConfigProvider>
        <Button testID="button" type="primary" size="mini" plain round onPress={onPress}>
          立即保存
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('button')
    expect(screen.getByText('立即保存')).toBeTruthy()
    expect(button.props.accessibilityRole).toBe('button')
    fireEvent.press(button)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders loading text and disables interaction', async () => {
    const onPress = jest.fn()
    await render(
      <ConfigProvider>
        <Button testID="loading" loading loadingText="提交中" onPress={onPress}>
          提交
        </Button>
      </ConfigProvider>,
    )

    const button = screen.getByTestId('loading')
    expect(screen.getByText('提交中')).toBeTruthy()
    expect(button.props.accessibilityState?.disabled).toBe(true)
    fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('resolves semantic styles as an object or function', async () => {
    const styles = jest.fn(({ state }) => ({ root: { marginTop: state.pressed ? 2 : 1 } }))
    await render(
      <ConfigProvider>
        <Button testID="styled" styles={styles}>
          样式
        </Button>
      </ConfigProvider>,
    )

    expect(styles).toHaveBeenCalled()
    expect(screen.getByTestId('styled')).toBeTruthy()
  })
})
