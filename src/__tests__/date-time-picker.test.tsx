import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState } from 'react'
import { Text } from 'react-native'
import {
  DateTimePicker,
  type DateTimePickerProps,
  type DateTimePickerRef,
} from '../date-time-picker'
import { InteractionPressable } from '../interaction'
import { Provider } from '../provider'

afterEach(cleanup)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function item(column: number, index: number) {
  return screen.getByTestId(`picker-item-${column}-${index}`)
}

function expectDate(value: unknown, expected: [number, number, number, number, number, number]) {
  expect(value).toBeInstanceOf(Date)
  const date = value as Date
  expect([
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ]).toEqual(expected)
}

function VisibleDateTimePicker(props: DateTimePickerProps) {
  return (
    <Provider theme={{ token: { motion: false } }}>
      <DateTimePicker {...props} visible />
    </Provider>
  )
}

describe('DateTimePicker', () => {
  it('renders six numeric columns with local-time labels', async () => {
    await render(
      <VisibleDateTimePicker
        maxDate={new Date(2026, 11, 31, 23, 59, 59)}
        minDate={new Date(2026, 0, 1)}
        value={new Date(2026, 8, 3, 8, 5, 9)}
      />,
    )
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(6)
    expect(within(item(0, 0)).getByText('2026年')).toBeTruthy()
    expect(within(item(1, 8)).getByText('09月')).toBeTruthy()
    expect(within(item(2, 2)).getByText('03日')).toBeTruthy()
    expect(within(item(3, 8)).getByText('08时')).toBeTruthy()
    expect(within(item(4, 5)).getByText('05分')).toBeTruthy()
    expect(within(item(5, 9)).getByText('09秒')).toBeTruthy()
  })

  it('keeps formatter separate from Date values', async () => {
    const onChange = jest.fn()
    await render(
      <VisibleDateTimePicker
        formatter={(type, value) => `${type}:${value}`}
        maxDate={new Date(2026, 11, 31, 23, 59, 59)}
        minDate={new Date(2026, 0, 1)}
        onChange={onChange}
        value={new Date(2026, 8, 10, 8, 30, 15)}
      />,
    )
    expect(within(item(3, 8)).getByText('hour:8')).toBeTruthy()
    await press(item(5, 20))
    expectDate(onChange.mock.lastCall?.[0], [2026, 9, 10, 8, 30, 20])
  })

  it('clamps a complete timestamp at a boundary', async () => {
    const onChange = jest.fn()
    await render(
      <VisibleDateTimePicker
        maxDate={new Date(2026, 8, 10, 12, 30, 15)}
        minDate={new Date(2026, 8, 10, 10, 20, 5)}
        onChange={onChange}
        value={new Date(2026, 8, 10, 12, 30, 15)}
      />,
    )
    await press(item(3, 0))
    await press(item(4, 0))
    await press(item(5, 0))
    expectDate(onChange.mock.lastCall?.[0], [2026, 9, 10, 10, 20, 5])
    expect(within(item(4, 0)).getByText('20分')).toBeTruthy()
  })

  it('synchronizes preserved minute and second values when a boundary hour changes their indices', async () => {
    const onChange = jest.fn()
    await render(
      <VisibleDateTimePicker
        maxDate={new Date(2026, 8, 10, 12, 59, 59)}
        minDate={new Date(2026, 8, 10, 10, 20, 30)}
        onChange={onChange}
        value={new Date(2026, 8, 10, 10, 20, 30)}
      />,
    )
    expect(screen.getAllByTestId(/^picker-item-4-/)).toHaveLength(40)
    expect(within(item(4, 0)).getByText('20分')).toBeTruthy()
    await press(item(3, 1))

    expectDate(onChange.mock.lastCall?.[0], [2026, 9, 10, 11, 20, 30])
    expect(screen.getAllByTestId(/^picker-item-4-/)).toHaveLength(60)
    expect(item(4, 20).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(5, 30).props.accessibilityState).toMatchObject({ selected: true })
    expect(screen.queryByTestId('picker-column-4-scroll')).toBeNull()
    expect(screen.queryByTestId('picker-column-5-scroll')).toBeNull()

    await press(item(3, 0))

    expectDate(onChange.mock.lastCall?.[0], [2026, 9, 10, 10, 20, 30])
    expect(screen.getAllByTestId(/^picker-item-4-/)).toHaveLength(40)
    expect(item(4, 0).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(5, 0).props.accessibilityState).toMatchObject({ selected: true })
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('repairs leap-year day values when changing month', async () => {
    const onChange = jest.fn()
    await render(
      <VisibleDateTimePicker
        maxDate={new Date(2028, 11, 31, 23, 59, 59)}
        minDate={new Date(2028, 0, 1)}
        onChange={onChange}
        value={new Date(2028, 0, 31, 23, 59, 59)}
      />,
    )
    await press(item(1, 1))
    expectDate(onChange.mock.lastCall?.[0], [2028, 2, 29, 23, 59, 59])
    expect(item(2, 28).props.accessibilityState).toMatchObject({ selected: true })
  })
})

describe('DateTimePicker', () => {
  it('keeps draft separate on cancel and supports imperative ref', async () => {
    function Harness() {
      const [visible, setVisible] = useState(false)
      const [value, setValue] = useState(new Date(2026, 0, 1, 8, 30, 15))
      return (
        <Provider theme={{ token: { motion: false } }}>
          <InteractionPressable onPress={() => setVisible(true)} testID="open" />
          <Text testID="value">{value.getTime()}</Text>
          <DateTimePicker
            onCancel={() => setVisible(false)}
            onConfirm={(next) => {
              setValue(next)
              setVisible(false)
            }}
            value={value}
            visible={visible}
          />
        </Provider>
      )
    }
    await render(<Harness />)
    const original = screen.getByTestId('value').props.children
    await press(screen.getByTestId('open'))
    await press(item(5, 20))
    await press(screen.getByTestId('picker-cancel'))
    expect(screen.getByTestId('value').props.children).toBe(original)

    const ref = createRef<DateTimePickerRef>()
    const onConfirm = jest.fn()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <DateTimePicker
          defaultValue={new Date(2026, 0, 1, 1, 2, 3)}
          maxDate={new Date(2026, 11, 31, 23, 59, 59)}
          minDate={new Date(2026, 0, 1)}
          onConfirm={onConfirm}
          ref={ref}
        />
      </Provider>,
    )
    await act(async () => ref.current?.open())
    await act(async () => ref.current?.confirm())
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.lastCall?.[0], [2026, 1, 1, 1, 2, 3])
  })
})
