import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState } from 'react'
import { Text } from 'react-native'
import { InteractionPressable } from '../interaction'
import { Provider } from '../provider'
import {
  DatePicker,
  getDaysInMonth,
  isLeapYear,
  type DatePickerProps,
  type DatePickerRef,
} from '../date-picker'

afterEach(cleanup)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function getItem(columnIndex: number, itemIndex: number) {
  return screen.getByTestId(`picker-item-${columnIndex}-${itemIndex}`)
}

function expectDate(value: unknown, year: number, month: number, day: number) {
  expect(value).toBeInstanceOf(Date)
  const date = value as Date
  expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([year, month, day])
}

function VisibleDatePicker(props: DatePickerProps) {
  return (
    <Provider theme={{ token: { motion: false } }}>
      <DatePicker {...props} visible />
    </Provider>
  )
}

describe('date-picker.utils', () => {
  it('calculates month lengths without a fixed month table', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28)
    expect(getDaysInMonth(2028, 2)).toBe(29)
    expect(isLeapYear(2028)).toBe(true)
    expect(isLeapYear(2100)).toBe(false)
  })
})

describe('DatePicker', () => {
  it('renders date columns with separated numeric values and labels', async () => {
    await render(
      <VisibleDatePicker
        maxDate={new Date(2026, 11, 31)}
        minDate={new Date(2026, 0, 1)}
        value={new Date(2026, 8, 10)}
      />,
    )

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(within(getItem(0, 0)).getByText('2026年')).toBeTruthy()
    expect(within(getItem(1, 8)).getByText('09月')).toBeTruthy()
    expect(within(getItem(2, 9)).getByText('10日')).toBeTruthy()
    expect(getItem(2, 9).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('uses the formatter only for display labels', async () => {
    await render(
      <VisibleDatePicker
        formatter={(type, value) => `${type}:${value}`}
        maxDate={new Date(2026, 11, 31)}
        minDate={new Date(2026, 0, 1)}
        value={new Date(2026, 8, 10)}
      />,
    )

    expect(within(getItem(0, 0)).getByText('year:2026')).toBeTruthy()
    expect(within(getItem(1, 8)).getByText('month:9')).toBeTruthy()
    expect(within(getItem(2, 9)).getByText('day:10')).toBeTruthy()
  })

  it('shrinks February and repairs January 31 to February 28', async () => {
    const onChange = jest.fn()

    await render(
      <VisibleDatePicker
        maxDate={new Date(2026, 11, 31)}
        minDate={new Date(2026, 0, 1)}
        onChange={onChange}
        value={new Date(2026, 0, 31)}
      />,
    )

    await press(getItem(1, 1))

    expect(screen.getAllByTestId(/^picker-item-2-/)).toHaveLength(28)
    expect(getItem(2, 27).props.accessibilityState).toMatchObject({ selected: true })
    expectDate(onChange.mock.lastCall?.[0], 2026, 2, 28)
  })

  it.each([
    ['2026-03-30 to February', new Date(2026, 2, 30), 2, 2026, 2, 28],
    ['2026-03-31 to April', new Date(2026, 2, 31), 4, 2026, 4, 30],
    ['2026-03-31 to February', new Date(2026, 2, 31), 2, 2026, 2, 28],
    ['2028-03-31 to leap-year February', new Date(2028, 2, 31), 2, 2028, 2, 29],
    ['2027-03-31 to non-leap-year February', new Date(2027, 2, 31), 2, 2027, 2, 28],
  ])(
    'keeps the dynamic day selection stable when changing %s',
    async (_name, startDate, targetMonth, expectedYear, expectedMonth, expectedDay) => {
      const onChange = jest.fn()
      const year = (startDate as Date).getFullYear()

      await render(
        <VisibleDatePicker
          maxDate={new Date(year, 11, 31)}
          minDate={new Date(year, 0, 1)}
          onChange={onChange}
          value={startDate as Date}
        />,
      )

      await press(getItem(1, (targetMonth as number) - 1))

      expect(onChange).toHaveBeenCalledTimes(1)
      expectDate(
        onChange.mock.lastCall?.[0],
        expectedYear as number,
        expectedMonth as number,
        expectedDay as number,
      )
      expect(screen.getAllByTestId(/^picker-item-2-/)).toHaveLength(
        getDaysInMonth(expectedYear as number, expectedMonth as number),
      )
      expect(getItem(2, (expectedDay as number) - 1).props.accessibilityState).toMatchObject({
        selected: true,
      })
    },
  )

  it.each([
    ['maxDate', new Date(2026, 7, 31), new Date(2026, 0, 1), new Date(2026, 8, 10), 9, 2026, 9, 10],
    [
      'minDate',
      new Date(2026, 2, 1),
      new Date(2026, 1, 10),
      new Date(2026, 11, 31),
      2,
      2026,
      2,
      10,
    ],
  ])(
    'repairs the day when %s shortens the dynamic range',
    async (
      _name,
      startDate,
      minDate,
      maxDate,
      targetMonth,
      expectedYear,
      expectedMonth,
      expectedDay,
    ) => {
      const onChange = jest.fn()

      await render(
        <VisibleDatePicker
          maxDate={maxDate as Date}
          minDate={minDate as Date}
          onChange={onChange}
          value={startDate as Date}
        />,
      )

      await press(getItem(1, (targetMonth as number) - ((minDate as Date).getMonth() + 1)))

      expect(onChange).toHaveBeenCalledTimes(1)
      expectDate(
        onChange.mock.lastCall?.[0],
        expectedYear as number,
        expectedMonth as number,
        expectedDay as number,
      )
      expect(
        getItem(2, (expectedDay as number) - (minDate as Date).getDate()).props.accessibilityState,
      ).toMatchObject({ selected: true })
    },
  )

  it('supports year-month and year modes', async () => {
    const range = { maxDate: new Date(2026, 11, 31), minDate: new Date(2025, 0, 1) }

    await render(<VisibleDatePicker {...range} type="year-month" value={new Date(2026, 8, 10)} />)
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(2)

    await cleanup()
    await render(<VisibleDatePicker {...range} type="year" value={new Date(2026, 8, 10)} />)
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(1)
  })

  it('applies min/max boundaries to the linked day column', async () => {
    await render(
      <VisibleDatePicker
        maxDate={new Date(2026, 8, 10)}
        minDate={new Date(2026, 0, 1)}
        value={new Date(2026, 8, 10)}
      />,
    )

    expect(screen.getAllByTestId(/^picker-item-2-/)).toHaveLength(10)
    expect(within(getItem(2, 0)).getByText('01日')).toBeTruthy()
    expect(within(getItem(2, 9)).getByText('10日')).toBeTruthy()
  })
})

describe('DatePicker', () => {
  it('keeps a draft separate from the external value when cancelled', async () => {
    function Harness() {
      const [visible, setVisible] = useState(false)
      const [value, setValue] = useState(new Date(2026, 0, 31))

      return (
        <Provider theme={{ token: { motion: false } }}>
          <InteractionPressable testID="open-date-picker" onPress={() => setVisible(true)} />
          <Text testID="external-date">{value.toISOString()}</Text>
          <DatePicker
            maxDate={new Date(2026, 11, 31)}
            minDate={new Date(2026, 0, 1)}
            onCancel={() => setVisible(false)}
            onConfirm={(nextValue) => {
              setValue(nextValue)
              setVisible(false)
            }}
            value={value}
            visible={visible}
          />
        </Provider>
      )
    }

    await render(<Harness />)
    const originalValue = screen.getByTestId('external-date').props.children

    await press(screen.getByTestId('open-date-picker'))
    await press(getItem(1, 1))
    await press(screen.getByTestId('picker-cancel'))

    expect(screen.getByTestId('external-date').props.children).toBe(originalValue)
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })

  it('exposes open, close, and confirm through ref', async () => {
    const pickerRef = createRef<DatePickerRef>()
    const onConfirm = jest.fn()

    await render(
      <Provider theme={{ token: { motion: false } }}>
        <DatePicker
          defaultValue={new Date(2026, 0, 1)}
          maxDate={new Date(2026, 11, 31)}
          minDate={new Date(2026, 0, 1)}
          onConfirm={onConfirm}
          ref={pickerRef}
        />
      </Provider>,
    )

    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    await act(async () => pickerRef.current?.open())
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()

    await press(getItem(1, 1))
    await act(async () => pickerRef.current?.confirm())

    expectDate(onConfirm.mock.lastCall?.[0], 2026, 2, 1)
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    await act(async () => pickerRef.current?.open())
    await act(async () => pickerRef.current?.close())
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })
})
