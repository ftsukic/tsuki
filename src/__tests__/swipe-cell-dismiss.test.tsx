import React from 'react'
import { act, cleanup, render } from '@testing-library/react-native'
import type { GestureResponderEvent, View } from 'react-native'
import { useSwipeCellDismiss, type SwipeCellDismissController, type SwipeCellRef } from '..'

let dismiss: SwipeCellDismissController
function Harness() {
  dismiss = useSwipeCellDismiss()
  return null
}
const point = (pageX: number, pageY: number) =>
  ({ nativeEvent: { pageX, pageY } }) as GestureResponderEvent
const touch = (x: number, y: number) =>
  dismiss.containerProps.onStartShouldSetResponderCapture!(point(x, y))
function row(id: string, measure?: View['measure']) {
  const binding = dismiss.getSwipeCellProps(id)
  const handle: SwipeCellRef = {
    open: jest.fn(),
    close: jest.fn(),
    measure: measure ?? ((done) => done(0, 0, 300, 60, 20, 100)),
  }
  binding.ref(handle)
  binding.onOpenStart()
  return { binding, handle }
}

afterEach(cleanup)

it('closes outside without taking the responder, and keeps both content and actions inside', async () => {
  await render(<Harness />)
  const { handle } = row('a')
  expect(touch(25, 105)).toBe(false)
  expect(touch(310, 150)).toBe(false)
  expect(handle.close).not.toHaveBeenCalled()
  expect(touch(330, 150)).toBe(false)
  expect(handle.close).toHaveBeenCalledTimes(1)
})

it('coordinates rows locally and ignores an old close completion', async () => {
  await render(<Harness />)
  const first = row('a')
  const second = row('b')
  expect(first.handle.close).toHaveBeenCalledTimes(1)
  first.binding.onClose()
  dismiss.close()
  expect(second.handle.close).toHaveBeenCalledTimes(1)
})

it('closes the previous row on a different row touch without claiming a closed row', async () => {
  await render(<Harness />)
  const first = row('a')
  const binding = dismiss.getSwipeCellProps('b')
  binding.onTouchStart(point(0, 0))
  expect(first.handle.close).toHaveBeenCalledTimes(1)
  dismiss.close()
  expect(first.handle.close).toHaveBeenCalledTimes(1)
})

it('ignores delayed measurements after a newer touch, active row change or explicit close', async () => {
  await render(<Harness />)
  const callbacks: Parameters<NonNullable<SwipeCellRef['measure']>>[0][] = []
  const first = row('a', (done) => {
    callbacks.push(done)
  })
  touch(999, 999)
  touch(30, 110)
  callbacks[0]!(0, 0, 300, 60, 20, 100)
  expect(first.handle.close).not.toHaveBeenCalled()
  callbacks[1]!(0, 0, 300, 60, 20, 100)
  touch(999, 999)
  const second = row('b')
  callbacks[2]!(0, 0, 300, 60, 20, 100)
  expect(second.handle.close).not.toHaveBeenCalled()
  dismiss.close()
  expect(second.handle.close).toHaveBeenCalledTimes(1)
})

it('releases recycled row identities and ignores their late events', async () => {
  await render(<Harness />)
  const old = row('same')
  old.binding.ref(null)
  const current = row('same')
  old.binding.onOpenStart()
  old.binding.onClose()
  touch(999, 999)
  expect(old.handle.close).not.toHaveBeenCalled()
  expect(current.handle.close).toHaveBeenCalledTimes(1)
})

it('ignores unavailable geometry and closes the active row when the page unmounts', async () => {
  const view = await render(<Harness />)
  const { handle } = row('a', (done) => done(0, 0, 0, 0, 0, 0))
  expect(touch(999, 999)).toBe(false)
  expect(handle.close).not.toHaveBeenCalled()
  await act(async () => view.unmount())
  expect(handle.close).toHaveBeenCalledTimes(1)
})

it('keeps the expanded row registered through a composed ref handoff', async () => {
  await render(<Harness />)
  const current = row('a')
  current.binding.ref(null)
  current.binding.ref(current.handle)
  await act(async () => Promise.resolve())
  touch(999, 999)
  expect(current.handle.close).toHaveBeenCalledTimes(1)
})

it('keeps page coordinators independent even when they use the same row id', async () => {
  let first!: SwipeCellDismissController
  let second!: SwipeCellDismissController
  function Pages() {
    first = useSwipeCellDismiss()
    second = useSwipeCellDismiss()
    return null
  }
  await render(<Pages />)
  const left = first.getSwipeCellProps('same')
  const right = second.getSwipeCellProps('same')
  const leftHandle: SwipeCellRef = { open: jest.fn(), close: jest.fn() }
  const rightHandle: SwipeCellRef = { open: jest.fn(), close: jest.fn() }
  left.ref(leftHandle)
  right.ref(rightHandle)
  left.onOpenStart()
  right.onOpenStart()
  expect(leftHandle.close).not.toHaveBeenCalled()
  expect(rightHandle.close).not.toHaveBeenCalled()
  first.close()
  expect(leftHandle.close).toHaveBeenCalledTimes(1)
  expect(rightHandle.close).not.toHaveBeenCalled()
  second.close()
  expect(rightHandle.close).toHaveBeenCalledTimes(1)
})
