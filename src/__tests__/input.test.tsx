import { ConfigProvider, Input } from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

describe('Input', () => {
  it('supports uncontrolled values and preserves native and string change handlers', async () => {
    const onChange = jest.fn()
    const onChangeText = jest.fn()

    await render(
      <ConfigProvider>
        <Input testID="input" onChange={onChange} onChangeText={onChangeText} />
      </ConfigProvider>,
    )

    // RNTL's TextInput update is flushed asynchronously under React 19.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('input'), 'hello')

    expect(onChangeText).toHaveBeenLastCalledWith('hello')
    await waitFor(() => expect(screen.getByTestId('input').props.value).toBe('hello'))

    // `onChange` remains the native event callback and is not replaced by the string callback.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('input'), 'change', {
      nativeEvent: { text: 'hello' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ nativeEvent: { text: 'hello' } }),
    )
  })

  it('keeps number input as a string and selects the numeric keyboard', async () => {
    const onChangeText = jest.fn()

    await render(
      <Input testID="number-input" type="number" defaultValue="001" onChangeText={onChangeText} />,
    )

    const input = screen.getByTestId('number-input')
    expect(input.props.value).toBe('001')
    expect(input.props.keyboardType).toBe('numeric')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '0010')
    expect(onChangeText).toHaveBeenLastCalledWith('0010')
    await waitFor(() => expect(screen.getByTestId('number-input').props.value).toBe('0010'))
  })

  it('maps tel, disabled and readOnly input modes', async () => {
    await render(
      <ConfigProvider>
        <Input testID="tel-input" type="tel" />
        <Input testID="disabled-input" disabled defaultValue="fixed" />
        <Input testID="readonly-input" readOnly defaultValue="readonly" />
      </ConfigProvider>,
    )

    expect(screen.getByTestId('tel-input').props.keyboardType).toBe('phone-pad')
    expect(screen.getByTestId('disabled-input').props.editable).toBe(false)
    expect(screen.getByTestId('readonly-input').props.editable).toBe(false)
  })

  it('formats values before the string change callback', async () => {
    const onChangeText = jest.fn()

    await render(
      <Input
        testID="formatted-input"
        formatter={(value) => value.toUpperCase()}
        onChangeText={onChangeText}
      />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('formatted-input'), 'abc')
    expect(onChangeText).toHaveBeenLastCalledWith('ABC')
    await waitFor(() => expect(screen.getByTestId('formatted-input').props.value).toBe('ABC'))
  })

  it('supports focus-triggered clearing and reports onClear once', async () => {
    const onClear = jest.fn()
    const onChangeText = jest.fn()

    await render(
      <Input
        testID="clear-input"
        defaultValue="hello"
        clearable
        onClear={onClear}
        onChangeText={onChangeText}
      />,
    )

    expect(screen.queryByLabelText('清除输入')).toBeNull()
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(screen.getByTestId('clear-input'), 'focus')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('清除输入'))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenLastCalledWith('')
    await waitFor(() => expect(screen.getByTestId('clear-input').props.value).toBe(''))
  })

  it('toggles uncontrolled and controlled password visibility', async () => {
    const onPasswordVisibleChange = jest.fn()

    await render(
      <ConfigProvider>
        <Input testID="password-input" type="password" defaultValue="secret" />
      </ConfigProvider>,
    )

    const passwordInput = screen.getByTestId('password-input')
    expect(passwordInput.props.secureTextEntry).toBe(true)
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('显示密码'))
    expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false)
    expect(screen.getByLabelText('隐藏密码')).toBeTruthy()

    await render(
      <Input
        testID="controlled-password"
        type="password"
        passwordVisible={false}
        onPasswordVisibleChange={onPasswordVisibleChange}
      />,
    )
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('显示密码'))
    expect(onPasswordVisibleChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByTestId('controlled-password').props.secureTextEntry).toBe(true)
  })

  it('uses component tokens for password toggle layout', async () => {
    await render(
      <ConfigProvider theme={{ components: { Input: { height: 52 } } }}>
        <Input testID="token-input" type="password" />
      </ConfigProvider>,
    )

    const toggle = screen.getByLabelText('显示密码')
    expect(StyleSheet.flatten(toggle.props.style).height).toBe(52)
  })
})
