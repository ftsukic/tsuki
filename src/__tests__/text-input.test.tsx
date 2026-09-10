import { ConfigProvider, TextInput } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('TextInput', () => {
  it('keeps the native value and callback contracts', async () => {
    const onChangeText = jest.fn()
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <TextInput
          testID="input"
          defaultValue="default"
          onChangeText={onChangeText}
          onChange={onChange}
        />
      </ConfigProvider>,
    )

    const input = screen.getByTestId('input')
    expect(input.props.defaultValue).toBe('default')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, 'abc')
    expect(onChangeText).toHaveBeenLastCalledWith('abc')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'change', { nativeEvent: { text: 'abc' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: { text: 'abc' } }))
  })

  it('passes through placeholder, keyboard, secure, multiline and editable props', async () => {
    await render(
      <ConfigProvider>
        <TextInput
          testID="native"
          placeholder="请输入"
          keyboardType="numeric"
          secureTextEntry
          multiline
          editable={false}
        />
      </ConfigProvider>,
    )

    const input = screen.getByTestId('native')
    expect(input.props.placeholder).toBe('请输入')
    expect(input.props.keyboardType).toBe('numeric')
    expect(input.props.secureTextEntry).toBe(true)
    expect(input.props.multiline).toBe(true)
    expect(input.props.editable).toBe(false)
  })
})
