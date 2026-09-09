import { render, screen } from '@testing-library/react-native'
import { Animated, StyleSheet, View } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'
import { ConfigProvider, Progress } from '..'

function findNode(
  node: JsonNode | null,
  predicate: (element: JsonElement) => boolean,
): JsonElement | undefined {
  if (!node || typeof node === 'string') return undefined
  if (predicate(node)) return node

  for (const child of node.children) {
    const found = findNode(child, predicate)
    if (found) return found
  }

  return undefined
}

function renderWithoutMotion(children: React.ReactNode) {
  return render(<ConfigProvider theme={{ token: { motion: false } }}>{children}</ConfigProvider>)
}

describe('Progress', () => {
  it('renders the normalized percentage and progressbar value', async () => {
    await renderWithoutMotion(<Progress percentage={60} />)

    expect(screen.getByText('60%')).toBeTruthy()
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 60,
    })
  })

  it('clamps percentages above 100', async () => {
    await renderWithoutMotion(<Progress percentage={140} />)

    expect(screen.getByText('100%')).toBeTruthy()
    expect(screen.queryByText('140%')).toBeNull()
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100)
  })

  it('switches between line and circle render structures', async () => {
    const view = await renderWithoutMotion(<Progress percentage={40} />)

    expect(findNode(view.toJSON(), (node) => node.props.strokeDasharray)).toBeUndefined()

    await view.rerender(
      <ConfigProvider theme={{ token: { motion: false } }}>
        <Progress percentage={40} type="circle" />
      </ConfigProvider>,
    )

    expect(findNode(view.toJSON(), (node) => node.props.strokeDasharray)).toBeTruthy()
  })

  it('supports hiding and customizing pivot text', async () => {
    const view = await renderWithoutMotion(
      <View>
        <Progress percentage={30} showPivot={false} />
        <Progress percentage={30} pivotText="同步中" />
      </View>,
    )

    expect(screen.queryByText('30%')).toBeNull()
    expect(screen.getByText('同步中')).toBeTruthy()
    const pivot = screen.getByText('同步中').parent
    expect(StyleSheet.flatten(pivot?.props.style)).toMatchObject({
      backgroundColor: '#1989FA',
    })
    expect(findNode(view.toJSON(), (node) => node.props.strokeDasharray)).toBeUndefined()
  })

  it('renders the circle pivot in the center when enabled', async () => {
    await renderWithoutMotion(<Progress percentage={25} pivotText="1/4" showPivot type="circle" />)

    expect(screen.getByText('1/4')).toBeTruthy()
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('derives line styles from Progress component tokens', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            Progress: {
              progress_color: '#7232DD',
              progress_height: 8,
              progress_track_color: '#F0E8FF',
            },
          },
        }}
      >
        <Progress percentage={50} />
      </ConfigProvider>,
    )

    const track = findNode(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style)
      return style?.height === 8 && style.backgroundColor === '#F0E8FF'
    })
    const portion = findNode(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style)
      return style?.height === '100%' && style.backgroundColor === '#7232DD'
    })

    expect(track).toBeTruthy()
    expect(portion).toBeTruthy()
  })

  it('animates percentage updates with the Progress token duration', async () => {
    const timing = jest.spyOn(Animated, 'timing')
    const view = await render(
      <ConfigProvider
        theme={{
          components: { Progress: { progress_animation_duration: 240 } },
        }}
      >
        <Progress percentage={20} />
      </ConfigProvider>,
    )

    expect(timing).not.toHaveBeenCalled()

    await view.rerender(
      <ConfigProvider
        theme={{
          components: { Progress: { progress_animation_duration: 240 } },
        }}
      >
        <Progress percentage={80} />
      </ConfigProvider>,
    )

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 240,
        easing: expect.any(Function),
        toValue: 80,
        useNativeDriver: false,
      }),
    )
    await view.unmount()
    timing.mockRestore()
  })

  it('renders the animated circle percentage after an update', async () => {
    const timing = jest.spyOn(Animated, 'timing').mockImplementation((value, config) => {
      const animation = {
        reset: jest.fn(),
        start: jest.fn(() => {
          ;(value as unknown as { setValue: (nextValue: number) => void }).setValue(
            config.toValue as number,
          )
        }),
        stop: jest.fn(),
      }
      return animation as unknown as Animated.CompositeAnimation
    })
    const view = await render(
      <ConfigProvider>
        <Progress percentage={20} type="circle" />
      </ConfigProvider>,
    )

    expect(screen.getByText('20%')).toBeTruthy()

    await view.rerender(
      <ConfigProvider>
        <Progress percentage={80} type="circle" />
      </ConfigProvider>,
    )

    expect(screen.getByText('80%')).toBeTruthy()
    await view.unmount()
    timing.mockRestore()
  })
})
