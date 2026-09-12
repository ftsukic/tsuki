import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef } from 'react'
import { StyleSheet } from 'react-native'
import { Provider } from '../provider'
import {
  areDateRangesEqual,
  normalizeDateRangePickerBounds,
  normalizeDateRangePickerValue,
} from '../date-range-picker/utils'
import {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangePickerRef,
  type DateRangePickerValue,
} from '../date-range-picker'

afterEach(cleanup)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function date(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

function range(start: Date, end: Date): DateRangePickerValue {
  return [start, end]
}

function getItem(columnIndex: number, itemIndex: number) {
  return screen.getByTestId(`picker-item-${columnIndex}-${itemIndex}`)
}

function getVisibleRangePicker(props: Omit<DateRangePickerProps, 'visible'>) {
  return (
    <Provider theme={{ token: { motion: false } }}>
      <DateRangePicker {...props} visible />
    </Provider>
  )
}

function expectDate(value: Date, year: number, month: number, day: number) {
  expect([value.getFullYear(), value.getMonth() + 1, value.getDate()]).toEqual([year, month, day])
}

describe('date-range-picker.utils', () => {
  it('keeps the start date as the anchor for invalid ranges and clamps bounds', () => {
    const bounds = normalizeDateRangePickerBounds(date(2026, 1, 10), date(2026, 12, 20))
    const normalized = normalizeDateRangePickerValue(
      range(date(2026, 9, 20), date(2026, 9, 10)),
      bounds,
    )

    expectDate(normalized[0], 2026, 9, 20)
    expectDate(normalized[1], 2026, 9, 20)
    expect(
      normalizeDateRangePickerValue(range(date(2025, 1, 1), date(2027, 1, 1)), bounds),
    ).toEqual(range(date(2026, 1, 10), date(2026, 12, 20)))
    expect(
      normalizeDateRangePickerValue(
        range(new Date(Number.NaN), new Date(Number.NaN)),
        bounds,
        date(2026, 9, 15),
      ),
    ).toEqual(range(date(2026, 9, 15), date(2026, 9, 15)))
    expect(areDateRangesEqual(normalized, range(date(2026, 9, 20), date(2026, 9, 20)))).toBe(true)
  })

  it('uses a singleton range when minDate is after maxDate', () => {
    const bounds = normalizeDateRangePickerBounds(date(2026, 12, 20), date(2026, 1, 10))

    expectDate(bounds.minDate, 2026, 1, 10)
    expectDate(bounds.maxDate, 2026, 1, 10)
  })
})

describe('DateRangePicker', () => {
  const bounds = {
    maxDate: date(2027, 12, 31),
    minDate: date(2026, 1, 1),
  }

  it('renders one linked year/month/day set with Xiaoshu-style endpoint values', async () => {
    await render(
      getVisibleRangePicker({
        ...bounds,
        value: range(date(2026, 9, 10), date(2026, 9, 20)),
      }),
    )

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(screen.getByTestId('date-range-picker-start-value').props.children).toBe('2026-09-10')
    expect(screen.getByTestId('date-range-picker-end-value').props.children).toBe('2026-09-20')
    expect(
      StyleSheet.flatten(screen.getByTestId('date-range-picker-start-value').props.style),
    ).toMatchObject({
      color: expect.any(String),
      fontWeight: '600',
    })
  })

  it('switches the active endpoint without changing the range', async () => {
    const onChange = jest.fn()
    await render(
      getVisibleRangePicker({
        ...bounds,
        onChange,
        value: range(date(2026, 9, 10), date(2026, 9, 20)),
      }),
    )

    expect(getItem(2, 9).props.accessibilityState).toMatchObject({ selected: true })
    await press(screen.getByTestId('date-range-picker-end'))

    expect(getItem(2, 10).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(2, 9).props.accessibilityState).toMatchObject({ selected: false })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('limits start to the current end and end to the current start', async () => {
    await render(
      getVisibleRangePicker({
        ...bounds,
        value: range(date(2026, 9, 10), date(2026, 9, 20)),
      }),
    )
    expect(screen.queryByTestId('picker-item-2-20')).toBeNull()

    await press(screen.getByTestId('date-range-picker-end'))
    expect(screen.queryByText('09日')).toBeNull()
    expect(screen.getByText('10日')).toBeTruthy()
  })

  it('updates only the active endpoint', async () => {
    const onChange = jest.fn()
    await render(
      getVisibleRangePicker({
        ...bounds,
        onChange,
        value: range(date(2026, 9, 10), date(2026, 9, 20)),
      }),
    )

    await press(getItem(2, 4))
    expect(onChange).toHaveBeenLastCalledWith(range(date(2026, 9, 5), date(2026, 9, 20)))

    await press(screen.getByTestId('date-range-picker-end'))
    await press(getItem(2, 11))
    expect(onChange).toHaveBeenLastCalledWith(range(date(2026, 9, 5), date(2026, 9, 16)))
  })

  it('repairs cross-month and cross-year dynamic day columns', async () => {
    const monthChange = jest.fn()
    await render(
      getVisibleRangePicker({
        maxDate: date(2026, 12, 31),
        minDate: date(2026, 1, 1),
        onChange: monthChange,
        value: range(date(2026, 1, 31), date(2026, 2, 28)),
      }),
    )
    await press(getItem(1, 1))
    expect(monthChange.mock.lastCall?.[0]).toEqual(range(date(2026, 2, 28), date(2026, 2, 28)))
    expect(getItem(2, 27).props.accessibilityState).toMatchObject({ selected: true })

    const yearChange = jest.fn()
    await cleanup()
    await render(
      getVisibleRangePicker({
        maxDate: date(2027, 12, 31),
        minDate: date(2026, 1, 1),
        onChange: yearChange,
        value: range(date(2026, 12, 31), date(2027, 1, 2)),
      }),
    )
    await press(getItem(0, 1))
    expect(yearChange.mock.lastCall?.[0]).toEqual(range(date(2027, 1, 2), date(2027, 1, 2)))
  })

  it('keeps leap-year February 29 selectable', async () => {
    await render(
      getVisibleRangePicker({
        maxDate: date(2028, 12, 31),
        minDate: date(2028, 1, 1),
        value: range(date(2028, 2, 29), date(2028, 3, 1)),
      }),
    )

    expect(screen.getAllByTestId(/^picker-item-2-/)).toHaveLength(29)
    expect(getItem(2, 28).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('rolls draft changes back on cancel and commits the complete tuple on confirm', async () => {
    const ref = createRef<DateRangePickerRef>()
    const onConfirm = jest.fn()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <DateRangePicker
          {...bounds}
          defaultValue={range(date(2026, 9, 10), date(2026, 9, 20))}
          onConfirm={onConfirm}
          ref={ref}
        />
      </Provider>,
    )

    await act(async () => ref.current?.open())
    await press(getItem(2, 4))
    await press(screen.getByTestId('picker-cancel'))
    await act(async () => ref.current?.open())
    expect(screen.getByTestId('date-range-picker-start-value').props.children).toBe('2026-09-10')

    await press(screen.getByTestId('date-range-picker-end'))
    await press(getItem(2, 12))
    await press(screen.getByTestId('picker-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenLastCalledWith(range(date(2026, 9, 10), date(2026, 9, 22)))
  })

  it('synchronizes both endpoints when controlled value changes', async () => {
    const first = range(date(2026, 9, 10), date(2026, 9, 20))
    const second = range(date(2027, 3, 5), date(2027, 4, 6))
    const view = await render(getVisibleRangePicker({ ...bounds, value: first }))

    await view.rerender(getVisibleRangePicker({ ...bounds, value: second }))
    expect(screen.getByTestId('date-range-picker-start-value').props.children).toBe('2027-03-05')
    expect(screen.getByTestId('date-range-picker-end-value').props.children).toBe('2027-04-06')
    expect(getItem(0, 1).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('clamps both endpoints to global minDate and maxDate', async () => {
    await render(
      getVisibleRangePicker({
        maxDate: date(2026, 12, 20),
        minDate: date(2026, 1, 10),
        value: range(date(2025, 12, 31), date(2027, 1, 1)),
      }),
    )

    expect(screen.getByTestId('date-range-picker-start-value').props.children).toBe('2026-01-10')
    expect(screen.getByTestId('date-range-picker-end-value').props.children).toBe('2026-12-20')
  })

  it('supports ref open, close, and confirm', async () => {
    const ref = createRef<DateRangePickerRef>()
    const onConfirm = jest.fn()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <DateRangePicker
          {...bounds}
          defaultValue={range(date(2026, 9, 10), date(2026, 9, 20))}
          onConfirm={onConfirm}
          ref={ref}
        />
      </Provider>,
    )

    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    await act(async () => ref.current?.open())
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()
    await act(async () => ref.current?.confirm())
    expect(onConfirm).toHaveBeenCalledWith(range(date(2026, 9, 10), date(2026, 9, 20)))
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    await act(async () => ref.current?.open())
    await act(async () => ref.current?.close())
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })
})
