import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState, type Ref } from 'react'
import { Text } from 'react-native'
import { DatePicker } from '../date-picker'
import type {
  DatePickerFilter,
  DatePickerProps,
  DatePickerRef,
  DatePickerValue,
} from '../date-picker'
import { Provider } from '../provider'

afterEach(cleanup)

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

function item(column: number, index: number) {
  return screen.getByTestId(`picker-item-${column}-${index}`)
}

async function renderPicker(props: DatePickerProps & { ref?: Ref<DatePickerRef> }) {
  return render(
    <Provider theme={{ token: { motion: false } }}>
      <DatePicker {...props} />
    </Provider>,
  )
}

describe('DatePicker', () => {
  it('uses year, month, and day by default', async () => {
    await renderPicker({ value: ['2026', '09', '13'] })

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(item(0, 10).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(1, 8).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(2, 12).props.accessibilityState).toMatchObject({ selected: true })
    expect(screen.getByText('2026')).toBeTruthy()
  })

  it('supports subsets and preserves value order for reordered columns', async () => {
    await renderPicker({
      columnsType: ['month', 'day', 'year'],
      value: ['09', '13', '2026'],
    })

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(item(0, 8).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(1, 12).props.accessibilityState).toMatchObject({ selected: true })
    expect(item(2, 10).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('normalizes values against minDate and maxDate dependencies', async () => {
    const onChange = jest.fn()
    await renderPicker({
      maxDate: new Date(2027, 2, 20),
      minDate: new Date(2026, 8, 10),
      onChange,
      defaultValue: ['2026', '09', '25'],
    })

    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(4)
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(21)

    await press('picker-item-0-1')
    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(3)
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(20)
    expect(onChange).toHaveBeenLastCalledWith(['2027', '03', '20'], expect.any(Array))
  })

  it('handles leap years and month lengths', async () => {
    const ref = createRef<DatePickerRef>()
    const view = await renderPicker({
      ref,
      value: ['2028', '02', '29'],
    })
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(29)

    await view.rerender(
      <Provider theme={{ token: { motion: false } }}>
        <DatePicker ref={ref} value={['2027', '02', '31']} />
      </Provider>,
    )
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(28)
    expect(ref.current?.getSelectedValues()).toEqual(['2027', '02', '28'])

    await view.rerender(
      <Provider theme={{ token: { motion: false } }}>
        <DatePicker value={['2026', '04', '31']} />
      </Provider>,
    )
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(30)
  })

  it('uses the first valid option for an invalid selected value', async () => {
    const ref = createRef<DatePickerRef>()
    await renderPicker({ ref, value: ['2026', '02', '31'] })

    expect(ref.current?.getSelectedValues()).toEqual(['2026', '02', '28'])
  })

  it('normalizes reordered values against complete minDate and maxDate bounds', async () => {
    const ref = createRef<DatePickerRef>()
    const view = await renderPicker({
      columnsType: ['month', 'year', 'day'],
      minDate: new Date(2026, 8, 10),
      maxDate: new Date(2027, 2, 20),
      ref,
      value: ['01', '2025', '01'],
    })

    expect(ref.current?.getSelectedValues()).toEqual(['09', '2026', '10'])

    await view.rerender(
      <Provider theme={{ token: { motion: false } }}>
        <DatePicker
          columnsType={['month', 'year', 'day']}
          maxDate={new Date(2027, 2, 20)}
          minDate={new Date(2026, 8, 10)}
          ref={ref}
          value={['04', '2028', '01']}
        />
      </Provider>,
    )
    expect(ref.current?.getSelectedValues()).toEqual(['03', '2027', '20'])
  })

  it('keeps reordered columns semantically linked when a bound changes', async () => {
    const onChange = jest.fn()
    await renderPicker({
      columnsType: ['month', 'year', 'day'],
      defaultValue: ['09', '2026', '25'],
      maxDate: new Date(2027, 2, 20),
      minDate: new Date(2026, 8, 10),
      onChange,
    })

    await press('picker-item-1-1')

    expect(onChange).toHaveBeenLastCalledWith(['03', '2027', '20'], expect.any(Array))
    expect(screen.getAllByTestId(/^picker-item-0-\d+$/u)).toHaveLength(3)
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/u)).toHaveLength(20)
  })

  it('keeps formatter display-only and passes filtered selected values', async () => {
    const filterCalls: unknown[][] = []
    const filter: DatePickerFilter = (type, options, values) => {
      filterCalls.push([type, options, values])
      return type === 'month'
        ? [
            ...options.filter((option) => Number(option.value) % 2 === 0),
            { text: '非法', value: 999 },
          ]
        : options
    }
    const onChange = jest.fn()
    await renderPicker({
      columnsType: ['day', 'month', 'year'],
      filter,
      formatter: (type, option) => ({
        ...option,
        text: `${type}:${option.text}`,
        value: 999,
      }),
      onChange,
      value: ['13', '09', '2026'],
    })

    expect(screen.getByText('year:2026')).toBeTruthy()
    expect(screen.getByText('month:08')).toBeTruthy()
    expect(screen.queryByText('非法')).toBeNull()
    expect(
      filterCalls.some(
        (call) => call[0] === 'month' && Array.isArray(call[2]) && call[2][2] === '2026',
      ),
    ).toBe(true)

    await press('picker-item-0-13')
    expect(onChange).toHaveBeenLastCalledWith(['14', '08', '2026'], expect.any(Array))
  })

  it('supports controlled and defaultValue modes', async () => {
    function Controlled() {
      const [value, setValue] = useState<DatePickerValue>(['2026', '09', '13'])
      return (
        <>
          <DatePicker value={value} onChange={setValue} />
          <Text testID="controlled-date">{value.join('-')}</Text>
        </>
      )
    }

    await render(
      <Provider theme={{ token: { motion: false } }}>
        <Controlled />
      </Provider>,
    )
    await press('picker-item-2-13')
    expect(screen.getByTestId('controlled-date').props.children).toBe('2026-09-14')
  })

  it('supports defaultValue through the public ref', async () => {
    const ref = createRef<DatePickerRef>()
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <DatePicker defaultValue={['2025', '01', '02']} ref={ref} />
      </Provider>,
    )
    expect(ref.current?.getSelectedValues()).toEqual(['2025', '01', '02'])
  })

  it('forwards confirm and cancel with selected values and options', async () => {
    const ref = createRef<DatePickerRef>()
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    await renderPicker({
      defaultValue: ['2026', '09', '13'],
      onCancel,
      onConfirm,
      ref,
    })

    await press('picker-item-2-13')
    await press('picker-confirm')
    expect(onConfirm).toHaveBeenCalledWith(['2026', '09', '14'], expect.any(Array))
    let selection: ReturnType<DatePickerRef['confirm']> | undefined
    await act(async () => {
      selection = ref.current?.confirm()
    })
    expect(selection?.values).toEqual(['2026', '09', '14'])
    expect(ref.current?.getSelectedValues()).toEqual(['2026', '09', '14'])
    await press('picker-cancel')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
