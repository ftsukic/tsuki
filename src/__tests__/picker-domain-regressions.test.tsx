/* eslint-disable testing-library/no-await-sync-events -- React Native Testing Library v14 fireEvent is async. */
import { Fragment, createRef } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { DatePicker } from '../date-picker'
import { DateTimePicker } from '../date-time-picker'
import { Picker } from '../picker'
import { PickerGroup } from '../picker-group'
import type { PickerGroupRef } from '../picker-group'
import { TimePicker } from '../time-picker'
import type { TimePickerRef } from '../time-picker'
import { TsukiProvider } from '../provider'

afterEach(cleanup)

describe('picker domain selections', () => {
  it.each([DatePicker, TimePicker, DateTimePicker])(
    'confirms no values when every option is filtered out in %p',
    async (Component) => {
      const onConfirm = jest.fn()
      await render(<Component filter={() => []} onConfirm={onConfirm} />)
      await fireEvent.press(screen.getByTestId('picker-confirm'))
      await Promise.resolve()
      expect(onConfirm).toHaveBeenCalledWith([], [])
    },
  )

  it('keeps a step-constrained empty selection empty through the public ref', async () => {
    const ref = createRef<TimePickerRef>()
    const onConfirm = jest.fn()
    await render(
      <TimePicker
        ref={ref}
        columnsType={['minute']}
        defaultValue={['02']}
        minMinute={1}
        maxMinute={4}
        minuteStep={5}
        onConfirm={onConfirm}
      />,
    )
    expect(ref.current?.getSelectedValues()).toEqual([])
    let selection: ReturnType<TimePickerRef['confirm']> | undefined
    await act(async () => {
      selection = ref.current?.confirm()
    })
    expect(selection).toEqual({ values: [], options: [], indexes: [-1] })
    expect(onConfirm).toHaveBeenCalledWith([], [])
  })

  it.each([false, true])(
    'preserves minute values after an empty hour, controlled=%s',
    async (controlled) => {
      const ref = createRef<TimePickerRef>()
      const onChange = jest.fn()
      const onConfirm = jest.fn()
      await render(
        <TsukiProvider theme={{ seed: { motion: false } }}>
          <TimePicker
            ref={ref}
            {...(controlled ? { value: ['10', '30'] } : { defaultValue: ['10', '30'] })}
            filter={(type, options) => (type === 'hour' ? [] : options)}
            onChange={onChange}
            onConfirm={onConfirm}
          />
        </TsukiProvider>,
      )
      expect(ref.current?.getSelectedValues()).toEqual(['30'])
      expect(ref.current?.getSelectedOptions()).toEqual([{ text: '30', value: 30 }])
      await fireEvent.press(screen.getByTestId('picker-item-1-31'))
      await Promise.resolve()
      expect(onChange).toHaveBeenLastCalledWith(['31'], [{ text: '31', value: 31 }])
      expect(ref.current?.getSelectedValues()).toEqual([controlled ? '30' : '31'])
      await fireEvent.press(screen.getByTestId('picker-confirm'))
      await Promise.resolve()
      expect(onConfirm).toHaveBeenLastCalledWith(
        [controlled ? '30' : '31'],
        [{ text: controlled ? '30' : '31', value: controlled ? 30 : 31 }],
      )
    },
  )

  it('formats a remaining year correctly after reordered empty date columns', async () => {
    const onConfirm = jest.fn()
    await render(
      <DatePicker
        columnsType={['month', 'year', 'day']}
        defaultValue={['10', '2026', '12']}
        filter={(type, options) => (type === 'month' ? [] : options)}
        formatter={(_, option) => `label:${option.text}`}
        onConfirm={onConfirm}
      />,
    )
    await fireEvent.press(screen.getByTestId('picker-confirm'))
    await Promise.resolve()
    expect(onConfirm).toHaveBeenCalledWith(
      ['2026', '12'],
      [
        { text: 'label:2026', value: 2026 },
        { text: 'label:12', value: 12 },
      ],
    )
  })

  it('restores the requested time when a filtered hour becomes available again', async () => {
    const ref = createRef<TimePickerRef>()
    const view = await render(
      <TimePicker
        ref={ref}
        defaultValue={['10', '30']}
        filter={(type, options) => (type === 'hour' ? [] : options)}
      />,
    )
    expect(ref.current?.getSelectedValues()).toEqual(['30'])
    await view.rerender(<TimePicker ref={ref} defaultValue={['10', '30']} />)
    expect(ref.current?.getSelectedValues()).toEqual(['10', '30'])
  })

  it.each([null, undefined, false])('preserves a conditional pane for %s', async (empty) => {
    const ref = createRef<PickerGroupRef>()
    const onConfirm = jest.fn()
    await render(
      <PickerGroup ref={ref} tabs={['日期', '时间']} onConfirm={onConfirm}>
        <Fragment>
          {empty}
          <Picker columns={[[{ text: 'time', value: 'time' }]]} />
        </Fragment>
      </PickerGroup>,
    )
    expect(ref.current?.getSelectedValues()).toEqual([[], ['time']])
    await fireEvent.press(screen.getByTestId('picker-confirm'))
    await Promise.resolve()
    expect(onConfirm).toHaveBeenCalledWith([
      { values: [], options: [], indexes: [] },
      { values: ['time'], options: [{ text: 'time', value: 'time' }], indexes: [0] },
    ])
  })
})
