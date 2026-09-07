import { ConfigProvider, TextInput } from '../src'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

describe('TextInput', () => {
  it('supports uncontrolled formatting and native change handlers', async () => {
    const onChangeText = jest.fn()
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <TextInput
          testID="input"
          defaultValue=""
          formatter={(value) => value.toUpperCase()}
          onChangeText={onChangeText}
          onChange={onChange}
        />
      </ConfigProvider>,
    )

    const input = screen.getByTestId('input')
    fireEvent.changeText(input, 'abc')
    expect(onChangeText).toHaveBeenLastCalledWith('ABC')
    await waitFor(() => expect(screen.getByTestId('input').props.value).toBe('ABC'))
  })

  it('supports textarea word limits and clearable behavior', async () => {
    await render(
      <ConfigProvider>
        <TextInput
          testID="textarea"
          type="textarea"
          value="hello"
          maxLength={10}
          showWordLimit
          clearable
          clearTrigger="always"
          styles={{ wordLimit: { color: 'red' } }}
        />
      </ConfigProvider>,
    )

    expect(screen.getByTestId('textarea')).toBeTruthy()
    expect(screen.getByText('5/10')).toBeTruthy()
    expect(screen.getByLabelText('清除输入')).toBeTruthy()
  })

  it('applies root semantic styles without replacing the native input style contract', async () => {
    const styles = jest.fn(() => ({ root: { padding: 4 }, input: { fontSize: 18 } }))
    await render(
      <ConfigProvider>
        <TextInput testID="styled-input" styles={styles} />
      </ConfigProvider>,
    )

    expect(styles).toHaveBeenCalled()
    expect(screen.getByTestId('styled-input')).toBeTruthy()
  })
})
