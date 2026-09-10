import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { InteractionPressable } from '../interaction'
import { Picker, PickerToolbar, PickerView } from '../picker'
import { Provider } from '../provider'
import { DatePickerCore } from '../date-picker'
import { DateTimePickerCore } from '../date-time-picker'
import { TimePicker } from '../time-picker'
import { useState } from 'react'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { StyleSheet, Text } from 'react-native'
import { getDesignToken } from '../theme'
import { afterEach, describe, expect, it, jest } from '@jest/globals'

const options = [
  { text: '第一项', value: 'first' },
  { text: '第二项', value: 'second' },
  { text: '第三项', value: 'third' },
]

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function pressableEvent() {
  return {
    currentTarget: { measure: () => undefined },
    nativeEvent: {
      changedTouches: [],
      identifier: 0,
      locationX: 0,
      locationY: 0,
      pageX: 0,
      pageY: 0,
      target: 0,
      timestamp: Date.now(),
      touches: [],
    },
    persist: () => undefined,
  }
}

function numberedOptions(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    text: String(index + 1),
    value: index + 1,
  }))
}

describe('PickerView', () => {
  it('uses six 44px rows by default and centers the indicator', async () => {
    await render(<PickerView columns={options} />)

    expect(StyleSheet.flatten(screen.getByTestId('picker-view').props.style)).toMatchObject({
      height: 264,
    })
    expect(StyleSheet.flatten(screen.getByTestId('picker-indicator').props.style)).toMatchObject({
      top: 110,
      height: 44,
    })
  })

  it.each([3, 5, 7])('keeps custom visibleItemCount=%s', async (visibleItemCount) => {
    await render(<PickerView columns={options} visibleItemCount={visibleItemCount} />)

    expect(StyleSheet.flatten(screen.getByTestId('picker-view').props.style)).toMatchObject({
      height: 44 * visibleItemCount,
    })
    expect(StyleSheet.flatten(screen.getByTestId('picker-indicator').props.style)).toMatchObject({
      top: ((visibleItemCount - 1) * 44) / 2,
      height: 44,
    })
  })

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

  it('keeps a dynamic child at the prior index when its options shrink', async () => {
    const marchOptions = numberedOptions(31)
    const februaryOptions = numberedOptions(28)
    const months = [
      { text: '03', value: 3 },
      { text: '02', value: 2 },
    ]
    const onChange = jest.fn()
    await render(
      <PickerView
        columns={[
          months,
          ({ selectedValues }) => (selectedValues[0] === 3 ? marchOptions : februaryOptions),
        ]}
        defaultValue={[3, 30]}
        onChange={onChange}
      />,
    )
    const dayColumn = screen.getByTestId('picker-column-1')

    await press(screen.getByTestId('picker-item-0-1'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([2, 28], [months[1], februaryOptions[27]])
    expect(onChange.mock.calls.map((call) => (call[0] as readonly number[])[1])).not.toContain(1)
    expect(screen.getByTestId('picker-item-1-27').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-column-1')).toBe(dayColumn)
    expect(screen.queryByTestId('picker-column-1-scroll')).toBeNull()
  })

  it('reconciles a replaced child at the prior index even when the item count is unchanged', async () => {
    const parents = [
      { text: 'A', value: 'a' },
      { text: 'B', value: 'b' },
    ]
    const childOptions = {
      a: numberedOptions(3).map((item) => ({ ...item, value: item.value * 10 })),
      b: [40, 50, 60].map((value) => ({ text: String(value), value })),
    }
    const onChange = jest.fn()
    await render(
      <PickerView
        columns={[parents, ({ selectedValues }) => childOptions[selectedValues[0] as 'a' | 'b']]}
        defaultValue={['a', 30]}
        onChange={onChange}
      />,
    )
    await press(screen.getByTestId('picker-item-0-1'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['b', 60], [parents[1], childOptions.b[2]])
    expect(screen.getByTestId('picker-item-1-2').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('synchronizes a preserved value when a dynamic child index is rebased in either direction', async () => {
    const parents = [
      { text: '20+', value: 'bounded' },
      { text: '0+', value: 'full' },
    ]
    const boundedOptions = Array.from({ length: 40 }, (_, index) => ({
      text: String(index + 20),
      value: index + 20,
    }))
    const fullOptions = numberedOptions(60).map((item) => ({ ...item, value: item.value - 1 }))
    const onChange = jest.fn()
    await render(
      <PickerView
        columns={[
          parents,
          ({ selectedValues }) => (selectedValues[0] === 'bounded' ? boundedOptions : fullOptions),
        ]}
        defaultValue={['bounded', 20]}
        onChange={onChange}
      />,
    )
    await press(screen.getByTestId('picker-item-0-1'))
    expect(onChange).toHaveBeenLastCalledWith(['full', 20], [parents[1], fullOptions[20]])

    await press(screen.getByTestId('picker-item-0-0'))
    expect(onChange).toHaveBeenLastCalledWith(['bounded', 20], [parents[0], boundedOptions[0]])
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

  it('renders a native scroll surface with a stable initial offset', async () => {
    const longOptions = Array.from({ length: 21 }, (_, index) => ({
      text: `选项 ${index}`,
      value: index,
    }))

    await render(<PickerView columns={longOptions} defaultValue={[20]} />)

    expect(screen.getByTestId('picker-column-0-viewport')).toBeTruthy()
    expect(screen.getByTestId('picker-column-0-viewport').props.contentOffset).toEqual({
      x: 0,
      y: 880,
    })
    expect(screen.getByTestId('picker-column-0-viewport').props.decelerationRate).toBe('fast')
    expect(screen.getByTestId('picker-column-0-viewport').props.snapToAlignment).toBe('start')
    expect(screen.getByTestId('picker-item-0-20').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('settles a drag without momentum once', async () => {
    const onChange = jest.fn()
    await render(<PickerView columns={numberedOptions(5)} onChange={onChange} />)
    const viewport = screen.getByTestId('picker-column-0-viewport')

    await act(async () => {
      viewport.props.onScrollEndDrag({
        nativeEvent: { contentOffset: { x: 0, y: 44 }, velocity: { x: 0, y: 0 } },
      })
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith([2], [numberedOptions(5)[1]])
  })

  it('defers a fling until momentum ends and emits one change', async () => {
    const onChange = jest.fn()
    await render(<PickerView columns={numberedOptions(5)} onChange={onChange} />)
    const viewport = screen.getByTestId('picker-column-0-viewport')

    await act(async () => {
      viewport.props.onScrollEndDrag({
        nativeEvent: { contentOffset: { x: 0, y: 44 }, velocity: { x: 0, y: 800 } },
      })
    })
    expect(onChange).not.toHaveBeenCalled()

    await act(async () => {
      viewport.props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: 0, y: 44 } },
      })
    })
    expect(onChange).toHaveBeenCalledTimes(1)

    await act(async () => {
      viewport.props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: 0, y: 44 } },
      })
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('PickerToolbar', () => {
  it('uses equal action hit areas, Vant opacity feedback, and no divider by default', async () => {
    await render(<PickerToolbar title="选择城市" />)

    const cancel = screen.getByTestId('picker-cancel')
    const confirm = screen.getByTestId('picker-confirm')
    const toolbarStyle = StyleSheet.flatten(screen.getByTestId('picker-toolbar').props.style)

    expect(StyleSheet.flatten(cancel.props.style)).toMatchObject({
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    })
    expect(StyleSheet.flatten(confirm.props.style)).toMatchObject({
      alignItems: 'flex-end',
      alignSelf: 'stretch',
    })
    expect(StyleSheet.flatten(screen.getByText('选择城市').props.style)).toMatchObject({
      color: getDesignToken().colorText,
      fontSize: getDesignToken().fontSizeLG,
      fontWeight: '600',
      lineHeight: getDesignToken().lineHeight,
    })
    expect(toolbarStyle).not.toHaveProperty('borderBottomWidth')

    await act(async () => {
      cancel.props.onResponderGrant(pressableEvent())
    })
    expect(StyleSheet.flatten(screen.getByTestId('picker-cancel').props.style)).toMatchObject({
      opacity: 0.6,
    })
  })

  it('can opt into the toolbar divider', async () => {
    await render(<PickerToolbar showDivider title="选择城市" />)

    expect(StyleSheet.flatten(screen.getByTestId('picker-toolbar').props.style)).toMatchObject({
      borderBottomColor: getDesignToken().colorBorderSecondary,
      borderBottomWidth: getDesignToken().lineWidth,
    })
  })
})

describe('Picker', () => {
  it('keeps the default and explicit six-row geometry without odd-count coercion', async () => {
    await render(<Picker columns={options} showToolbar={false} />)
    expect(StyleSheet.flatten(screen.getByTestId('picker-view').props.style)).toMatchObject({
      height: 264,
    })

    await cleanup()
    await render(<Picker columns={options} showToolbar={false} visibleItemCount={6} />)
    expect(StyleSheet.flatten(screen.getByTestId('picker-view').props.style)).toMatchObject({
      height: 264,
    })
  })

  it('inherits the default six-row geometry in DatePicker, TimePicker, and DateTimePicker', async () => {
    const expectDefaultGeometry = () => {
      expect(StyleSheet.flatten(screen.getByTestId('picker-view').props.style)).toMatchObject({
        height: 264,
      })
      expect(StyleSheet.flatten(screen.getByTestId('picker-indicator').props.style)).toMatchObject({
        top: 110,
        height: 44,
      })
    }

    await render(
      <DatePickerCore
        maxDate={new Date(2037, 11, 31)}
        minDate={new Date(2017, 0, 1)}
        value={new Date(2027, 0, 1)}
      />,
    )
    expectDefaultGeometry()
    await cleanup()

    await render(<TimePicker showToolbar={false} value={['08', '30']} />)
    expectDefaultGeometry()
    await cleanup()

    await render(
      <DateTimePickerCore
        maxDate={new Date(2037, 11, 31, 23, 59, 59)}
        minDate={new Date(2017, 0, 1)}
        value={new Date(2027, 0, 1, 8, 30, 0)}
      />,
    )
    expectDefaultGeometry()
  })

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

  it('passes the toolbar divider configuration to PickerToolbar', async () => {
    await render(<Picker columns={options} showToolbarDivider />)

    expect(StyleSheet.flatten(screen.getByTestId('picker-toolbar').props.style)).toMatchObject({
      borderBottomColor: getDesignToken().colorBorderSecondary,
      borderBottomWidth: getDesignToken().lineWidth,
    })
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
