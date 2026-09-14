import { Fragment, createRef, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { DatePicker } from '../date-picker'
import { DateTimePicker } from '../date-time-picker'
import { Picker } from '../picker'
import { PickerGroup } from '../picker-group'
import { TimePicker } from '../time-picker'
import type { PickerGroupRef } from '../picker-group'

import * as Reanimated from 'react-native-reanimated'

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

const columns = (value: string) => [[{ text: value, value }]]
const selectableColumns = (first: string, second: string) => [
  [
    { text: first, value: first },
    { text: second, value: second },
  ],
]

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('PickerGroup', () => {
  it('owns one toolbar and keeps all panes mounted', async () => {
    const mounts = jest.fn()
    const unmounts = jest.fn()
    function Child({ value }: { value: string }) {
      useEffect(() => {
        mounts(value)
        return () => unmounts(value)
      }, [value])
      return <Picker testID={`picker-${value}`} columns={columns(value)} />
    }

    await render(
      <PickerGroup tabs={['日期', '时间']}>
        <Fragment>
          <Child value="date" />
          <Child value="time" />
        </Fragment>
      </PickerGroup>,
    )

    expect(screen.getAllByTestId('picker-toolbar')).toHaveLength(1)
    expect(screen.queryAllByTestId('picker-date')).toHaveLength(1)
    expect(screen.queryAllByTestId('picker-time')).toHaveLength(1)
    expect(mounts).toHaveBeenCalledWith('date')
    expect(mounts).toHaveBeenCalledWith('time')
    await press(screen.getAllByRole('tab')[1])
    await press(screen.getAllByRole('tab')[0])
    expect(unmounts).not.toHaveBeenCalled()
  })

  it('confirms every picker directly when nextStepText is absent', async () => {
    const firstConfirm = jest.fn()
    const secondConfirm = jest.fn()
    const groupConfirm = jest.fn()
    await render(
      <PickerGroup tabs={['一', '二']} onConfirm={groupConfirm}>
        <Picker columns={columns('one')} onConfirm={firstConfirm} />
        <Picker columns={columns('two')} onConfirm={secondConfirm} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))
    expect(firstConfirm).toHaveBeenCalledTimes(1)
    expect(secondConfirm).toHaveBeenCalledTimes(1)
    expect(groupConfirm).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('picker-group-tabs').props.children).toBeTruthy()
  })

  it('uses nextStepText only until the last tab', async () => {
    const groupConfirm = jest.fn()
    const firstConfirm = jest.fn()
    const secondConfirm = jest.fn()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })
    await render(
      <PickerGroup tabs={['一', '二']} nextStepText="下一步" onConfirm={groupConfirm}>
        <Picker columns={columns('one')} onConfirm={firstConfirm} />
        <Picker columns={columns('two')} onConfirm={secondConfirm} />
      </PickerGroup>,
    )

    expect(screen.getByText('下一步')).toBeTruthy()
    timing.mockClear()
    await press(screen.getByTestId('picker-confirm'))
    expect(firstConfirm).not.toHaveBeenCalled()
    expect(groupConfirm).not.toHaveBeenCalled()
    expect(screen.getAllByRole('tab')[1].props.accessibilityState?.selected).toBe(true)
    expect(timing).toHaveBeenCalled()
    expect(screen.getByText('确定')).toBeTruthy()
    await press(screen.getByTestId('picker-confirm'))
    expect(firstConfirm).toHaveBeenCalledTimes(1)
    expect(secondConfirm).toHaveBeenCalledTimes(1)
    expect(groupConfirm).toHaveBeenCalledTimes(1)
  })

  it('does not cancel child pickers', async () => {
    const firstCancel = jest.fn()
    const secondCancel = jest.fn()
    const groupCancel = jest.fn()
    await render(
      <PickerGroup tabs={['一', '二']} onCancel={groupCancel}>
        <Picker columns={columns('one')} onCancel={firstCancel} />
        <Picker columns={columns('two')} onCancel={secondCancel} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-cancel'))
    expect(groupCancel).toHaveBeenCalledTimes(1)
    expect(firstCancel).not.toHaveBeenCalled()
    expect(secondCancel).not.toHaveBeenCalled()
  })

  it('keeps controlled activeTab authoritative until the parent writes it back', async () => {
    const onChange = jest.fn()
    const ref = createRef<PickerGroupRef>()
    let activeTab = 0
    const view = await render(
      <PickerGroup ref={ref} tabs={['一', '二']} activeTab={activeTab} onChange={onChange}>
        <Picker columns={columns('one')} />
        <Picker columns={columns('two')} />
      </PickerGroup>,
    )

    await press(screen.getAllByRole('tab')[1])
    expect(onChange).toHaveBeenCalledWith(1)
    expect(screen.getAllByRole('tab')[0].props.accessibilityState?.selected).toBe(true)
    expect(screen.getAllByRole('tab')[1].props.accessibilityState?.selected).toBe(false)

    activeTab = 1
    await view.rerender(
      <PickerGroup ref={ref} tabs={['一', '二']} activeTab={activeTab} onChange={onChange}>
        <Picker columns={columns('one')} />
        <Picker columns={columns('two')} />
      </PickerGroup>,
    )
    expect(screen.getAllByRole('tab')[1].props.accessibilityState?.selected).toBe(true)
  })

  it('does not crash when tabs and children have different counts', async () => {
    const onConfirm = jest.fn()
    const groupRef = createRef<PickerGroupRef>()
    await render(
      <PickerGroup ref={groupRef} tabs={['A', 'B', 'C']} onConfirm={onConfirm}>
        <Picker columns={columns('A')} />
        <Picker columns={columns('B')} />
      </PickerGroup>,
    )

    expect(groupRef.current?.getSelectedValues()).toEqual([['A'], ['B'], []])
    await press(screen.getByTestId('picker-confirm'))
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['A'] }),
      expect.objectContaining({ values: ['B'] }),
      { values: [], options: [], indexes: [] },
    ])
  })

  it('warns once when tabs and children counts are mismatched', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const view = await render(
      <PickerGroup tabs={['一', '二']}>
        <Picker columns={columns('one')} />
      </PickerGroup>,
    )
    await view.rerender(
      <PickerGroup tabs={['一', '二']}>
        <Picker columns={columns('one')} />
      </PickerGroup>,
    )
    expect(warning).toHaveBeenCalledTimes(1)
    warning.mockRestore()
  })

  it('keeps a missing first child at its positional result index', async () => {
    const groupConfirm = jest.fn()
    await render(
      <PickerGroup tabs={['一', '二']} onConfirm={groupConfirm}>
        <View />
        <Picker columns={columns('two')} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))
    expect(groupConfirm).toHaveBeenCalledWith([
      { values: [], options: [], indexes: [] },
      expect.objectContaining({ values: ['two'] }),
    ])
  })

  it('uses animated Tabs for tab changes', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })

    await render(
      <PickerGroup tabs={['一', '二']}>
        <Picker columns={columns('one')} />
        <Picker columns={columns('two')} />
      </PickerGroup>,
    )
    timing.mockClear()

    await press(screen.getAllByRole('tab')[1])
    expect(timing).toHaveBeenCalled()
    timing.mockRestore()
  })

  it('renders without panes when children are absent', async () => {
    await render(<PickerGroup tabs={['一', '二']} />)

    expect(screen.getAllByRole('tab')).toHaveLength(2)
    await press(screen.getByTestId('picker-confirm'))
  })

  it('keeps picker refs stable while reading the latest selection', async () => {
    const firstConfirm = jest.fn()
    const secondConfirm = jest.fn()
    const groupConfirm = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      callback?.(true)
      return value as never
    })
    await render(
      <PickerGroup tabs={['一', '二']} onConfirm={groupConfirm}>
        <Picker columns={selectableColumns('one', 'latest')} onConfirm={firstConfirm} />
        <Picker columns={columns('two')} onConfirm={secondConfirm} />
      </PickerGroup>,
    )

    await press(screen.getAllByTestId('picker-item-0-1')[0])
    await press(screen.getByTestId('picker-confirm'))

    expect(firstConfirm).toHaveBeenCalledWith(
      ['latest'],
      [expect.objectContaining({ value: 'latest' })],
    )
    expect(secondConfirm).toHaveBeenCalledWith(['two'], [expect.objectContaining({ value: 'two' })])
    expect(groupConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['latest'] }),
      expect.objectContaining({ values: ['two'] }),
    ])
    expect(firstConfirm).toHaveBeenCalledTimes(1)
    expect(secondConfirm).toHaveBeenCalledTimes(1)
    expect(groupConfirm).toHaveBeenCalledTimes(1)
  })

  it('registers DatePicker public string values and exposes them through the group ref', async () => {
    const groupConfirm = jest.fn()
    const groupRef = createRef<PickerGroupRef>()
    await render(
      <PickerGroup ref={groupRef} tabs={['日期']} onConfirm={groupConfirm}>
        <DatePicker defaultValue={['2026', '09', '13']} />
      </PickerGroup>,
    )

    expect(groupRef.current?.getSelectedValues()).toEqual([['2026', '09', '13']])
    await press(screen.getByTestId('picker-confirm'))

    const values = groupConfirm.mock.calls[0]?.[0][0].values
    expect(values).toEqual(['2026', '09', '13'])
    expect(typeof values[0]).toBe('string')
  })

  it('registers TimePicker public string values', async () => {
    const groupConfirm = jest.fn()
    await render(
      <PickerGroup tabs={['时间']} onConfirm={groupConfirm}>
        <TimePicker defaultValue={['10', '30']} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))

    const values = groupConfirm.mock.calls[0]?.[0][0].values
    expect(values).toEqual(['10', '30'])
    expect(typeof values[0]).toBe('string')
  })

  it('registers DateTimePicker public string values', async () => {
    const groupConfirm = jest.fn()
    await render(
      <PickerGroup tabs={['日期时间']} onConfirm={groupConfirm}>
        <DateTimePicker defaultValue={['2026', '09', '13', '10', '30']} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))

    const values = groupConfirm.mock.calls[0]?.[0][0].values
    expect(values).toEqual(['2026', '09', '13', '10', '30'])
    expect(typeof values[0]).toBe('string')
  })

  it('keeps generic Picker values unchanged in a group', async () => {
    const groupConfirm = jest.fn()
    await render(
      <PickerGroup tabs={['通用']} onConfirm={groupConfirm}>
        <Picker columns={[[{ text: '1', value: 1 }]]} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))

    expect(groupConfirm.mock.calls[0]?.[0][0].values).toEqual([1])
  })

  it('confirms a DatePicker pending tap through the group before timing finishes', async () => {
    const groupConfirm = jest.fn()
    const onChange = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value as never)
    await render(
      <PickerGroup tabs={['日期']} onConfirm={groupConfirm}>
        <DatePicker defaultValue={['2026', '09', '13']} onChange={onChange} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-item-2-13'))
    expect(onChange).not.toHaveBeenCalled()
    await press(screen.getByTestId('picker-confirm'))

    expect(groupConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['2026', '09', '14'] }),
    ])
  })

  it('keeps a pending first DatePicker positional through next-step confirmation', async () => {
    const groupConfirm = jest.fn()
    const firstConfirm = jest.fn()
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value as never)

    await render(
      <PickerGroup tabs={['开始日期', '结束日期']} nextStepText="下一步" onConfirm={groupConfirm}>
        <DatePicker defaultValue={['2026', '09', '10']} onConfirm={firstConfirm} />
        <DatePicker defaultValue={['2026', '09', '20']} />
      </PickerGroup>,
    )

    await press(screen.getAllByTestId('picker-item-2-24')[0])
    expect(firstConfirm).not.toHaveBeenCalled()
    await press(screen.getByTestId('picker-confirm'))
    await press(screen.getByTestId('picker-confirm'))

    expect(groupConfirm).toHaveBeenCalledTimes(1)
    expect(groupConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['2026', '09', '25'] }),
      expect.objectContaining({ values: ['2026', '09', '20'] }),
    ])
    expect(firstConfirm).toHaveBeenCalledTimes(1)
  })

  it('unregisters a child ref when its pane child unmounts', async () => {
    const groupConfirm = jest.fn()
    const view = await render(
      <PickerGroup tabs={['一', '二']} onConfirm={groupConfirm}>
        <Picker columns={columns('one')} />
        <Picker columns={columns('two')} />
      </PickerGroup>,
    )

    await view.rerender(
      <PickerGroup tabs={['一', '二']} onConfirm={groupConfirm}>
        <Picker columns={columns('one')} />
      </PickerGroup>,
    )
    await press(screen.getByTestId('picker-confirm'))

    expect(groupConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['one'] }),
      { values: [], options: [], indexes: [] },
    ])
  })

  it('keeps temporal child replacement registered to the same pane', async () => {
    const groupConfirm = jest.fn()
    const view = await render(
      <PickerGroup tabs={['时间']} onConfirm={groupConfirm}>
        <DatePicker defaultValue={['2026', '09', '13']} />
      </PickerGroup>,
    )

    await view.rerender(
      <PickerGroup tabs={['时间']} onConfirm={groupConfirm}>
        <TimePicker defaultValue={['10', '30']} />
      </PickerGroup>,
    )
    await press(screen.getByTestId('picker-confirm'))
    expect(groupConfirm).toHaveBeenCalledWith([expect.objectContaining({ values: ['10', '30'] })])
  })

  it('keeps tab spacing out of the title and tab root styles', async () => {
    await render(
      <PickerGroup tabs={['选择日期', '选择时间']}>
        <Picker columns={columns('date')} />
        <Picker columns={columns('time')} />
      </PickerGroup>,
    )

    expect(StyleSheet.flatten(screen.getByText('选择日期').props.style)).not.toHaveProperty(
      'marginRight',
    )
    expect(StyleSheet.flatten(screen.getAllByRole('tab')[0].props.style)).not.toHaveProperty(
      'marginRight',
    )
  })
})
