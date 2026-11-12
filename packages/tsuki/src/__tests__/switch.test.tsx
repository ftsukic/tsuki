import * as Reanimated from 'react-native-reanimated'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { ConfigProvider, Switch, getDesignToken, getSwitchToken } from '..'
import { getSwitchDimensions, getSwitchTranslateX } from '../switch/style'

function press(testID: string) {
  return fireEvent.press(screen.getByTestId(testID))
}

function layout(testID: string, width: number, height: number, x = 0) {
  return fireEvent(screen.getByTestId(testID), 'layout', {
    nativeEvent: { layout: { x, y: 0, width, height } },
  })
}

describe('Switch', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('supports uncontrolled defaultValue and emits the next value', async () => {
    const onChange = jest.fn()

    await render(<Switch defaultValue onChange={onChange} testID="switch" />)

    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch')
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)

    await press('switch')

    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('keeps controlled value until the parent updates it', async () => {
    const onChange = jest.fn()
    const view = await render(<Switch onChange={onChange} testID="switch" value={false} />)

    await press('switch')

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)

    await view.rerender(<Switch onChange={onChange} testID="switch" value />)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)
  })

  it('blocks disabled and loading switches', async () => {
    const onPress = jest.fn()
    const onChange = jest.fn()
    const beforeChange = jest.fn(() => true)

    await render(
      <>
        <Switch
          beforeChange={beforeChange}
          disabled
          onChange={onChange}
          onPress={onPress}
          testID="disabled"
        />
        <Switch
          beforeChange={beforeChange}
          loading
          onChange={onChange}
          onPress={onPress}
          testID="loading"
        />
      </>,
    )

    await press('disabled')
    await press('loading')

    expect(onPress).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(beforeChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled').props.accessibilityState).toMatchObject({
      checked: false,
      disabled: true,
    })
    expect(screen.getByTestId('loading').props.accessibilityState).toMatchObject({
      busy: true,
      checked: false,
      disabled: true,
    })
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('cancels a transition when beforeChange returns false', async () => {
    const beforeChange = jest.fn(() => false)
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')

    expect(beforeChange).toHaveBeenCalledWith(true)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('waits for an async beforeChange result before updating', async () => {
    let resolve: ((allowed: boolean) => void) | undefined
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((nextResolve) => {
          resolve = nextResolve
        }),
    )
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')
    expect(onChange).not.toHaveBeenCalled()

    await act(async () => {
      resolve?.(true)
      await Promise.resolve()
    })

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)
  })

  it('commits only the latest rapid async beforeChange request', async () => {
    const resolvers: Array<(allowed: boolean) => void> = []
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')
    await press('switch')
    expect(resolvers).toHaveLength(2)

    await act(async () => {
      resolvers[1](true)
      await Promise.resolve()
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)

    await act(async () => {
      resolvers[0](true)
      await Promise.resolve()
    })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('does not commit an older async request after the latest request is denied', async () => {
    const resolvers: Array<(allowed: boolean) => void> = []
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)

    await press('switch')
    await press('switch')

    await act(async () => {
      resolvers[1](false)
      await Promise.resolve()
      resolvers[0](true)
      await Promise.resolve()
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('invalidates an async request after a controlled value update', async () => {
    let resolve!: (allowed: boolean) => void
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((nextResolve) => {
          resolve = nextResolve
        }),
    )
    const onChange = jest.fn()
    const view = await render(
      <Switch beforeChange={beforeChange} onChange={onChange} testID="switch" value={false} />,
    )

    await press('switch')
    await view.rerender(
      <Switch beforeChange={beforeChange} onChange={onChange} testID="switch" value />,
    )

    await act(async () => {
      resolve(true)
      await Promise.resolve()
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(true)
  })

  it('ignores a rejected async beforeChange result', async () => {
    let reject!: (reason?: unknown) => void
    const beforeChange = jest.fn(
      () =>
        new Promise<boolean>((_, nextReject) => {
          reject = nextReject
        }),
    )
    const onChange = jest.fn()

    await render(<Switch beforeChange={beforeChange} onChange={onChange} testID="switch" />)
    await press('switch')

    await act(async () => {
      reject(new Error('rejected'))
      await Promise.resolve()
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('switch').props.accessibilityState?.checked).toBe(false)
  })

  it('maps custom active and inactive values', async () => {
    const onChange = jest.fn()

    await render(
      <Switch
        activeValue="on"
        defaultValue="off"
        inactiveValue="off"
        onChange={onChange}
        testID="switch"
      />,
    )

    await press('switch')
    await press('switch')

    expect(onChange).toHaveBeenNthCalledWith(1, 'on')
    expect(onChange).toHaveBeenNthCalledWith(2, 'off')
  })

  it('uses tokenized named sizes and numeric switch geometry', () => {
    const themeToken = getDesignToken()
    const token = getSwitchToken(themeToken)

    expect(getSwitchDimensions(token, 'small')).toEqual({ height: 20, width: 32 })
    expect(getSwitchDimensions(token, 'medium')).toEqual({ height: 24, width: 44 })
    expect(getSwitchDimensions(token, 'large')).toEqual({ height: 32, width: 52 })
    expect(getSwitchDimensions(token, 24)).toEqual({ height: 24, width: 48 })
    expect(getSwitchTranslateX(token, { height: 24, width: 48 })).toBe(24)
  })

  it('applies themed colors and pressed interaction styles', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Switch: { activeColor: '#123456', inactiveColor: '#654321' },
          },
        }}
      >
        <Switch testID="switch" testOnly_pressed />
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('switch-track').props.style)).toMatchObject({
      backgroundColor: 'rgba(101, 67, 33, 1)',
      height: 24,
      width: 44,
    })

    expect(StyleSheet.flatten(screen.getByTestId('switch').props.style).opacity).toBe(
      getSwitchToken(getDesignToken()).pressedOpacity,
    )
  })

  it('animates state changes with the component motion token', async () => {
    const timing = jest.spyOn(Reanimated, 'withTiming')
    const spring = jest.spyOn(Reanimated, 'withSpring')
    await render(<Switch testID="switch" />)
    await press('switch')

    expect(timing).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        duration: getSwitchToken(getDesignToken()).animationDuration,
        easing: expect.any(Function),
      }),
      undefined,
    )
    expect(spring).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ damping: 20, stiffness: 240, mass: 1 }),
      undefined,
    )
  })
  it.each(['disabled', 'loading'] as const)(
    'invalidates confirmation when %s becomes true',
    async (flag) => {
      let resolve!: (allowed: boolean) => void
      const beforeChange = () =>
        new Promise<boolean>((next) => {
          resolve = next
        })
      const onChange = jest.fn()
      const view = await render(
        <Switch testID="switch" beforeChange={beforeChange} onChange={onChange} />,
      )
      await press('switch')
      await view.rerender(
        <Switch
          testID="switch"
          beforeChange={beforeChange}
          onChange={onChange}
          {...{ [flag]: true }}
        />,
      )
      await view.rerender(
        <Switch testID="switch" beforeChange={beforeChange} onChange={onChange} />,
      )
      await act(async () => {
        resolve(true)
        await Promise.resolve()
      })
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(false)
    },
  )

  it('invalidates confirmation even when the controlled value returns to its source', async () => {
    let resolve!: (allowed: boolean) => void
    const beforeChange = () =>
      new Promise<boolean>((next) => {
        resolve = next
      })
    const onChange = jest.fn()
    const props = { testID: 'switch', beforeChange, onChange }
    const view = await render(<Switch {...props} value={false} />)
    await press('switch')
    await view.rerender(<Switch {...props} value />)
    await view.rerender(<Switch {...props} value={false} />)
    await act(async () => {
      resolve(true)
      await Promise.resolve()
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it.each(['activeValue', 'inactiveValue'] as const)(
    'invalidates confirmation when %s changes',
    async (name) => {
      let resolve!: (allowed: boolean) => void
      const beforeChange = () =>
        new Promise<boolean>((next) => {
          resolve = next
        })
      const onChange = jest.fn()
      const props = {
        testID: 'switch',
        beforeChange,
        onChange,
        activeValue: 'on',
        inactiveValue: 'off',
        defaultValue: 'off',
      }
      const view = await render(<Switch {...props} />)
      await press('switch')
      await view.rerender(<Switch {...props} {...{ [name]: 'changed' }} />)
      await act(async () => {
        resolve(true)
        await Promise.resolve()
      })
      expect(onChange).not.toHaveBeenCalled()
    },
  )

  it('uses the latest callback after confirmation', async () => {
    let resolve!: (allowed: boolean) => void
    const beforeChange = () =>
      new Promise<boolean>((next) => {
        resolve = next
      })
    const oldChange = jest.fn()
    const newChange = jest.fn()
    const view = await render(
      <Switch testID="switch" beforeChange={beforeChange} onChange={oldChange} />,
    )
    await press('switch')
    await view.rerender(<Switch testID="switch" beforeChange={beforeChange} onChange={newChange} />)
    await act(async () => {
      resolve(true)
      await Promise.resolve()
    })
    expect(oldChange).not.toHaveBeenCalled()
    expect(newChange).toHaveBeenCalledWith(true)
  })

  it('does not commit confirmation after unmount', async () => {
    let resolve!: (allowed: boolean) => void
    const onChange = jest.fn()
    const view = await render(
      <Switch
        testID="switch"
        beforeChange={() =>
          new Promise<boolean>((next) => {
            resolve = next
          })
        }
        onChange={onChange}
      />,
    )
    await press('switch')
    await view.unmount()
    await act(async () => {
      resolve(true)
      await Promise.resolve()
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it.each([0, -10, NaN, Infinity])(
    'falls back to medium for invalid numeric size %s',
    async (size) => {
      await render(<Switch size={size} />)
      expect(StyleSheet.flatten(screen.getByTestId('switch-track').props.style)).toMatchObject({
        width: 44,
        height: 24,
      })
    },
  )

  it('keeps semantic background overrides inside the animated style', async () => {
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value as never)
    const view = await render(
      <Switch testID="switch" styles={{ track: { backgroundColor: 'red' } }} />,
    )
    const track = () => screen.getByTestId('switch-track')
    expect(track().props.style[1].backgroundColor).toBe('red')
    await press('switch')
    expect(track().props.style[1].backgroundColor).toBe('red')
    await view.rerender(
      <Switch
        testID="switch"
        styles={({ state }) => ({ track: { backgroundColor: state.active ? 'green' : 'blue' } })}
      />,
    )
    expect(track().props.style[1].backgroundColor).toBe('green')
    await press('switch')
    expect(track().props.style[1].backgroundColor).toBe('blue')
    await view.rerender(<Switch testID="switch" />)
    expect(track().props.style[1].backgroundColor).toBe(
      Reanimated.interpolateColor(
        0,
        [0, 1],
        [
          getSwitchToken(getDesignToken()).inactiveColor,
          getSwitchToken(getDesignToken()).activeColor,
        ],
      ),
    )
  })

  it('resolves root precedence and pressed function styles', async () => {
    await render(
      <Switch
        testOnly_pressed
        style={{ margin: 12 }}
        styles={({ state }) => ({
          root: { margin: 4 },
          indicator: { backgroundColor: state.pressed ? 'red' : 'white' },
        })}
        testID="switch"
      />,
    )
    expect(StyleSheet.flatten(screen.getByTestId('switch').props.style).margin).toBe(12)
    expect(StyleSheet.flatten(screen.getByTestId('switch-thumb').props.style).backgroundColor).toBe(
      'red',
    )
  })

  it('uses numeric semantic dimensions and preserves indicator transforms', async () => {
    await render(
      <Switch
        defaultValue
        styles={{
          track: { width: 80, height: 32 },
          indicator: { width: 28, height: 28, transform: [{ scale: 0.9 }] },
        }}
      />,
    )
    expect(StyleSheet.flatten(screen.getByTestId('switch-thumb').props.style).transform).toEqual([
      { translateX: 48 },
      { scale: 0.9 },
    ])
  })

  it('updates travel from actual layout without measuring the animated transform', async () => {
    await render(
      <Switch defaultValue styles={{ track: { width: '100%' }, indicator: { width: '25%' } }} />,
    )
    await layout('switch-track', 100, 32)
    await layout('switch-thumb', 25, 28, 2)
    expect(StyleSheet.flatten(screen.getByTestId('switch-thumb').props.style).transform).toEqual([
      { translateX: 71 },
    ])
    await layout('switch-track', 120, 32)
    expect(StyleSheet.flatten(screen.getByTestId('switch-thumb').props.style).transform).toEqual([
      { translateX: 91 },
    ])
  })
})
