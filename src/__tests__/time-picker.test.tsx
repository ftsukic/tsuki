import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createRef, useState, type Ref } from 'react'
import { Text } from 'react-native'
import { TimePicker } from '../time-picker'
import type {
  TimePickerFilter,
  TimePickerProps,
  TimePickerRef,
  TimePickerValue,
} from '../time-picker'
import { Provider } from '../provider'

afterEach(cleanup)

async function press(testID: string) {
  fireEvent.press(screen.getByTestId(testID))
  await Promise.resolve()
}

async function renderPicker(props: TimePickerProps & { ref?: Ref<TimePickerRef> }) {
  return render(
    <Provider theme={{ token: { motion: false } }}>
      <TimePicker {...props} />
    </Provider>,
  )
}

describe('TimePicker', () => {
  it('uses hour and minute by default and supports seconds', async () => {
    await renderPicker({ defaultValue: ['21', '30'] })
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(2)
    expect(screen.getByTestId('picker-item-0-21').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-1-30').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('opts into seconds', async () => {
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <TimePicker columnsType={['hour', 'minute', 'second']} defaultValue={['21', '30', '15']} />
      </Provider>,
    )
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(screen.getByTestId('picker-item-2-15').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('supports subset and reordered columns with matching values', async () => {
    await renderPicker({
      columnsType: ['minute', 'hour'],
      defaultValue: ['30', '21'],
    })
    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(2)
    expect(screen.getByTestId('picker-item-0-30').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-1-21').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('supports a fully reordered seconds layout', async () => {
    await renderPicker({
      columnsType: ['second', 'minute', 'hour'],
      defaultValue: ['15', '30', '21'],
    })

    expect(screen.getByTestId('picker-item-0-15').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-1-30').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('picker-item-2-21').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('applies independent hour, minute, and second ranges', async () => {
    await renderPicker({
      defaultValue: ['12', '35', '20'],
      maxHour: 20,
      maxMinute: 40,
      maxSecond: 30,
      minHour: 10,
      minMinute: 30,
      minSecond: 10,
      columnsType: ['hour', 'minute', 'second'],
    })
    expect(screen.getAllByTestId(/^picker-item-0-\d+$/)).toHaveLength(11)
    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(11)
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(21)
  })

  it('cascades minTime and maxTime across columns', async () => {
    const onChange = jest.fn()
    await renderPicker({
      columnsType: ['hour', 'minute', 'second'],
      defaultValue: ['08', '30', '00'],
      maxTime: '18:20:30',
      minTime: '08:30:10',
      onChange,
    })
    expect(screen.getAllByTestId(/^picker-item-0-\d+$/)).toHaveLength(11)
    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(30)

    await press('picker-item-0-10')
    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(21)
    expect(screen.getAllByTestId(/^picker-item-2-\d+$/)).toHaveLength(31)
    expect(onChange).toHaveBeenLastCalledWith(['18', '20', '10'], expect.any(Array))
  })

  it('keeps formatter display-only and passes full values to filter', async () => {
    const filterCalls: unknown[][] = []
    const filter: TimePickerFilter = (type, options, values) => {
      filterCalls.push([type, values])
      return type === 'minute'
        ? [
            ...options.filter((option) => Number(option.value) % 10 === 0),
            { text: '非法', value: 999 },
          ]
        : options
    }
    const onChange = jest.fn()
    await renderPicker({
      columnsType: ['minute', 'hour'],
      defaultValue: ['30', '12'],
      filter,
      formatter: (type, option) => ({
        ...option,
        text: `${type}:${option.text}`,
        value: 999,
      }),
      onChange,
    })
    expect(screen.getByText('minute:30')).toBeTruthy()
    expect(screen.getByText('hour:12')).toBeTruthy()
    expect(screen.queryByText('非法')).toBeNull()
    expect(
      filterCalls.some(
        (call) => call[0] === 'minute' && Array.isArray(call[1]) && call[1][1] === '12',
      ),
    ).toBe(true)

    await press('picker-item-0-4')
    expect(onChange).toHaveBeenLastCalledWith(['40', '12'], expect.any(Array))
  })

  it('aligns step options with ranges and repairs invalid values', async () => {
    const ref = createRef<TimePickerRef>()
    await renderPicker({
      defaultValue: ['10', '07'],
      maxMinute: 57,
      minMinute: 7,
      minuteStep: 5,
      ref,
    })
    expect(screen.getAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(10)
    expect(screen.getByTestId('picker-item-1-0').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(ref.current?.getSelectedValues()).toEqual(['10', '10'])
  })

  it('normalizes reordered values against complete time bounds', async () => {
    const ref = createRef<TimePickerRef>()
    await renderPicker({
      columnsType: ['minute', 'hour'],
      defaultValue: ['10', '07'],
      maxTime: '18:20:00',
      minTime: '08:30:00',
      ref,
    })

    expect(ref.current?.getSelectedValues()).toEqual(['30', '08'])
    let selection: ReturnType<TimePickerRef['confirm']> | undefined
    await act(async () => {
      selection = ref.current?.confirm()
    })
    expect(selection?.values).toEqual(['30', '08'])
  })

  it('does not create options outside static ranges when columns are reordered', async () => {
    const ref = createRef<TimePickerRef>()
    await renderPicker({
      columnsType: ['minute', 'hour'],
      defaultValue: ['59', '07'],
      maxHour: 18,
      maxMinute: 20,
      minHour: 8,
      minMinute: 10,
      ref,
    })

    expect(ref.current?.getSelectedValues()).toEqual(['20', '08'])
  })

  it('keeps complete time bounds semantic when columns are reordered', async () => {
    const onChange = jest.fn()
    await renderPicker({
      columnsType: ['minute', 'hour'],
      defaultValue: ['20', '18'],
      maxTime: '18:20:30',
      minTime: '08:30:10',
      onChange,
    })

    await press('picker-item-1-9')

    expect(onChange).toHaveBeenLastCalledWith(['20', '17'], expect.any(Array))
    expect(screen.getAllByTestId(/^picker-item-0-\d+$/u)).toHaveLength(60)
  })

  it('leaves a step-constrained column empty when no aligned option exists', async () => {
    await renderPicker({
      defaultValue: ['12', '58'],
      maxMinute: 59,
      minMinute: 58,
      minuteStep: 5,
    })

    expect(screen.queryAllByTestId(/^picker-item-1-\d+$/)).toHaveLength(0)
  })

  it('supports controlled/defaultValue modes and confirm/cancel', async () => {
    function Controlled() {
      const [value, setValue] = useState<TimePickerValue>(['12', '30'])
      return (
        <>
          <TimePicker value={value} onChange={setValue} />
          <Text testID="controlled-time">{value.join(':')}</Text>
        </>
      )
    }
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <Controlled />
      </Provider>,
    )
    await press('picker-item-1-31')
    expect(screen.getByTestId('controlled-time').props.children).toBe('12:31')
  })

  it('supports confirm and cancel callbacks', async () => {
    const ref = createRef<TimePickerRef>()
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    await renderPicker({
      defaultValue: ['12', '30'],
      onCancel,
      onConfirm,
      ref,
    })
    await press('picker-item-1-31')
    await press('picker-confirm')
    expect(onConfirm).toHaveBeenCalledWith(['12', '31'], expect.any(Array))
    let selection: ReturnType<TimePickerRef['confirm']> | undefined
    await act(async () => {
      selection = ref.current?.confirm()
    })
    expect(selection?.values).toEqual(['12', '31'])
    await press('picker-cancel')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
