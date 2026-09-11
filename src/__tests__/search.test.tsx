import { ConfigProvider, Search } from '..'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { createRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'

describe('Search', () => {
  it('renders the placeholder and default search icon', async () => {
    await render(
      <ConfigProvider>
        <Search testID="search" placeholder="搜索联系人" />
      </ConfigProvider>,
    )

    expect(screen.getByPlaceholderText('搜索联系人')).toBeTruthy()
    expect(screen.getByTestId('search-prefix')).toBeTruthy()
    expect(screen.getByTestId('search-root')).toBeTruthy()
  })

  it('forwards value and defaultValue through Input', async () => {
    await render(
      <>
        <Search testID="default-search" defaultValue="Alice" />
        <Search testID="controlled-search" value="Bob" />
      </>,
    )

    expect(screen.getByTestId('default-search').props.value).toBe('Alice')
    expect(screen.getByTestId('controlled-search').props.value).toBe('Bob')
  })

  it('emits string change callbacks', async () => {
    const onChange = jest.fn()
    const onChangeText = jest.fn()
    await render(<Search testID="search" onChange={onChange} onChangeText={onChangeText} />)

    // RNTL's TextInput update is flushed asynchronously under React 19.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('search'), 'Alice')

    expect(onChange).toHaveBeenLastCalledWith('Alice')
    expect(onChangeText).toHaveBeenLastCalledWith('Alice')
    await waitFor(() => expect(screen.getByTestId('search').props.value).toBe('Alice'))
  })

  it('submits the latest value and defaults the return key to search', async () => {
    const onSearch = jest.fn()
    await render(<Search testID="search" onSearch={onSearch} />)

    const input = screen.getByTestId('search')
    expect(input.props.returnKeyType).toBe('search')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, 'Alice')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(input, 'submitEditing', { nativeEvent: { text: 'Alice' } })

    expect(onSearch).toHaveBeenLastCalledWith('Alice')
  })

  it('reuses Input clear behavior and forwards onClear', async () => {
    const onChange = jest.fn()
    const onClear = jest.fn()
    await render(
      <Search
        testID="search"
        defaultValue="Alice"
        clearable
        onChange={onChange}
        onClear={onClear}
      />,
    )

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('清除输入'))

    expect(onChange).toHaveBeenLastCalledWith('')
    expect(onClear).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('search').props.value).toBe(''))
  })

  it('passes disabled and readOnly to Input', async () => {
    await render(
      <>
        <Search testID="disabled-search" disabled defaultValue="fixed" />
        <Search testID="readonly-search" readOnly defaultValue="readonly" />
      </>,
    )

    expect(screen.getByTestId('disabled-search').props.editable).toBe(false)
    expect(screen.getByTestId('readonly-search').props.editable).toBe(false)
  })

  it('renders external left and action regions', async () => {
    await render(
      <Search testID="search" left={<View testID="left-content" />} action={<Text>取消</Text>} />,
    )

    expect(screen.getByTestId('search-left')).toBeTruthy()
    expect(screen.getByTestId('left-content')).toBeTruthy()
    expect(screen.getByTestId('search-action')).toBeTruthy()
    expect(screen.getByText('取消')).toBeTruthy()
  })

  it('renders label after the search icon and keeps suffix inside Input', async () => {
    await render(<Search testID="search" label="地址" suffix={<View testID="suffix-content" />} />)

    expect(screen.getByTestId('search-prefix')).toBeTruthy()
    expect(screen.getByText('地址')).toBeTruthy()
    expect(screen.getByTestId('suffix-content')).toBeTruthy()
  })

  it('applies inputAlign to the native input', async () => {
    await render(<Search testID="search" inputAlign="center" />)

    expect(StyleSheet.flatten(screen.getByTestId('search').props.style)).toMatchObject({
      textAlign: 'center',
    })
  })

  it('keeps Search and Input backgrounds in separate layers', async () => {
    await render(<Search testID="search" background="#ffffff" />)

    const rootStyle = StyleSheet.flatten(screen.getByTestId('search-root').props.style)
    const contentStyle = StyleSheet.flatten(screen.getByTestId('search-content').props.style)

    expect(rootStyle.backgroundColor).toBe('#ffffff')
    expect(contentStyle.backgroundColor).not.toBe(rootStyle.backgroundColor)
  })

  it('uses a small square radius and a pill radius for round shape', async () => {
    await render(
      <>
        <Search testID="square-search" shape="square" />
        <Search testID="round-search" shape="round" />
      </>,
    )

    const squareRadius = StyleSheet.flatten(
      screen.getByTestId('square-search-content').props.style,
    ).borderRadius
    const roundRadius = StyleSheet.flatten(
      screen.getByTestId('round-search-content').props.style,
    ).borderRadius

    expect(squareRadius).toBeGreaterThan(0)
    expect(roundRadius).toBeGreaterThan(squareRadius)
  })

  it('forwards the ref to the native input instance', async () => {
    const ref = createRef<NativeTextInput>()
    await render(<Search ref={ref} />)

    expect(ref.current).toBeTruthy()
  })

  it('debounces autoSearch and keeps only the latest input', async () => {
    jest.useFakeTimers()
    try {
      const onSearch = jest.fn()
      await render(<Search testID="search" autoSearch debounce={300} onSearch={onSearch} />)

      const input = screen.getByTestId('search')
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent.changeText(input, 'Alice')
      jest.advanceTimersByTime(299)
      expect(onSearch).not.toHaveBeenCalled()

      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent.changeText(input, 'Bob')
      jest.advanceTimersByTime(299)
      expect(onSearch).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(onSearch).toHaveBeenLastCalledWith('Bob')
      expect(onSearch).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('submits immediately and cancels a pending autoSearch', async () => {
    jest.useFakeTimers()
    try {
      const onSearch = jest.fn()
      await render(<Search testID="search" autoSearch debounce={300} onSearch={onSearch} />)

      const input = screen.getByTestId('search')
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent.changeText(input, 'Alice')
      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent(input, 'submitEditing', { nativeEvent: { text: 'Alice' } })

      expect(onSearch).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(300)
      expect(onSearch).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('cleans up a pending autoSearch on unmount', async () => {
    jest.useFakeTimers()
    try {
      const onSearch = jest.fn()
      const { unmount } = await render(
        <Search testID="search" autoSearch debounce={300} onSearch={onSearch} />,
      )

      // eslint-disable-next-line testing-library/no-await-sync-events
      await fireEvent.changeText(screen.getByTestId('search'), 'Alice')
      await act(async () => unmount())
      await act(async () => jest.advanceTimersByTime(300))

      expect(onSearch).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })
})
