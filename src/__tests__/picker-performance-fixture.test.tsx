/* eslint-disable testing-library/no-await-sync-events -- Awaiting RNTL events flushes fixture state before assertions. */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import React from 'react'
import type * as ReactModule from 'react'
import type * as NativeModule from 'react-native'
import { Platform } from 'react-native'
import type { PickerValue } from '../picker/types'
import { PerformanceProbeContext as mockPerformanceProbeContext } from '../performance-probe-context'
import type { PerformanceProbeContextValue } from '../performance-probe-context'
import PickerPerformanceExample from '../picker/__fixtures__/examples/performance'
import TimePickerPerformanceExample from '../time-picker/__fixtures__/examples/open-performance'
import type { TimePickerValue } from '../time-picker/types'

interface MockPickerProps {
  value?: readonly PickerValue[]
  onLayout?: (event: { nativeEvent: { layout: { width: number; height: number } } }) => void
  onChange?: (values: readonly PickerValue[]) => void
}

interface MockTimePickerProps {
  onLayout?: MockPickerProps['onLayout']
  onChange?: (value: TimePickerValue) => void
}

interface MockPopupProps {
  visible: boolean
  performanceProbe?: PerformanceProbeContextValue | null
  onLayout?: (event?: unknown) => void
  onOpen?: () => void
  onOpened?: () => void
  onClosed?: () => void
  onRequestClose?: () => void
  children?: React.ReactNode
}

const mockState: {
  pickerProps: MockPickerProps | null
  timePickerProps: MockTimePickerProps | null
  popupProps: MockPopupProps | null
} = { pickerProps: null, timePickerProps: null, popupProps: null }

jest.mock('@ftsukic/tsuki', () => {
  const ReactRuntime = jest.requireActual<typeof ReactModule>('react')
  const Native = jest.requireActual<typeof NativeModule>('react-native')

  return {
    Cell: (rawProps: unknown) => {
      const props = rawProps as {
        title: React.ReactNode
        value?: React.ReactNode
        disabled?: boolean
        onPress?: () => void
      }
      return ReactRuntime.createElement(
        Native.Pressable,
        { disabled: props.disabled, onPress: props.onPress, testID: 'performance-open-cell' },
        ReactRuntime.createElement(Native.Text, null, props.title),
        ReactRuntime.createElement(Native.Text, null, props.value),
      )
    },
    Picker: (rawProps: unknown) => {
      mockState.pickerProps = rawProps as MockPickerProps
      return ReactRuntime.createElement(Native.View, { testID: 'performance-picker' })
    },
    TimePicker: (rawProps: unknown) => {
      mockState.timePickerProps = rawProps as MockTimePickerProps
      return ReactRuntime.createElement(Native.View, { testID: 'performance-picker' })
    },
    Popup: (rawProps: unknown) => {
      const props = rawProps as MockPopupProps
      const performanceProbe = ReactRuntime.useContext(mockPerformanceProbeContext)
      mockState.popupProps = { ...props, performanceProbe }
      if (!props.visible) return null
      return ReactRuntime.createElement(
        Native.View,
        { testID: 'performance-popup' },
        props.children,
        ReactRuntime.createElement(
          Native.Pressable,
          { onPress: props.onRequestClose, testID: 'performance-popup-close' },
          ReactRuntime.createElement(Native.Text, null, '关闭'),
        ),
      )
    },
  }
})

const layoutEvent = { nativeEvent: { layout: { width: 320, height: 220 } } }

afterEach(async () => {
  await cleanup()
  jest.restoreAllMocks()
  mockState.pickerProps = null
  mockState.timePickerProps = null
  mockState.popupProps = null
})

describe('Picker performance fixture', () => {
  it('keeps run ids global and ignores layout callbacks from previous samples', async () => {
    expect(PickerPerformanceExample).toBeDefined()
    const previousPlatformOS = Platform.OS
    Platform.OS = 'ios'
    try {
      await render(React.createElement(PickerPerformanceExample!))

      await fireEvent.press(screen.getByTestId('performance-open-cell'))
      const firstPicker = { ...mockState.pickerProps! }
      const firstPopup = { ...mockState.popupProps! }
      const firstRunId = firstPopup.performanceProbe!.runId
      expect(screen.getByText('500 项 · 冷启动 · #1')).toBeTruthy()

      await act(async () => {
        firstPicker.onChange?.([300])
        firstPicker.onLayout?.(layoutEvent)
        firstPopup.onOpen?.()
        firstPopup.onLayout?.(layoutEvent)
        firstPopup.performanceProbe?.onPopupFirstVisible?.(firstRunId)
        firstPopup.performanceProbe?.onPickerOptionLayout?.(firstRunId, 0)
      })
      expect(screen.getByText('300')).toBeTruthy()

      await fireEvent.press(screen.getByTestId('performance-popup-close'))
      firstPopup.onClosed?.()
      await fireEvent.press(screen.getByText('10,000'))
      await fireEvent.press(screen.getByTestId('performance-open-cell'))

      const secondPicker = { ...mockState.pickerProps! }
      const secondPopup = { ...mockState.popupProps! }
      const secondRunId = secondPopup.performanceProbe!.runId
      expect(secondRunId).not.toBe(firstRunId)
      expect(screen.getByText('10,000 项 · 冷启动 · #1')).toBeTruthy()
      expect(screen.getByText('点击 → Picker 根节点布局：—')).toBeTruthy()
      expect(screen.getByText('点击 → 中间滚轮选项可见：—')).toBeTruthy()
      expect(screen.getByText('点击 → Popup 动画完成：—')).toBeTruthy()

      await act(async () => {
        firstPicker.onLayout?.(layoutEvent)
        firstPicker.onChange?.([450])
        firstPopup.onLayout?.(layoutEvent)
        firstPopup.onOpened?.()
        firstPopup.onRequestClose?.()
        firstPopup.performanceProbe?.onPopupFirstVisible?.(firstRunId)
        firstPopup.performanceProbe?.onPickerOptionLayout?.(firstRunId, 0)
      })
      expect(screen.getByText('点击 → Picker 根节点布局：—')).toBeTruthy()
      expect(screen.getByText('点击 → 中间滚轮选项可见：—')).toBeTruthy()
      expect(screen.getByText('点击 → Popup 动画完成：—')).toBeTruthy()
      expect(screen.getByTestId('performance-picker')).toBeTruthy()
      expect(mockState.pickerProps?.value).toEqual([300])

      await act(async () => {
        secondPicker.onLayout?.(layoutEvent)
        secondPopup.onOpen?.()
        secondPopup.onLayout?.(layoutEvent)
        secondPopup.onOpened?.()
        secondPopup.performanceProbe?.onPopupFirstVisible?.(secondRunId)
        secondPopup.performanceProbe?.onPickerOptionLayout?.(secondRunId, 0)
      })
      expect(screen.queryByText('点击 → Picker 根节点布局：—')).toBeNull()
      expect(screen.queryByText('点击 → 中间滚轮选项可见：—')).toBeNull()
      expect(screen.queryByText('Popup 尺寸测量：复用（无新布局）')).toBeNull()

      await fireEvent.press(screen.getByTestId('performance-popup-close'))
      secondPopup.onClosed?.()
      await fireEvent.press(screen.getByText('保留挂载'))
      await fireEvent.press(screen.getByTestId('performance-open-cell'))
      const retainedRunId = mockState.popupProps!.performanceProbe!.runId
      expect(retainedRunId).not.toBe(secondRunId)
      expect(retainedRunId).not.toBe(firstRunId)
      expect(screen.getByText('10,000 项 · 保留挂载 · #1')).toBeTruthy()
    } finally {
      Platform.OS = previousPlatformOS
    }
  })

  it('blocks the Web 100000-item open and clears prior sample measurements', async () => {
    const previousPlatformOS = Platform.OS
    Platform.OS = 'web'
    try {
      await render(React.createElement(PickerPerformanceExample!))

      await fireEvent.press(screen.getByTestId('performance-open-cell'))
      expect(screen.getByTestId('performance-picker')).toBeTruthy()
      const firstPicker = { ...mockState.pickerProps! }
      const firstPopup = { ...mockState.popupProps! }
      const firstRunId = firstPopup.performanceProbe!.runId
      await act(async () => {
        firstPicker.onLayout?.(layoutEvent)
        firstPopup.onOpen?.()
        firstPopup.onLayout?.(layoutEvent)
        firstPopup.onOpened?.()
        firstPopup.performanceProbe?.onPopupFirstVisible?.(firstRunId)
      })
      expect(screen.queryByText('点击 → Picker 根节点布局：—')).toBeNull()
      expect(screen.queryByText('点击 → 中间滚轮选项可见：—')).toBeNull()
      await fireEvent.press(screen.getByTestId('performance-popup-close'))
      firstPopup.onClosed?.()

      await fireEvent.press(screen.getByText('100,000'))
      expect(screen.getByText(/Web 限制：/)).toBeTruthy()
      expect(screen.getByText('选项数据准备：—')).toBeTruthy()
      expect(screen.getByText('100,000 项 · 尚未打开')).toBeTruthy()
      expect(screen.getByText('点击 → Picker 根节点布局：—')).toBeTruthy()
      expect(screen.getByText('Popup 尺寸测量：—')).toBeTruthy()
      await fireEvent.press(screen.getByTestId('performance-open-cell'))
      expect(screen.queryByTestId('performance-picker')).toBeNull()
      expect(screen.queryByTestId('performance-popup')).toBeNull()
    } finally {
      Platform.OS = previousPlatformOS
    }
  })

  it('ignores stale layout and Popup callbacks in the TimePicker fixture', async () => {
    expect(TimePickerPerformanceExample).toBeDefined()
    const previousPlatformOS = Platform.OS
    Platform.OS = 'ios'
    try {
      await render(React.createElement(TimePickerPerformanceExample!))
      await fireEvent.press(screen.getByTestId('performance-open-cell'))

      const firstPicker = { ...mockState.timePickerProps! }
      const firstPopup = { ...mockState.popupProps! }
      const firstRunId = firstPopup.performanceProbe!.runId
      await act(async () => {
        firstPicker.onLayout?.(layoutEvent)
        firstPopup.onLayout?.(layoutEvent)
        firstPopup.onOpen?.()
        firstPopup.onOpened?.()
      })

      await fireEvent.press(screen.getByTestId('performance-popup-close'))
      firstPopup.onClosed?.()
      await fireEvent.press(screen.getByText('保留挂载'))
      await fireEvent.press(screen.getByTestId('performance-open-cell'))

      const secondPicker = { ...mockState.timePickerProps! }
      const secondPopup = { ...mockState.popupProps! }
      const secondRunId = secondPopup.performanceProbe!.runId
      expect(secondRunId).not.toBe(firstRunId)
      expect(screen.getByText(/保留挂载 · 首次挂载 #2/)).toBeTruthy()
      expect(screen.getByText('点击 → Picker 根节点布局：—')).toBeTruthy()

      await act(async () => {
        firstPicker.onLayout?.(layoutEvent)
        firstPopup.onLayout?.(layoutEvent)
        firstPopup.onOpened?.()
        firstPopup.performanceProbe?.onPopupFirstVisible?.(firstRunId)
      })
      expect(screen.getByText('点击 → Picker 根节点布局：—')).toBeTruthy()
      expect(screen.getByText('Popup 尺寸测量：—')).toBeTruthy()
      expect(screen.getByText('点击 → Popup 动画完成：—')).toBeTruthy()
      expect(screen.getByText('点击 → 中间滚轮选项可见：—')).toBeTruthy()

      await act(async () => {
        secondPicker.onLayout?.(layoutEvent)
        secondPopup.onOpen?.()
        secondPopup.onLayout?.(layoutEvent)
        secondPopup.onOpened?.()
        secondPopup.performanceProbe?.onPopupFirstVisible?.(secondRunId)
      })
      expect(screen.queryByText('点击 → Picker 根节点布局：—')).toBeNull()
      expect(screen.queryByText('Popup 尺寸测量：—')).toBeNull()
      expect(screen.queryByText('点击 → Popup 动画完成：—')).toBeNull()
      expect(screen.queryByText('点击 → 中间滚轮选项可见：—')).toBeNull()
    } finally {
      Platform.OS = previousPlatformOS
    }
  })
})
