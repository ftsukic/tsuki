import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { PortalHost } from '../portal'
import { closePicker, Picker, showPicker } from '../picker'
import { ConfigProvider } from '../theme'
import type { PickerResult } from '../picker'
import * as Reanimated from 'react-native-reanimated'

const options = [
  { text: '第一项', value: 'first' },
  { text: '第三项', value: 'third' },
]

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

async function renderHost({ motion = false }: { motion?: boolean } = {}) {
  return render(
    <ConfigProvider theme={{ token: { motion } }}>
      <PortalHost />
    </ConfigProvider>,
  )
}

afterEach(async () => {
  await act(async () => closePicker())
  cleanup()
  jest.restoreAllMocks()
})

describe('Picker imperative API', () => {
  it('owns value changes for imperative controlled-looking options', async () => {
    const onChange = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, value: ['first'], onChange })
    })
    await press(screen.getByTestId('picker-item-0-1'))
    await press(screen.getByTestId('picker-confirm'))

    await expect(resultPromise).resolves.toMatchObject({
      action: 'confirm',
      values: ['third'],
    })
    expect(onChange).toHaveBeenCalledWith(['third'], [options[1]])
    await view.unmount()
  })

  it('confirms an imperative pending value before its animation finishes', async () => {
    const onChange = jest.fn()
    const onConfirm = jest.fn()
    let finish!: (finished?: boolean) => void
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      finish = callback as (finished?: boolean) => void
      return value as never
    })
    const view = await renderHost({ motion: true })
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, value: ['first'], onChange, onConfirm })
    })
    await press(screen.getByTestId('picker-item-0-1'))
    expect(finish).toEqual(expect.any(Function))
    await press(screen.getByTestId('picker-confirm'))

    await expect(resultPromise).resolves.toMatchObject({
      action: 'confirm',
      values: ['third'],
    })
    finish(true)
    await Promise.resolve()
    expect(onChange).not.toHaveBeenCalled()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('forwards changes once and resolves confirm without another onChange', async () => {
    const onChange = jest.fn()
    const onConfirm = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, onChange, onConfirm })
    })
    await press(screen.getByTestId('picker-item-0-1'))
    await press(screen.getByTestId('picker-confirm'))

    await expect(resultPromise).resolves.toMatchObject({
      action: 'confirm',
      values: ['third'],
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['third'], [options[1]])
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith(['third'], [options[1]])
    await view.unmount()
  })

  it('settles toolbar cancel and calls onCancel once', async () => {
    const onCancel = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, onCancel })
    })
    await press(screen.getByTestId('picker-cancel'))

    await expect(resultPromise).resolves.toMatchObject({
      action: 'cancel',
      values: ['first'],
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('settles overlay cancel and calls onCancel once', async () => {
    const onCancel = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, onCancel })
    })
    // eslint-disable-next-line testing-library/no-container
    const overlay = view.container.queryAll(
      (node) => typeof node.props.onStartShouldSetResponder === 'function',
    )[0]
    expect(overlay).toBeTruthy()
    fireEvent.press(overlay!)
    await Promise.resolve()

    await expect(resultPromise).resolves.toMatchObject({
      action: 'cancel',
      values: ['first'],
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('settles closePicker as cancel', async () => {
    const onCancel = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, onCancel })
      closePicker()
    })

    await expect(resultPromise).resolves.toMatchObject({
      action: 'cancel',
      values: ['first'],
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('settles the previous promise before showing a second picker', async () => {
    const firstCancel = jest.fn()
    const secondConfirm = jest.fn()
    const view = await renderHost()
    let first!: Promise<PickerResult>
    let second!: Promise<PickerResult>

    await act(async () => {
      first = showPicker({ columns: options, onCancel: firstCancel })
      second = showPicker({ columns: options, onConfirm: secondConfirm })
    })

    await expect(first).resolves.toMatchObject({ action: 'cancel', values: ['first'] })
    expect(firstCancel).toHaveBeenCalledTimes(1)
    await press(screen.getByTestId('picker-confirm'))
    await expect(second).resolves.toMatchObject({ action: 'confirm', values: ['first'] })
    expect(secondConfirm).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('keeps Picker.open as the same command entry point', async () => {
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = Picker.open({ columns: options })
    })
    await press(screen.getByTestId('picker-cancel'))

    await expect(resultPromise).resolves.toMatchObject({ action: 'cancel' })
    await view.unmount()
  })

  it('settles a pending promise and calls onCancel when the host unmounts', async () => {
    const onCancel = jest.fn()
    const view = await renderHost()
    let resultPromise!: Promise<PickerResult>

    await act(async () => {
      resultPromise = showPicker({ columns: options, value: ['third'], onCancel })
    })
    await view.unmount()

    await expect(resultPromise).resolves.toMatchObject({
      action: 'cancel',
      values: ['third'],
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
