import { Button, ConfigProvider, Search } from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'

describe('Search', () => {
  it('renders its placeholder', async () => {
    await render(
      <ConfigProvider>
        <Search testID="search" placeholder="搜索联系人" />
      </ConfigProvider>,
    )

    expect(screen.getByPlaceholderText('搜索联系人')).toBeTruthy()
    expect(screen.getByTestId('search-container')).toBeTruthy()
  })

  it('emits the changed value', async () => {
    const onChange = jest.fn()
    await render(<Search testID="search" onChange={onChange} />)

    // RNTL's TextInput update is flushed asynchronously under React 19.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('search'), 'Alice')

    expect(onChange).toHaveBeenLastCalledWith('Alice')
    await waitFor(() => expect(screen.getByTestId('search').props.value).toBe('Alice'))
  })

  it('clears the value and notifies onClear', async () => {
    const onChange = jest.fn()
    const onClear = jest.fn()
    await render(
      <Search testID="search" defaultValue="Alice" onChange={onChange} onClear={onClear} />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('清除输入'))

    expect(onChange).toHaveBeenLastCalledWith('')
    expect(onClear).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('search').props.value).toBe(''))
  })

  it('does not accept input while disabled', async () => {
    const onChange = jest.fn()
    await render(<Search testID="search" disabled defaultValue="Alice" onChange={onChange} />)

    const input = screen.getByTestId('search')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, 'Bob')

    expect(input.props.editable).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('search').props.value).toBe('Alice')
  })

  it('forwards focus and blur events', async () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    await render(<Search testID="search" onFocus={onFocus} onBlur={onBlur} />)

    const input = screen.getByTestId('search')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'focus')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'blur')

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('uses prefix before the legacy leftIcon and default search icon', async () => {
    await render(
      <Search
        testID="search"
        prefix={<View testID="prefix" />}
        leftIcon={<View testID="left-icon" />}
      />,
    )

    expect(screen.getByTestId('prefix')).toBeTruthy()
    expect(screen.queryByTestId('left-icon')).toBeNull()
    expect(screen.getByTestId('search-prefix')).toBeTruthy()
  })

  it('uses suffix instead of the clear action when it is provided', async () => {
    await render(
      <Search
        testID="search"
        defaultValue="Alice"
        suffix={<Button testID="suffix-button">完成</Button>}
      />,
    )

    expect(screen.getByTestId('suffix-button')).toBeTruthy()
    expect(screen.queryByLabelText('清除输入')).toBeNull()
    expect(screen.getByTestId('search-suffix')).toBeTruthy()
  })

  it('uses the filled close-circle icon for clearing', async () => {
    await render(<Search testID="search" defaultValue="Alice" />)

    expect(screen.getByTestId('search-clear')).toBeTruthy()
    expect(screen.getByLabelText('清除输入')).toBeTruthy()
  })

  it('synchronizes a custom height to the container and single-line input', async () => {
    await render(<Search testID="search" height={40} />)

    const containerStyle = StyleSheet.flatten(screen.getByTestId('search-container').props.style)
    const inputStyle = StyleSheet.flatten(screen.getByTestId('search').props.style)

    expect(containerStyle.height).toBe(40)
    expect(inputStyle.height).toBe(40)
    expect(inputStyle.paddingVertical).toBe(0)
    expect(inputStyle.includeFontPadding).toBe(false)
    expect(inputStyle.textAlignVertical).toBe('center')
  })

  it('keeps multiline input unconstrained while retaining the minimum search height', async () => {
    await render(<Search testID="search" multiline height={40} />)

    const containerStyle = StyleSheet.flatten(screen.getByTestId('search-container').props.style)
    const inputStyle = StyleSheet.flatten(screen.getByTestId('search').props.style)

    expect(containerStyle.height).toBeUndefined()
    expect(containerStyle.minHeight).toBe(40)
    expect(inputStyle.height).toBeUndefined()
    expect(screen.getByTestId('search').props.multiline).toBe(true)
  })
})
