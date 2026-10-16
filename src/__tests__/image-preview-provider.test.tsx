import React, { useContext, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { act, render, screen } from '@testing-library/react-native'
import { ImagePreview } from '../image-preview'
import { ImagePreviewSourcesContext } from '../image-preview/context'
import type { ImagePreviewSourcesContextValue } from '../image-preview/context'
import { PortalContext, PortalDestinationContext } from '../portal/context'
import type { PortalMethods } from '../portal/types'

let sources: ImagePreviewSourcesContextValue
function Probe() {
  sources = useContext(ImagePreviewSourcesContext)!
  return null
}
function Source({ id = 'a', disabled }: { id?: string; disabled?: boolean }) {
  return (
    <ImagePreview.Source
      imageId={id}
      disabled={disabled}
      testID="thumbnail"
      style={{ width: 80, height: 120, opacity: 0.8 }}
      accessibilityLabel="Message image"
    >
      <Text>Image content</Text>
    </ImagePreview.Source>
  )
}
function Tree({
  id = 'a',
  mounted = true,
  disabled,
}: {
  id?: string
  mounted?: boolean
  disabled?: boolean
}) {
  return (
    <ImagePreview.Provider>
      <Probe />
      {mounted ? <Source id={id} disabled={disabled} /> : null}
    </ImagePreview.Provider>
  )
}

it('registers an ordinary thumbnail without a Portal backend or an overlay', async () => {
  const measure = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(20, 100, 80, 120))
  try {
    await render(<Tree />)
    expect(await sources.measure('a')).toEqual({ x: 20, y: 100, width: 80, height: 120 })
    expect(await sources.measure('missing')).toBeNull()
    expect(sources.rootDestination).toBeNull()
    expect(sources.rootManager).toBeNull()
    expect(screen.getByTestId('thumbnail')).toHaveStyle({ width: 80, height: 120, opacity: 0.8 })
  } finally {
    measure.mockRestore()
  }
})

it('excludes an offscreen or clipped thumbnail from destinations while retaining its content', async () => {
  const measure = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(20, 100, 80, 120))
  try {
    const view = await render(<Tree disabled />)
    expect(await sources.measure('a')).toBeNull()
    expect(measure).not.toHaveBeenCalled()
    expect(screen.getByText('Image content')).toBeTruthy()
    expect(screen.getByTestId('thumbnail')).toHaveStyle({ width: 80, height: 120 })
    await view.rerender(<Tree />)
    expect(await sources.measure('a')).toEqual({ x: 20, y: 100, width: 80, height: 120 })
    await view.rerender(<Tree disabled />)
    expect(await sources.measure('a')).toBeNull()
    expect(measure).toHaveBeenCalledTimes(1)
  } finally {
    measure.mockRestore()
  }
})

it('hides the source without moving, remounting, or resizing its children', async () => {
  const mounted = jest.fn()
  const unmounted = jest.fn()
  function Content() {
    useEffect(() => {
      mounted()
      return unmounted
    }, [])
    return <Text>Persistent image</Text>
  }
  await render(
    <ImagePreview.Provider>
      <Probe />
      <ImagePreview.Source imageId="a" testID="source" style={{ width: 80, height: 120 }}>
        <Content />
      </ImagePreview.Source>
    </ImagePreview.Provider>,
  )
  const owner = Symbol('viewer')
  await act(() => sources.hide(owner, 'a'))
  const hidden = screen.getByTestId('source', { includeHiddenElements: true })
  expect(hidden).toHaveStyle({ opacity: 0, width: 80, height: 120 })
  expect(hidden.props.pointerEvents).toBe('none')
  expect(hidden.props.accessibilityElementsHidden).toBe(true)
  expect(hidden.props.importantForAccessibility).toBe('no-hide-descendants')
  expect(mounted).toHaveBeenCalledTimes(1)
  expect(unmounted).not.toHaveBeenCalled()

  await act(() => sources.hide(owner, null))
  expect(screen.getByTestId('source')).toHaveStyle({ width: 80, height: 120 })
  expect(StyleSheet.flatten(screen.getByTestId('source').props.style).opacity).toBeUndefined()
  expect(screen.getByText('Persistent image')).toBeTruthy()
  expect(mounted).toHaveBeenCalledTimes(1)
  expect(unmounted).not.toHaveBeenCalled()
})

it('keeps independently owned hiding until every viewer releases the source', async () => {
  await render(<Tree />)
  const first = Symbol('first')
  const second = Symbol('second')
  await act(() => {
    sources.hide(first, 'a')
    sources.hide(second, 'a')
    sources.hide(first, 'a')
  })
  expect(sources.isHidden('a')).toBe(true)
  await act(() => sources.hide(first, null))
  expect(sources.isHidden('a')).toBe(true)
  await act(() => sources.hide(second, null))
  expect(sources.isHidden('a')).toBe(false)
  expect(screen.getByTestId('thumbnail')).toHaveStyle({ opacity: 0.8 })
})

it('notifies only subscriptions for an id whose visibility changes', async () => {
  await render(<Tree />)
  const owner = Symbol('viewer')
  const a = jest.fn()
  const b = jest.fn()
  const unsubscribeA = sources.subscribe('a', a)
  const unsubscribeB = sources.subscribe('b', b)
  await act(() => sources.hide(owner, 'a'))
  expect(a).toHaveBeenCalledTimes(1)
  expect(b).not.toHaveBeenCalled()
  await act(() => sources.hide(owner, 'a'))
  expect(a).toHaveBeenCalledTimes(1)
  await act(() => sources.hide(owner, 'b'))
  expect(a).toHaveBeenCalledTimes(2)
  expect(b).toHaveBeenCalledTimes(1)
  expect(sources.isHidden('a')).toBe(false)
  expect(sources.isHidden('b')).toBe(true)
  unsubscribeA()
  unsubscribeB()
  await act(() => sources.hide(owner, null))
  expect(b).toHaveBeenCalledTimes(1)
})

it('captures the root portal destination before descendants introduce another host', async () => {
  const rootDestination = { backend: undefined, hostName: 'root' }
  const rootManager: PortalMethods = { mount: jest.fn(), update: jest.fn(), unmount: jest.fn() }
  const nestedManager: PortalMethods = { mount: jest.fn(), update: jest.fn(), unmount: jest.fn() }
  await render(
    <PortalContext.Provider value={rootManager}>
      <PortalDestinationContext.Provider value={rootDestination}>
        <ImagePreview.Provider>
          <PortalContext.Provider value={nestedManager}>
            <PortalDestinationContext.Provider value={{ backend: undefined, hostName: 'nested' }}>
              <Probe />
              <Source />
            </PortalDestinationContext.Provider>
          </PortalContext.Provider>
        </ImagePreview.Provider>
      </PortalDestinationContext.Provider>
    </PortalContext.Provider>,
  )
  expect(sources.rootDestination).toEqual(rootDestination)
  expect(sources.rootManager).toBe(rootManager)
  expect(rootManager.mount).not.toHaveBeenCalled()
  expect(nestedManager.mount).not.toHaveBeenCalled()
})

it('does not restore the old id or apply its measurement after a message cell is recycled', async () => {
  const callbacks: Parameters<View['measureInWindow']>[0][] = []
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => {
    callbacks.push(callback)
  })
  try {
    const view = await render(<Tree />)
    const owner = Symbol('viewer')
    await act(() => sources.hide(owner, 'a'))
    const pending = sources.measure('a')
    await view.rerender(<Tree id="b" />)
    expect(await pending).toBeNull()
    expect(await sources.measure('a')).toBeNull()
    expect(screen.getByTestId('thumbnail')).toHaveStyle({ opacity: 0.8 })
    const next = sources.measure('b')
    callbacks[0](20, 100, 80, 120)
    callbacks[1](50, 150, 100, 140)
    expect(await next).toEqual({ x: 50, y: 150, width: 100, height: 140 })
    expect(sources.isHidden('a')).toBe(true)
    await act(() => sources.hide(owner, null))
  } finally {
    measure.mockRestore()
  }
})

it('invalidates pending measurements when the source is unmounted without releasing viewer ownership', async () => {
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(() => {})
  try {
    const view = await render(<Tree />)
    const owner = Symbol('viewer')
    await act(() => sources.hide(owner, 'a'))
    const pending = sources.measure('a')
    await view.rerender(<Tree mounted={false} />)
    expect(await pending).toBeNull()
    expect(sources.isHidden('a')).toBe(true)
    expect(await sources.measure('a')).toBeNull()
    await view.rerender(<Tree />)
    expect(screen.getByTestId('thumbnail', { includeHiddenElements: true })).toHaveStyle({
      opacity: 0,
    })
    await act(() => sources.hide(owner, null))
    expect(screen.getByTestId('thumbnail')).toHaveStyle({ opacity: 0.8 })
  } finally {
    measure.mockRestore()
  }
})

it('does not let an older registration remove a newer source with the same id', async () => {
  await render(<Tree mounted={false} />)
  let firstCallback!: Parameters<View['measureInWindow']>[0]
  const first = {
    measureInWindow: (callback: Parameters<View['measureInWindow']>[0]) => {
      firstCallback = callback
    },
  } as View
  const second = {
    measureInWindow: (callback: Parameters<View['measureInWindow']>[0]) => callback(1, 2, 30, 40),
  } as View
  const releaseFirst = sources.register('a', { current: first })
  const pending = sources.measure('a')
  const releaseSecond = sources.register('a', { current: second })
  releaseFirst()
  firstCallback(10, 20, 80, 120)
  expect(await pending).toBeNull()
  expect(await sources.measure('a')).toEqual({ x: 1, y: 2, width: 30, height: 40 })
  releaseSecond()
  expect(await sources.measure('a')).toBeNull()
})

it('times out a missing native measurement callback and safely ignores a late response', async () => {
  let callback!: Parameters<View['measureInWindow']>[0]
  const measure = jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((next) => {
    callback = next
  })
  try {
    await render(<Tree />)
    jest.useFakeTimers()
    const pending = sources.measure('a')
    jest.advanceTimersByTime(150)
    expect(await pending).toBeNull()
    callback(20, 100, 80, 120)
    expect(await pending).toBeNull()
    expect(jest.getTimerCount()).toBe(0)
  } finally {
    jest.useRealTimers()
    measure.mockRestore()
  }
})

it.each([
  [0, 0, 0, 120],
  [0, 0, 80, -1],
  [Number.NaN, 0, 80, 120],
  [0, Number.POSITIVE_INFINITY, 80, 120],
])('rejects invalid source geometry (%s, %s, %s, %s)', async (x, y, width, height) => {
  const measure = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(x, y, width, height))
  try {
    await render(<Tree />)
    expect(await sources.measure('a')).toBeNull()
  } finally {
    measure.mockRestore()
  }
})

it('measures the source and its clipping viewport independently in window coordinates', async () => {
  await render(<Tree mounted={false} />)
  const thumbnail = {
    measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
      callback(20, 80, 90, 120),
  }
  const viewport = {
    measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
      callback(10, 140, 380, 500),
  }
  const release = sources.register(
    'edge',
    { current: thumbnail as unknown as View },
    { current: viewport as unknown as View },
  )
  expect(await sources.measure('edge')).toEqual({
    x: 20,
    y: 80,
    width: 90,
    height: 120,
    clip: { x: 10, y: 140, width: 380, height: 500 },
  })
  release()
})
