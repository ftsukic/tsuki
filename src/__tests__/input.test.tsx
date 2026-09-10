import { ConfigProvider, Input } from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

describe('Input', () => {
  function getInputStyle(testID: string) {
    return StyleSheet.flatten(screen.getByTestId(testID).props.style)
  }

  it('does not enable multiline implicitly for autoSize', async () => {
    await render(<Input testID="single-line-auto-size" autoSize />)

    const input = screen.getByTestId('single-line-auto-size')
    expect(input.props.multiline).not.toBe(true)
    expect(input.props.scrollEnabled).toBeUndefined()
  })

  it('keeps single-line controls at a stable token height', async () => {
    await render(
      <>
        <Input testID="small-input" size="small" prefix="$" suffix="USD" />
        <Input testID="normal-input" />
        <Input testID="large-input" size="large" clearable defaultValue="value" />
      </>,
    )

    for (const testID of ['small-input', 'normal-input', 'large-input']) {
      const style = getInputStyle(testID)
      expect(style).not.toEqual(
        expect.objectContaining({
          height: expect.anything(),
          minHeight: expect.anything(),
        }),
      )
    }
  })

  it('does not use maxRows as native numberOfLines or accumulate padding', async () => {
    await render(
      <Input
        testID="stable-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('stable-auto-size')
    expect(input.props.numberOfLines).toBeUndefined()

    for (const height of [40, 40, 40]) {
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(input, 'contentSizeChange', {
        nativeEvent: { contentSize: { width: 200, height } },
      })
    }

    await waitFor(() => expect(getInputStyle('stable-auto-size').height).toBe(40))
    expect(getInputStyle('stable-auto-size')).toMatchObject({ minHeight: 36, maxHeight: 116 })
  })

  it('keeps an empty autoSize input at minHeight', async () => {
    await render(<Input testID="empty-auto-size" multiline autoSize={{ minRows: 1, maxRows: 5 }} />)

    const input = screen.getByTestId('empty-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })

    // Empty values ignore placeholder/native noise and return to the one-line bound.
    expect(getInputStyle('empty-auto-size')).toMatchObject({ height: 36, minHeight: 36 })
  })

  it('clamps measured content to minHeight and grows without re-adding padding', async () => {
    await render(
      <Input
        testID="growing-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('growing-auto-size')
    for (const [height, expected] of [
      [20, 36],
      [40, 40],
      [60, 60],
    ]) {
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(input, 'contentSizeChange', {
        nativeEvent: { contentSize: { width: 200, height } },
      })
      await waitFor(() => expect(getInputStyle('growing-auto-size').height).toBe(expected))
    }
  })

  it('uses content size to grow and proxies the native callback', async () => {
    const onContentSizeChange = jest.fn()

    await render(
      <Input
        testID="auto-size-input"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
        onContentSizeChange={onContentSizeChange}
      />,
    )

    const input = screen.getByTestId('auto-size-input')
    const event = {
      nativeEvent: { contentSize: { width: 200, height: 40 } },
    }
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', event)

    expect(onContentSizeChange).toHaveBeenCalledWith(event)
    await waitFor(() => expect(getInputStyle('auto-size-input').height).toBe(40))
    expect(screen.getByTestId('auto-size-input').props.scrollEnabled).toBe(false)
  })

  it('clamps autoSize to maxRows and enables native scrolling', async () => {
    await render(
      <Input
        testID="clamped-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 3 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('clamped-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 100 } },
    })

    await waitFor(() => expect(getInputStyle('clamped-auto-size').height).toBe(76))
    expect(screen.getByTestId('clamped-auto-size').props.scrollEnabled).toBe(true)
  })

  it('shrinks when content size decreases', async () => {
    await render(
      <Input
        testID="shrinking-auto-size"
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="x"
      />,
    )

    const input = screen.getByTestId('shrinking-auto-size')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(getInputStyle('shrinking-auto-size').height).toBe(116))

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 20 } },
    })
    await waitFor(() => expect(getInputStyle('shrinking-auto-size').height).toBe(36))
    expect(screen.getByTestId('shrinking-auto-size').props.scrollEnabled).toBe(false)
  })

  it('reserves word limit space and hides clear for multiline input', async () => {
    await render(
      <Input
        testID="word-limit-auto-size"
        multiline
        autoSize
        clearable
        defaultValue="hello"
        showWordLimit
        maxLength={500}
      />,
    )

    const input = screen.getByTestId('word-limit-auto-size')
    const inputStyle = StyleSheet.flatten(input.props.style)
    expect(inputStyle.paddingBottom).toBeGreaterThan(inputStyle.paddingTop)
    expect(inputStyle.paddingBottom).toBe(34)
    expect(screen.getByText('5/500')).toBeTruthy()
    expect(screen.queryByLabelText('清除输入')).toBeNull()
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style)).toMatchObject({
      position: 'absolute',
      right: expect.any(Number),
      bottom: expect.any(Number),
    })
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style).right).toBeGreaterThan(0)
    expect(StyleSheet.flatten(screen.getByText('5/500').props.style).bottom).toBeGreaterThan(0)

    // The native measurement is clamped to the bound that already includes the
    // word-limit area; the reserve is not added a second time.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(getInputStyle('word-limit-auto-size').height).toBe(142))
    expect(input.props.scrollEnabled).toBe(true)
  })

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
