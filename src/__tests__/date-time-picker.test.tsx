import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState, type Ref } from 'react'
import { Text } from 'react-native'
import { DateTimePicker } from '../date-time-picker'
import { validateDateTimeColumnOrder } from '../picker/date-time/normalize'
import type {
  DateTimePickerFilter,
  DateTimePickerColumnType,
  DateTimePickerProps,
  DateTimePickerRef,
  DateTimePickerValue,
} from '../date-time-picker'
import { Provider } from '../provider'

afterEach(cleanup)

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

async function renderPicker(props: DateTimePickerProps & { ref?: Ref<DateTimePickerRef> }) {
  return render(
    <Provider theme={{ token: { motion: false } }}>
      <DateTimePicker {...props} />
    </Provider>,
  )
}

describe('DateTimePicker', () => {
  it('uses five date-time columns by default and opts into seconds', async () => {
    await renderPicker({
      defaultValue: ['2026', '09', '13', '21', '30'],
    })
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(5)
    expect(screen.getByTestId('picker-item-0-10').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-3-21').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('opts into seconds', async () => {
    await renderPicker({
      columnsType: ['year', 'month', 'day', 'hour', 'minute', 'second'],
      defaultValue: ['2026', '09', '13', '21', '30', '15'],
    })
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(6)
    expect(screen.getByTestId('picker-item-5-15').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('supports natural-order subsets without reordering fields', async () => {
    await renderPicker({
      columnsType: ['year', 'day', 'minute'],
      defaultValue: ['2026', '13', '30'],
    })
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(screen.getByTestId('picker-item-0-10').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-1-12').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-2-30').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it.each([
    ['year', 'month', 'day', 'hour'],
    ['month', 'day', 'hour', 'minute'],
    ['hour', 'minute'],
    ['year', 'day', 'minute'],
  ] as const)('accepts natural-order subset %s', async (...columnsType) => {
    const valuesByType: Record<DateTimePickerColumnType, string> = {
      day: '13',
      hour: '21',
      minute: '30',
      month: '09',
      second: '15',
      year: '2026',
    }
    const ref = createRef<DateTimePickerRef>()
    await renderPicker({
      columnsType,
      defaultValue: columnsType.map((type) => valuesByType[type]),
      ref,
    })
    expect(ref.current?.getSelectedValues()).toEqual(columnsType.map((type) => valuesByType[type]))
  })

  it.each([
    ['month', 'year'],
    ['hour', 'day'],
    ['minute', 'day', 'year'],
    ['second', 'hour'],
  ])('throws for invalid column order: %s', (...columnsType) => {
    expect(() => validateDateTimeColumnOrder(columnsType)).toThrow(
      'DateTimePicker: columnsType must follow year -> month -> day -> hour -> minute -> second',
    )
  })

  it('cascades complete minDate and maxDate timestamp constraints', async () => {
    await renderPicker({
      columnsType: ['year', 'month', 'day', 'hour', 'minute', 'second'],
      defaultValue: ['2026', '09', '13', '10', '20', '30'],
      maxDate: new Date(2026, 8, 13, 12, 40, 0),
      minDate: new Date(2026, 8, 13, 10, 20, 30),
    })
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(1)
    expect(screen.getAllByTestId(/^picker-item-3-\d+$/)).toHaveLength(3)
    expect(screen.getAllByTestId(/^picker-item-4-\d+$/)).toHaveLength(40)
    expect(screen.getAllByTestId(/^picker-item-5-\d+$/)).toHaveLength(30)

    await press('picker-item-3-2')
    expect(screen.getAllByTestId(/^picker-item-4-\d+$/)).toHaveLength(41)
    await press('picker-item-4-40')
    expect(screen.getAllByTestId(/^picker-item-5-\d+$/)).toHaveLength(1)
  })

  it('handles leap years and invalid day values', async () => {
    const ref = createRef<DateTimePickerRef>()
    const view = await renderPicker({
      columnsType: ['year', 'month', 'day'],
      defaultValue: ['2028', '02', '29'],
      ref,
    })
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(29)

    await view.rerender(
      <Provider theme={{ token: { motion: false } }}>
        <DateTimePicker
          columnsType={['year', 'month', 'day']}
          value={['2027', '02', '31']}
          ref={ref}
        />
      </Provider>,
    )
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(28)
    expect(ref.current?.getSelectedValues()).toEqual(['2027', '02', '28'])
  })

  it('reuses time step normalization inside the combined picker', async () => {
    const ref = createRef<DateTimePickerRef>()
    await renderPicker({
      columnsType: ['year', 'month', 'day', 'hour', 'minute'],
      defaultValue: ['2026', '09', '13', '10', '07'],
      maxDate: new Date(2026, 8, 13, 12, 57),
      minDate: new Date(2026, 8, 13, 10, 7),
      minuteStep: 5,
      ref,
    })
    expect(screen.getAllByTestId(/^picker-item-4-\d+$/)).toHaveLength(10)
    expect(ref.current?.getSelectedValues()).toEqual(['2026', '09', '13', '10', '10'])
  })

  it('leaves a timestamp step boundary empty when no aligned option exists', async () => {
    await renderPicker({
      columnsType: ['year', 'month', 'day', 'hour', 'minute'],
      defaultValue: ['2026', '09', '13', '10', '58'],
      maxDate: new Date(2026, 8, 13, 10, 59),
      minDate: new Date(2026, 8, 13, 10, 58),
      minuteStep: 5,
    })

    expect(screen.queryAllByTestId(/^picker-item-4-\d+$/)).toHaveLength(0)
  })

  it('keeps formatter display-only and passes full values to filter', async () => {
    const filterCalls: unknown[][] = []
    const filter: DateTimePickerFilter = (type, options, values) => {
      filterCalls.push([type, values])
      return type === 'hour'
        ? options.filter((option) => Number(option.value) >= 8 && Number(option.value) <= 18)
        : options
    }
    const onChange = jest.fn()
    await renderPicker({
      defaultValue: ['2026', '09', '13', '12', '30'],
      filter,
      formatter: (type, option) => ({
        ...option,
        text: `${type}:${option.text}`,
        value: 999,
      }),
      onChange,
    })
    expect(screen.getByText('year:2026')).toBeTruthy()
    expect(screen.getByText('hour:12')).toBeTruthy()
    expect(
      filterCalls.some(
        (call) => call[0] === 'hour' && Array.isArray(call[1]) && call[1][0] === '2026',
      ),
    ).toBe(true)

    await press('picker-item-3-5')
    expect(onChange).toHaveBeenLastCalledWith(['2026', '09', '13', '13', '30'], expect.any(Array))
  })

  it('supports controlled/defaultValue modes and confirm/cancel text', async () => {
    function Controlled() {
      const [value, setValue] = useState<DateTimePickerValue>(['2026', '09', '13', '12', '30'])
      return (
        <>
          <DateTimePicker value={value} onChange={setValue} />
          <Text testID="controlled-date-time">{value.join(' ')}</Text>
        </>
      )
    }
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <Controlled />
      </Provider>,
    )
    await press('picker-item-3-13')
    expect(screen.getByTestId('controlled-date-time').props.children).toBe('2026 09 13 13 30')
  })

  it('forwards confirm/cancel callbacks and custom button text', async () => {
    const ref = createRef<DateTimePickerRef>()
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    await renderPicker({
      cancelButtonText: '放弃',
      confirmButtonText: '保存',
      defaultValue: ['2026', '09', '13', '12', '30'],
      onCancel,
      onConfirm,
      ref,
    })
    expect(screen.getByText('保存')).toBeTruthy()
    expect(screen.getByText('放弃')).toBeTruthy()
    await press('picker-item-3-13')
    await press('picker-confirm')
    expect(onConfirm).toHaveBeenCalledWith(['2026', '09', '13', '13', '30'], expect.any(Array))
    let selection: ReturnType<DateTimePickerRef['confirm']> | undefined
    await act(async () => {
      selection = ref.current?.confirm()
    })
    expect(selection?.values).toEqual(['2026', '09', '13', '13', '30'])
    await press('picker-cancel')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not leak extension props to Picker view props', async () => {
    await renderPicker({
      cancelButtonText: '放弃',
      confirmButtonText: '保存',
      hourStep: 2,
      minuteStep: 5,
    })
    const picker = screen.getByTestId('picker')
    expect(picker.props.cancelButtonText).toBeUndefined()
    expect(picker.props.confirmButtonText).toBeUndefined()
    expect(picker.props.hourStep).toBeUndefined()
    expect(picker.props.minuteStep).toBeUndefined()
  })
})
