import { Fragment, createRef, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { Picker, PickerGroup } from '..'
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
    await render(
      <PickerGroup tabs={['A', 'B', 'C']} onConfirm={onConfirm}>
        <Picker columns={columns('A')} />
        <Picker columns={columns('B')} />
      </PickerGroup>,
    )

    await press(screen.getByTestId('picker-confirm'))
    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ values: ['A'] }),
      expect.objectContaining({ values: ['B'] }),
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

  it('applies Vant title spacing to text, not the tab root', async () => {
    await render(
      <PickerGroup tabs={['选择日期', '选择时间']}>
        <Picker columns={columns('date')} />
        <Picker columns={columns('time')} />
      </PickerGroup>,
    )

    expect(StyleSheet.flatten(screen.getByText('选择日期').props.style)).toMatchObject({
      marginRight: 16,
    })
    expect(StyleSheet.flatten(screen.getAllByRole('tab')[0].props.style)).not.toHaveProperty(
      'marginRight',
    )
  })
})
