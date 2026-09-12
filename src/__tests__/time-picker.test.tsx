import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { useState } from 'react'
import { Text } from 'react-native'
import { InteractionPressable } from '../interaction'
import { Provider } from '../provider'
import {
  TimePicker,
  type TimePickerColumnType,
  type TimePickerFilter,
  type TimePickerOption,
  type TimePickerValue,
} from '../time-picker'

afterEach(cleanup)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function getItem(columnIndex: number, itemIndex: number) {
  return screen.getByTestId(`picker-item-${columnIndex}-${itemIndex}`)
}

function expectItemText(columnIndex: number, itemIndex: number, text: string) {
  expect(within(getItem(columnIndex, itemIndex)).getByText(text)).toBeTruthy()
}

describe('TimePicker', () => {
  it('renders hour and minute columns with default zero-padded values', async () => {
    await render(<TimePicker showToolbar={false} />)

    expect(screen.getAllByTestId(/^picker-item-0-/)).toHaveLength(24)
    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(60)
    expectItemText(0, 0, '00')
    expectItemText(0, 23, '23')
    expectItemText(1, 0, '00')
    expectItemText(1, 59, '59')
    expect(getItem(0, 0).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(1, 0).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('reports zero-padded values after selecting hour and minute', async () => {
    const onChange = jest.fn()
    await render(<TimePicker onChange={onChange} showToolbar={false} />)

    await press(getItem(0, 9))
    await press(getItem(1, 5))

    expect(onChange).toHaveBeenLastCalledWith(
      ['09', '05'],
      [
        { text: '09', value: '09' },
        { text: '05', value: '05' },
      ],
    )
  })

  it('uses defaultValue for the selected time', async () => {
    await render(<TimePicker defaultValue={['12', '30']} showToolbar={false} />)

    expect(getItem(0, 12).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(1, 30).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('follows a controlled value update', async () => {
    const view = await render(<TimePicker value={['12', '30']} showToolbar={false} />)

    expect(getItem(0, 12).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(1, 30).props.accessibilityState).toMatchObject({ selected: true })

    await view.rerender(<TimePicker value={['18', '45']} showToolbar={false} />)

    expect(getItem(0, 18).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(1, 45).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('supports seconds and arbitrary column order', async () => {
    const view = await render(
      <TimePicker
        columnsType={['minute', 'second']}
        defaultValue={['30', '05']}
        showToolbar={false}
      />,
    )

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(2)
    expect(getItem(0, 30).props.accessibilityState).toMatchObject({ selected: true })
    expect(getItem(1, 5).props.accessibilityState).toMatchObject({ selected: true })

    await view.unmount()
    await render(
      <TimePicker
        columnsType={['hour', 'minute', 'second']}
        defaultValue={['09', '30', '05']}
        showToolbar={false}
      />,
    )

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(3)
    expect(getItem(2, 5).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('applies min and max ranges to each time column', async () => {
    await render(
      <TimePicker maxHour={18} maxMinute={45} minHour={8} minMinute={15} showToolbar={false} />,
    )

    expect(screen.getAllByTestId(/^picker-item-0-/)).toHaveLength(24)
    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(60)
    expectItemText(0, 8, '08')
    expectItemText(0, 18, '18')
    expectItemText(1, 15, '15')
    expectItemText(1, 45, '45')
    expect(getItem(0, 0).props.accessibilityState).toMatchObject({ disabled: true })
    expect(getItem(1, 14).props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('clamps invalid bounds to the supported time range', async () => {
    await render(<TimePicker maxHour={30} minHour={-5} showToolbar={false} />)

    expect(screen.getAllByTestId(/^picker-item-0-/)).toHaveLength(24)
    expectItemText(0, 0, '00')
    expectItemText(0, 23, '23')
  })

  it('keeps one option when a range is reversed', async () => {
    await render(<TimePicker maxMinute={20} minMinute={50} showToolbar={false} />)

    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(60)
    expectItemText(1, 50, '50')
    expect(getItem(1, 50).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('uses filter for stepped minute options and passes resolved previous values', async () => {
    const seenValues: TimePickerValue[] = []
    const filter: TimePickerFilter = (type, options, values) => {
      if (type === 'minute') {
        seenValues.push(values)
        return options.filter((option) => Number(option.value) % 5 === 0)
      }

      return options
    }

    await render(<TimePicker defaultValue={['12', '00']} filter={filter} showToolbar={false} />)

    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(12)
    expectItemText(1, 0, '00')
    expectItemText(1, 11, '55')
    expect(seenValues).toContainEqual(['12'])
  })

  it('recomputes a later column from the already selected previous time', async () => {
    const filter: TimePickerFilter = (type, options, values) => {
      if (type === 'minute' && values[0] === '10') {
        return options.filter((option) => option.value === '30')
      }

      return options
    }

    await render(<TimePicker defaultValue={['09', '30']} filter={filter} showToolbar={false} />)
    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(60)

    await press(getItem(0, 10))

    expect(screen.getAllByTestId(/^picker-item-1-/)).toHaveLength(1)
    expectItemText(1, 0, '30')
    expect(getItem(1, 0).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('formats display text without changing canonical callback values', async () => {
    const onConfirm = jest.fn()
    await render(
      <TimePicker
        defaultValue={['09', '30']}
        formatter={(type, option) => ({
          ...option,
          text: type === 'hour' ? `${option.text} 时` : `${option.text} 分`,
          value: 'display-value',
        })}
        onConfirm={onConfirm}
      />,
    )

    expectItemText(0, 9, '09 时')
    expectItemText(1, 30, '30 分')

    await press(screen.getByTestId('picker-confirm'))

    expect(onConfirm).toHaveBeenCalledWith(
      ['09', '30'],
      [
        { text: '09 时', value: '09' },
        { text: '30 分', value: '30' },
      ],
    )
  })

  it('falls back to the first option when filter removes the requested value', async () => {
    await render(
      <TimePicker
        defaultValue={['10', '03']}
        filter={(type, options) =>
          type === 'minute' ? options.filter((option) => option.value !== '03') : options
        }
        showToolbar={false}
      />,
    )

    expectItemText(1, 0, '00')
    expect(getItem(1, 0).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('keeps a popup draft separate from the committed value on cancel', async () => {
    function Harness() {
      const [visible, setVisible] = useState(false)
      const [value, setValue] = useState<TimePickerValue>(['09', '30'])

      return (
        <Provider theme={{ token: { motion: false } }}>
          <Text testID="external-time">{value.join(':')}</Text>
          <InteractionPressable testID="time-trigger" onPress={() => setVisible(true)} />
          <TimePicker
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
    await press(screen.getByTestId('time-trigger'))
    await press(getItem(1, 45))
    await press(screen.getByTestId('picker-cancel'))

    expect(screen.getByTestId('external-time').props.children).toBe('09:30')

    await press(screen.getByTestId('time-trigger'))
    await press(getItem(1, 45))
    await press(screen.getByTestId('picker-confirm'))

    expect(screen.getByTestId('external-time').props.children).toBe('09:45')
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })

  it('reuses Picker imperative behavior for confirm and cancel', async () => {
    const view = await render(<Provider theme={{ token: { motion: false } }} />)
    let confirmPromise!: ReturnType<typeof TimePicker.open>

    await act(async () => {
      confirmPromise = TimePicker.open({ defaultValue: ['10', '30'] })
    })
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('picker-confirm'))
    })

    await expect(confirmPromise).resolves.toEqual({
      action: 'confirm',
      options: [
        { text: '10', value: '10' },
        { text: '30', value: '30' },
      ],
      values: ['10', '30'],
    })

    let cancelPromise!: ReturnType<typeof TimePicker.open>
    await act(async () => {
      cancelPromise = TimePicker.open({ defaultValue: ['11', '20'] })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.press(screen.getByTestId('picker-cancel'))
    })

    await expect(cancelPromise).resolves.toMatchObject({
      action: 'cancel',
      values: ['11', '20'],
    })

    await view.unmount()
  })

  it('accepts an empty columnsType without restoring the default columns', async () => {
    await render(<TimePicker columnsType={[]} showToolbar={false} />)

    expect(screen.getAllByTestId(/^picker-column-\d+$/)).toHaveLength(1)
    expect(screen.queryByTestId('picker-item-0-0')).toBeNull()
  })

  it('exposes the public type names without a separate visual token surface', () => {
    const columnType: TimePickerColumnType = 'hour'
    const option: TimePickerOption = { text: '00', value: '00' }
    expect(columnType).toBe('hour')
    expect(option).toEqual({ text: '00', value: '00' })
  })
})
