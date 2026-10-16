import React from 'react'
import { View } from 'react-native'
import { act, render } from '@testing-library/react-native'
import { GestureDetector } from '../gesture'
import { ConfigProvider } from '../theme'
import * as motion from '../motion/animation'
import { useImagePreviewInteraction } from '../image-preview/useImagePreviewInteraction'
const ids = ['a', 'b', 'c']
const images = [
  { x: 0, y: 0, width: 400, height: 800 },
  { x: 0, y: 300, width: 400, height: 200 },
  { x: 0, y: 200, width: 400, height: 400 },
]
async function setup(animated = false) {
  let control!: ReturnType<typeof useImagePreviewInteraction>
  const select = jest.fn(),
    close = jest.fn(),
    longPress = jest.fn(),
    state = jest.fn()
  function Probe() {
    control = useImagePreviewInteraction({
      enabled: true,
      ids,
      images,
      activeId: 'b',
      viewport: { x: 0, y: 0, width: 400, height: 800 },
      pageWidth: 416,
      closeOnGesture: true,
      onSelect: select,
      onClose: close,
      onLongPress: longPress,
      onStateChange: state,
    })
    return (
      <GestureDetector gesture={control.gesture}>
        <View />
      </GestureDetector>
    )
  }
  await render(
    <ConfigProvider theme={{ motion: { enabled: animated } }}>
      <Probe />
    </ConfigProvider>,
  )
  return {
    get control() {
      return control
    },
    select,
    close,
    longPress,
    state,
  }
}
async function doubleTap(c: ReturnType<typeof useImagePreviewInteraction>, y = 400) {
  await act(() => {
    c.doubleTap.handlers.onTouchesDown!({ numberOfTouches: 1 } as never, {} as never)
    c.doubleTap.handlers.onEnd!({ absoluteX: 200, absoluteY: y } as never, true)
  })
}
async function start(c: ReturnType<typeof useImagePreviewInteraction>) {
  await act(() => {
    c.pan.handlers.onBegin!({ absoluteX: 200, absoluteY: 400 } as never)
    c.pan.handlers.onStart!({} as never)
  })
}
async function move(c: ReturnType<typeof useImagePreviewInteraction>, dx: number, dy = 0) {
  await act(() =>
    c.pan.handlers.onUpdate!({
      absoluteX: 200 + dx,
      absoluteY: 400 + dy,
      translationX: dx,
      translationY: dy,
    } as never),
  )
}
async function end(
  c: ReturnType<typeof useImagePreviewInteraction>,
  success = true,
  vx = 0,
  vy = 0,
) {
  await act(() => c.pan.handlers.onFinalize!({ velocityX: vx, velocityY: vy } as never, success))
}

it.each([-1, 1])(
  'uses the same pager at fit and zoom, including reverse handoff (%s)',
  async (direction) => {
    const p = await setup()
    const c = p.control
    await doubleTap(c)
    expect(c.scale.value).toBe(2)
    await start(c)
    await move(c, direction * 300)
    expect(c.state.value).toBe('paging')
    expect(c.position.value).toBe(416 - direction * 100)
    await move(c, direction * 150)
    expect(c.state.value).toBe('pan')
    expect(c.position.value).toBe(416)
    expect(c.x.value).toBe(direction * 150)
    await end(c)
    expect(c.scale.value).toBe(2)
    expect(p.select).not.toHaveBeenCalled()
    await doubleTap(c)
    expect(c.scale.value).toBe(1)
    await start(c)
    await move(c, direction * 260)
    await end(c)
    expect(c.selected.value).toBe(direction > 0 ? 'a' : 'c')
    expect(c.scale.value).toBe(1)
  },
)
it('preserves zoom on cancelled paging and resets it only on successful selection', async () => {
  const p = await setup(),
    c = p.control
  await doubleTap(c)
  await start(c)
  await move(c, -300)
  await end(c, false)
  expect(c.position.value).toBe(416)
  expect(c.scale.value).toBe(2)
  expect(p.select).not.toHaveBeenCalled()
  await start(c)
  await move(c, -500)
  await end(c)
  expect(c.selected.value).toBe('c')
  expect(c.scale.value).toBe(1)
  expect(p.select).toHaveBeenCalledWith('c')
})
it.each([100, 400, 750])(
  'pinches across the container at y=%s and restores undersizing',
  async (y) => {
    const p = await setup(),
      c = p.control
    await act(() => {
      c.pinch.handlers.onTouchesDown!({ numberOfTouches: 2 } as never, {} as never)
      c.pinch.handlers.onStart!({ focalX: 200, focalY: y } as never)
      c.pinch.handlers.onUpdate!({ focalX: 200, focalY: y, scale: 2, numberOfPointers: 2 } as never)
    })
    expect(c.scale.value).toBe(2)
    await act(() => c.pinch.handlers.onFinalize!({} as never, true))
    await act(() => {
      c.pinch.handlers.onStart!({ focalX: 200, focalY: y } as never)
      c.pinch.handlers.onUpdate!({
        focalX: 200,
        focalY: y,
        scale: 0.3,
        numberOfPointers: 2,
      } as never)
    })
    expect(c.scale.value).toBeCloseTo(0.6)
    await act(() => c.pinch.handlers.onFinalize!({} as never, true))
    expect(c.scale.value).toBe(1)
    expect(c.y.value).toBe(0)
  },
)
it.each(['doubleTap', 'pinch'])(
  'interrupts an unfinished page settlement with %s and ignores its completion',
  async (gesture) => {
    const callbacks: Array<(finished?: boolean) => void> = []
    const animate = jest
      .spyOn(motion, 'animateValue')
      .mockImplementation((target, _config, done) => {
        if (done) callbacks.push(done)
        return target
      })
    try {
      const p = await setup(true),
        c = p.control
      await start(c)
      await move(c, -280)
      await end(c)
      const old = callbacks[0]
      c.position.value = 740
      if (gesture === 'doubleTap') await doubleTap(c)
      else
        await act(() => {
          c.pinch.handlers.onStart!({ focalX: 200, focalY: 400 } as never)
          c.pinch.handlers.onUpdate!({
            focalX: 200,
            focalY: 400,
            scale: 2,
            numberOfPointers: 2,
          } as never)
        })
      expect(c.selected.value).toBe('c')
      expect(c.position.value).toBe(832)
      expect(c.scale.value).toBe(2)
      await act(() => old(true))
      expect(c.scale.value).toBe(2)
      expect(p.select).toHaveBeenCalledTimes(1)
    } finally {
      animate.mockRestore()
    }
  },
)
it('restores a short dismiss and closes on a complete downward drag', async () => {
  const p = await setup(),
    c = p.control
  await start(c)
  await move(c, 0, 25)
  expect(c.state.value).toBe('dismiss')
  await end(c)
  expect(c.dragY.value).toBe(0)
  expect(p.close).not.toHaveBeenCalled()
  await start(c)
  await move(c, 0, 200)
  await end(c)
  expect(p.close).toHaveBeenCalledWith('gesture')
})
it('moves zoomed content before handing downward overflow to dismissal', async () => {
  const p = await setup(),
    c = p.control
  await act(() => c.settlePage(0, true))
  await doubleTap(c)
  await start(c)
  await move(c, 0, 200)
  expect(c.dragY.value).toBe(0)
  await move(c, 0, 450)
  expect(c.dragY.value).toBe(50)
})

it('recovers single-finger panning after a pinch and includes the last native touch position', async () => {
  const p = await setup(),
    c = p.control
  await act(() => {
    c.pinch.handlers.onStart!({ focalX: 200, focalY: 400 } as never)
    c.pinch.handlers.onUpdate!({ focalX: 200, focalY: 400, scale: 2, numberOfPointers: 2 } as never)
    c.pinch.handlers.onFinalize!({} as never, true)
    c.pan.handlers.onTouchesDown!({ numberOfTouches: 1 } as never, {} as never)
    c.pan.handlers.onBegin!({ absoluteX: 300, absoluteY: 400 } as never)
    c.pan.handlers.onStart!({
      absoluteX: 300,
      absoluteY: 400,
      translationX: 0,
      translationY: 0,
    } as never)
    c.pan.handlers.onFinalize!(
      {
        absoluteX: -250,
        absoluteY: 400,
        translationX: 0,
        translationY: 0,
        velocityX: 0,
        velocityY: 0,
      } as never,
      true,
    )
  })
  expect(c.selected.value).toBe('c')
  expect(p.select).toHaveBeenCalledWith('c')
})

it('tracks the moving pinch focal point instead of scaling only around the viewport center', async () => {
  const p = await setup(),
    c = p.control
  await act(() => {
    c.pinch.handlers.onStart!({ focalX: 100, focalY: 300 } as never)
    c.pinch.handlers.onUpdate!({ focalX: 150, focalY: 350, scale: 2, numberOfPointers: 2 } as never)
  })
  expect(c.x.value).toBe(150)
  expect(c.y.value).toBe(150)
})
it('does not dismiss when a second finger interrupts a downward drag', async () => {
  const p = await setup(),
    c = p.control
  await start(c)
  await move(c, 0, 200)
  await act(() => {
    c.pinch.handlers.onTouchesDown!({ numberOfTouches: 2 } as never, {} as never)
    c.pinch.handlers.onStart!({ focalX: 200, focalY: 400 } as never)
    c.pan.handlers.onFinalize!({ velocityX: 0, velocityY: 1500 } as never, false)
  })
  expect(p.close).not.toHaveBeenCalled()
  expect(c.dragY.value).toBe(0)
  expect(c.state.value).toBe('pinch')
})
it('keeps the album at its edge without selecting an invalid image', async () => {
  const p = await setup(),
    c = p.control
  await act(() => c.settlePage(0, true))
  p.select.mockClear()
  await start(c)
  await move(c, 350)
  await end(c)
  expect(c.position.value).toBe(0)
  expect(c.selected.value).toBe('a')
  expect(p.select).not.toHaveBeenCalled()
})

it('selects the visible page before a new vertical gesture takes over a partial page transition', async () => {
  const p = await setup(),
    c = p.control
  c.position.value = 740
  c.state.value = 'settling'
  await start(c)
  await move(c, 0, 180)
  expect(c.selected.value).toBe('c')
  expect(c.position.value).toBe(832)
  expect(c.state.value).toBe('dismiss')
  expect(c.dragY.value).toBe(180)
})
