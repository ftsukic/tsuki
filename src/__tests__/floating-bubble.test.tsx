import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Dimensions, StyleSheet, Text } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { FloatingBubble, Provider } from '..'
import {
  clampOffset,
  resolveBounds,
  resolveMagneticTarget,
} from '../floating-bubble/floating-bubble'

function TestProvider({ children }: { children: React.ReactNode }) {
  return <Provider theme={{ token: { motion: false } }}>{children}</Provider>
}

async function layout(testID: string, width = 48, height = 48) {
  await act(async () => {
    screen.getByTestId(testID).props.onLayout({
      nativeEvent: { layout: { width, height, x: 0, y: 0 } },
    })
  })
}

async function drag(testID: string, translationX: number, translationY: number) {
  await act(async () => {
    fireGestureHandler(getByGestureTestId(`${testID}-gesture`), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX, translationY },
      { translationX, translationY },
      { state: State.END, translationX, translationY },
    ])
  })
}

function getBubbleOffset(testID: string) {
  const style = StyleSheet.flatten(screen.getByTestId(testID).props.style)
  const transform = style.transform as Array<Record<string, unknown>>
  const value = (key: string) => {
    const entry = transform.find((item) => key in item)?.[key]
    return entry && typeof entry === 'object' && '__getValue' in entry
      ? (entry as { __getValue: () => number }).__getValue()
      : entry
  }
  return { x: value('translateX'), y: value('translateY') }
}

describe('FloatingBubble', () => {
  afterEach(() => cleanup())

  it('is exported from the root and renders an accessible button', async () => {
    await render(
      <TestProvider>
        <FloatingBubble testID="default">
          <Text>帮助</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    expect(FloatingBubble).toBeTruthy()
    expect(screen.getByTestId('default').props.accessibilityRole).toBe('button')
  })

  it('keeps axis lock draggable-disabled while remaining pressable', async () => {
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble testID="locked" axis="lock" onPress={onPress}>
          <Text>锁定</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('locked')
    fireEvent.press(screen.getByTestId('locked'))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(() => getByGestureTestId('locked-gesture')).not.toThrow()
  })

  it('clamps controlled offsets when the measured bubble is laid out', async () => {
    const onOffsetChange = jest.fn()
    const viewport = Dimensions.get('window')
    await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled"
          axis="xy"
          offset={{ x: -100, y: 9999 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled', 60, 64)
    expect(onOffsetChange).not.toHaveBeenCalled()
    expect(
      clampOffset(
        { x: -100, y: 9999 },
        resolveBounds({
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          bubbleWidth: 60,
          bubbleHeight: 64,
          gap: 24,
        }),
      ),
    ).toEqual({
      x: 24,
      y: viewport.height - 64 - 24,
    })
  })

  it('synchronizes a changed controlled offset to the animated position', async () => {
    const onOffsetChange = jest.fn()
    const view = await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled-sync"
          axis="xy"
          offset={{ x: 80, y: 100 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled-sync')
    await view.rerender(
      <TestProvider>
        <FloatingBubble
          testID="controlled-sync"
          axis="xy"
          offset={{ x: 180, y: 260 }}
          onOffsetChange={onOffsetChange}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await drag('controlled-sync', 10, 20)
    expect(onOffsetChange).toHaveBeenLastCalledWith({ x: 190, y: 280 })
  })

  it('reconciles a controlled drag after the parent ignores the request', async () => {
    const onOffsetChange = jest.fn()
    const onOffsetChangeEnd = jest.fn()
    const view = await render(
      <TestProvider>
        <FloatingBubble
          testID="controlled-ignore"
          axis="xy"
          offset={{ x: 100, y: 100 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('controlled-ignore')
    await drag('controlled-ignore', 80, 60)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    await view.rerender(
      <TestProvider>
        <FloatingBubble
          testID="controlled-ignore"
          axis="xy"
          offset={{ x: 100, y: 100 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    expect(onOffsetChange).toHaveBeenCalledTimes(1)
    expect(onOffsetChange).toHaveBeenCalledWith({ x: 180, y: 160 })
    expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 180, y: 160 })
    await waitFor(() => expect(getBubbleOffset('controlled-ignore')).toEqual({ x: 100, y: 100 }))
  })

  it('keeps a controlled drag when the parent writes the target back', async () => {
    const onOffsetChangeEnd = jest.fn()

    function Controlled() {
      const [value, setValue] = React.useState({ x: 100, y: 100 })
      return (
        <FloatingBubble
          testID="controlled-writeback"
          axis="xy"
          offset={value}
          onOffsetChange={setValue}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>控</Text>
        </FloatingBubble>
      )
    }

    await render(
      <TestProvider>
        <Controlled />
      </TestProvider>,
    )
    await layout('controlled-writeback')
    await drag('controlled-writeback', 80, 60)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(onOffsetChangeEnd).toHaveBeenCalledTimes(1)
    expect(onOffsetChangeEnd).toHaveBeenCalledWith({ x: 180, y: 160 })
    await waitFor(() => expect(getBubbleOffset('controlled-writeback')).toEqual({ x: 180, y: 160 }))
  })

  it('keeps an uncontrolled drag at its settled target', async () => {
    const view = await render(
      <TestProvider>
        <FloatingBubble testID="uncontrolled" axis="xy" defaultOffset={{ x: 100, y: 100 }}>
          <Text>非控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('uncontrolled')
    await drag('uncontrolled', 80, 60)
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="uncontrolled" axis="xy" defaultOffset={{ x: 100, y: 100 }}>
          <Text>非控</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await waitFor(() => expect(getBubbleOffset('uncontrolled')).toEqual({ x: 180, y: 160 }))
  })

  it('follows an external controlled offset update without a gesture', async () => {
    const view = await render(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 100, y: 100 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('external-offset')
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 200, y: 240 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )
    await view.rerender(
      <TestProvider>
        <FloatingBubble testID="external-offset" axis="xy" offset={{ x: 200, y: 240 }}>
          <Text>外部</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    expect(getBubbleOffset('external-offset')).toEqual({ x: 200, y: 240 })
  })

  it('uses the real bubble size and safe area in its drag bounds', async () => {
    const onOffsetChange = jest.fn()
    const viewport = Dimensions.get('window')
    await render(
      <TestProvider>
        <SafeAreaInsetsContext.Provider value={{ top: 20, right: 0, bottom: 12, left: 0 }}>
          <FloatingBubble
            testID="sized"
            axis="xy"
            defaultOffset={{ x: 24, y: 32 }}
            onOffsetChange={onOffsetChange}
          >
            <Text>自定义尺寸</Text>
          </FloatingBubble>
        </SafeAreaInsetsContext.Provider>
      </TestProvider>,
    )

    await layout('sized', 100, 80)
    await drag('sized', 9999, 9999)

    expect(onOffsetChange).toHaveBeenLastCalledWith({
      x: viewport.width - 100 - 24,
      y: viewport.height - 12 - 80 - 24,
    })
  })

  it('notifies the final position after magnetic x chooses the nearest edge', async () => {
    const onOffsetChange = jest.fn()
    const onOffsetChangeEnd = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble
          testID="magnetic"
          axis="xy"
          magnetic="x"
          defaultOffset={{ x: 100, y: 80 }}
          onOffsetChange={onOffsetChange}
          onOffsetChangeEnd={onOffsetChangeEnd}
        >
          <Text>吸附</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('magnetic')
    await drag('magnetic', -40, 30)

    const viewport = Dimensions.get('window')
    expect(onOffsetChange).toHaveBeenLastCalledWith({
      x: 24,
      y: 110,
    })
    expect(onOffsetChangeEnd).toHaveBeenLastCalledWith({ x: 24, y: 110 })
    expect(
      resolveMagneticTarget(
        { x: 60, y: 110 },
        resolveBounds({
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          bubbleWidth: 48,
          bubbleHeight: 48,
          gap: 24,
        }),
        'x',
      ),
    ).toEqual({ x: 24, y: 110 })
  })

  it('fires onPress for a tap and not for an activated pan', async () => {
    const onPress = jest.fn()
    await render(
      <TestProvider>
        <FloatingBubble testID="interaction" axis="xy" onPress={onPress}>
          <Text>操作</Text>
        </FloatingBubble>
      </TestProvider>,
    )

    await layout('interaction')
    fireEvent.press(screen.getByTestId('interaction'))
    expect(onPress).toHaveBeenCalledTimes(1)

    await drag('interaction', 80, 40)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('resolves a too-small viewport to a single non-negative position', () => {
    const bounds = resolveBounds({
      viewportWidth: 40,
      viewportHeight: 50,
      bubbleWidth: 80,
      bubbleHeight: 90,
      gap: 24,
      topInset: 20,
      bottomInset: 12,
    })

    expect(bounds).toEqual({ minX: 24, maxX: 24, minY: 44, maxY: 44 })
  })

  it('recomputes and reclamps the position when the viewport changes', () => {
    const firstBounds = resolveBounds({
      viewportWidth: 400,
      viewportHeight: 800,
      bubbleWidth: 48,
      bubbleHeight: 48,
      gap: 24,
    })
    const rotatedBounds = resolveBounds({
      viewportWidth: 800,
      viewportHeight: 400,
      bubbleWidth: 48,
      bubbleHeight: 48,
      gap: 24,
    })

    expect(clampOffset({ x: firstBounds.maxX, y: firstBounds.maxY }, rotatedBounds)).toEqual({
      x: 328,
      y: 328,
    })
  })
})
