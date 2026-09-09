import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { InteractionPressable } from '../interaction'
import { Picker, PickerView } from '../picker'
import { Provider } from '../provider'
import { useState } from 'react'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { StyleSheet, Text } from 'react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'

const options = [
  { text: '第一项', value: 'first' },
  { text: '第二项', value: 'second' },
  { text: '第三项', value: 'third' },
]

afterEach(cleanup)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('PickerView', () => {
  it('uses defaultValue and exposes the centered indicator', async () => {
    await render(<PickerView columns={options} defaultValue={['second']} visibleItemCount={3} />)

    expect(screen.getByTestId('picker-item-0-1').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(StyleSheet.flatten(screen.getByTestId('picker-indicator').props.style)).toMatchObject({
      height: 44,
      top: 44,
    })
    expect(screen.getByTestId('picker-mask')).toBeTruthy()
  })

  it('reports the selected values and options when an item is pressed', async () => {
    const onChange = jest.fn()
    await render(<PickerView columns={options} onChange={onChange} />)

    await press(screen.getByTestId('picker-item-0-2'))

    expect(onChange).toHaveBeenCalledWith(['third'], [options[2]])
  })

  it('supports independent columns', async () => {
    await render(
      <PickerView
        columns={[options, [{ text: 'A', value: 'a' }]]}
        defaultValue={['second', 'a']}
      />,
    )

    expect(screen.getByTestId('picker-column-0')).toBeTruthy()
    expect(screen.getByTestId('picker-column-1')).toBeTruthy()
    expect(screen.getByTestId('picker-item-1-0').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('refreshes child columns when a cascade parent changes', async () => {
    const onChange = jest.fn()
    const columns = [
      {
        text: '中国',
        value: 'china',
        children: [
          { text: '北京', value: 'beijing' },
          { text: '上海', value: 'shanghai' },
        ],
      },
      {
        text: '日本',
        value: 'japan',
        children: [{ text: '东京', value: 'tokyo' }],
      },
    ]

    await render(
      <PickerView columns={columns} defaultValue={['china', 'shanghai']} onChange={onChange} />,
    )
    await press(screen.getByTestId('picker-item-0-1'))

    expect(onChange).toHaveBeenCalledWith(['japan', 'tokyo'], [columns[1], columns[1].children[0]])
    expect(screen.getByTestId('picker-item-1-0').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('follows a dynamic value prop', async () => {
    const view = await render(<PickerView columns={options} value={['third']} />)
    expect(screen.getByTestId('picker-item-0-2').props.accessibilityState).toMatchObject({
      selected: true,
    })

    await view.rerender(<PickerView columns={options} value={['first']} />)
    expect(screen.getByTestId('picker-item-0-0').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('waits for momentum to settle a fast scroll before reporting the value', async () => {
    const longOptions = Array.from({ length: 21 }, (_, index) => ({
      text: `选项 ${index}`,
      value: index,
    }))
    const onChange = jest.fn()

    await render(<PickerView columns={longOptions} onChange={onChange} />)

    const scroll = screen.getByTestId('picker-column-0-scroll')
    expect(scroll.props.decelerationRate).toBe('fast')
    expect(scroll.props.snapToInterval).toBe(44)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.scroll(scroll, {
        nativeEvent: { contentOffset: { x: 0, y: 20 * 44 + 10 } },
      })
    })
    expect(onChange).not.toHaveBeenCalled()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent(scroll, 'momentumScrollEnd')
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([20], [longOptions[20]])
  })
})

describe('Picker', () => {
  it('opens the Popup and confirms the draft selection', async () => {
    const onConfirm = jest.fn()

    function Harness() {
      const [visible, setVisible] = useState(false)
      return (
        <Provider theme={{ token: { motion: false } }}>
          <InteractionPressable testID="picker-trigger" onPress={() => setVisible(true)} />
          <Picker
            columns={options}
            defaultValue={['first']}
            onConfirm={(values, selectedOptions) => {
              onConfirm(values, selectedOptions)
              setVisible(false)
            }}
            visible={visible}
          />
        </Provider>
      )
    }

    await render(<Harness />)
    await press(screen.getByTestId('picker-trigger'))
    await press(screen.getByTestId('picker-item-0-1'))
    await press(screen.getByTestId('picker-confirm'))

    expect(onConfirm).toHaveBeenCalledWith(['second'], [options[1]])
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })

  it('cancels a draft without changing the external value', async () => {
    const onCancel = jest.fn()

    function Harness() {
      const [visible, setVisible] = useState(false)
      const [value, setValue] = useState<readonly string[]>(['first'])
      return (
        <Provider theme={{ token: { motion: false } }}>
          <Text testID="external-value">{value[0]}</Text>
          <InteractionPressable testID="picker-trigger" onPress={() => setVisible(true)} />
          <Picker
            columns={options}
            onCancel={() => {
              onCancel()
              setVisible(false)
            }}
            onConfirm={(nextValue) => {
              setValue(nextValue as readonly string[])
              setVisible(false)
            }}
            onChange={() => undefined}
            value={value}
            visible={visible}
          />
        </Provider>
      )
    }

    await render(<Harness />)
    await press(screen.getByTestId('picker-trigger'))
    await press(screen.getByTestId('picker-item-0-1'))
    await press(screen.getByTestId('picker-cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('external-value').props.children).toBe('first')
  })

  it('can render without a toolbar', async () => {
    await render(<Picker columns={options} showToolbar={false} />)

    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    expect(screen.getByTestId('picker-view')).toBeTruthy()
  })

  it('lets Popup own the rounded safe-area panel without duplicating container styles', async () => {
    const view = await render(
      <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}>
        <Provider theme={{ token: { motion: false } }}>
          <Picker columns={options} styles={{ container: { paddingHorizontal: 12 } }} visible />
        </Provider>
      </SafeAreaInsetsContext.Provider>,
    )

    const picker = screen.getByTestId('picker')
    const panel = picker.parent
    const panelStyle = StyleSheet.flatten(panel?.props.style)
    const pickerStyle = StyleSheet.flatten(picker.props.style)

    expect(panelStyle).toMatchObject({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingBottom: 20,
      paddingHorizontal: 12,
    })
    expect(panelStyle).not.toHaveProperty('borderBottomLeftRadius')
    expect(panelStyle).not.toHaveProperty('borderBottomRightRadius')
    expect(pickerStyle).not.toHaveProperty('paddingHorizontal')
    expect(pickerStyle).not.toHaveProperty('borderRadius')
    await view.unmount()
  })

  it('supports imperative confirmation through Provider', async () => {
    const view = await render(<Provider theme={{ token: { motion: false } }} />)
    let resultPromise!: ReturnType<typeof Picker.open>

    await act(async () => {
      resultPromise = Picker.open({ columns: options })
    })
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('picker-confirm'))
    })

    await expect(resultPromise).resolves.toEqual({
      action: 'confirm',
      options: [options[0]],
      values: ['first'],
    })
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()

    let cancelPromise!: ReturnType<typeof Picker.open>
    await act(async () => {
      cancelPromise = Picker.open({ columns: options })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('picker-cancel'))
    })
    await expect(cancelPromise).resolves.toEqual({
      action: 'cancel',
      options: [options[0]],
      values: ['first'],
    })

    await view.unmount()
  })
})
