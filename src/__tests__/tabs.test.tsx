import React from 'react'
import { ConfigProvider, Tab, Tabs, getDesignToken, getTabsToken } from '..'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import * as Reanimated from 'react-native-reanimated'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('Tabs', () => {
  it('exposes Tab through the compound API', () => {
    expect(Tabs.Tab).toBe(Tab)
  })

  it('keeps controlled selection authoritative until the parent writes it back', async () => {
    const controlledChange = jest.fn()

    const view = await render(
      <Tabs testID="controlled" value="message" onChange={controlledChange}>
        <Tab testID="controlled-notice" name="notice" title="通知">
          <Text>通知内容</Text>
        </Tab>
        <Tab testID="controlled-message" name="message" title="消息">
          <Text>消息内容</Text>
        </Tab>
      </Tabs>,
    )

    expect(screen.getByTestId('controlled-message').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByText('消息内容')).toBeTruthy()
    expect(screen.queryByText('通知内容')).toBeNull()

    await press(screen.getByTestId('controlled-notice'))
    expect(controlledChange).toHaveBeenCalledWith('notice')
    expect(screen.getByTestId('controlled-message').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('controlled-notice').props.accessibilityState?.selected).toBe(false)

    await view.rerender(
      <Tabs testID="controlled" value="notice" onChange={controlledChange}>
        <Tab testID="controlled-notice" name="notice" title="通知">
          <Text>通知内容</Text>
        </Tab>
        <Tab testID="controlled-message" name="message" title="消息">
          <Text>消息内容</Text>
        </Tab>
      </Tabs>,
    )
    expect(screen.getByTestId('controlled-notice').props.accessibilityState?.selected).toBe(true)
  })

  it('uses defaultValue only for uncontrolled initialization', async () => {
    const onChange = jest.fn()

    await render(
      <Tabs defaultValue="first" onChange={onChange}>
        <Tab testID="uncontrolled-first" name="first" title="第一项" />
        <Tab testID="uncontrolled-second" name="second" title="第二项" />
      </Tabs>,
    )

    await press(screen.getByTestId('uncontrolled-second'))
    expect(onChange).toHaveBeenCalledWith('second')
    expect(screen.getByTestId('uncontrolled-second').props.accessibilityState?.selected).toBe(true)
  })

  it('falls back from an invalid or disabled defaultValue to the first enabled tab', async () => {
    await render(
      <Tabs defaultValue="missing">
        <Tab disabled name="disabled" title="禁用" />
        <Tab testID="enabled" name="enabled" title="可用" />
      </Tabs>,
    )

    expect(screen.getByTestId('enabled').props.accessibilityState?.selected).toBe(true)
  })

  it('uses the first enabled tab by default and blocks disabled tabs', async () => {
    const onChange = jest.fn()

    await render(
      <Tabs testID="tabs" onChange={onChange}>
        <Tab disabled name="disabled" testID="disabled" title="禁用" />
        <Tab testID="enabled" name="enabled" title="可用">
          <Text>可用内容</Text>
        </Tab>
      </Tabs>,
    )

    expect(screen.getByTestId('enabled').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    await press(screen.getByTestId('disabled'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports card, scrollable navigation and unnamed navigation-only tabs', async () => {
    await render(
      <>
        <Tabs testID="card" type="card">
          <Tab testID="card-first" title="首页" />
          <Tab testID="card-second" title="分类" />
        </Tabs>
        <Tabs testID="scrollable" scrollable>
          {Array.from({ length: 5 }, (_, index) => (
            <Tab key={index} title={`Tab ${index + 1}`} />
          ))}
        </Tabs>
      </>,
    )

    expect(screen.getByTestId('card').props.accessibilityRole).toBe('tablist')
    expect(screen.getByTestId('card-first').props.accessibilityRole).toBe('tab')
    expect(screen.getByTestId('scrollable')).toBeTruthy()
    expect(screen.queryByText('首页内容')).toBeNull()
  })

  it('uses themed dimensions and semantic styles without changing the press contract', async () => {
    const styles = jest.fn(() => ({ root: { marginTop: 3 }, indicator: { height: 4 } }))

    await render(
      <ConfigProvider theme={{ components: { Tabs: { height: 52, indicatorWidth: 48 } } }}>
        <Tabs testID="themed" styles={styles}>
          <Tab name="one" title="一" />
          <Tab name="two" title="二" />
        </Tabs>
      </ConfigProvider>,
    )

    const themedStyle = StyleSheet.flatten(screen.getByTestId('themed').props.style)
    expect(themedStyle).toMatchObject({ marginTop: 3 })
    expect(styles).toHaveBeenCalled()
    expect(getTabsToken(getDesignToken()).indicatorWidth).toBe(40)
    expect(getTabsToken(getDesignToken()).indicatorColor).toBe(getDesignToken().colorPrimary)
  })

  it('uses Vant line-tab colors, weight, indicator and shrink spacing', async () => {
    await render(
      <Tabs shrink testID="shrink-tabs">
        <Tab testID="shrink-first" title="首页" />
        <Tab testID="shrink-second" title="分类" />
      </Tabs>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('shrink-first').props.style)).toMatchObject({
      flex: undefined,
      paddingHorizontal: getDesignToken().paddingXS,
    })
    expect(StyleSheet.flatten(screen.getByText('首页').props.style)).toMatchObject({
      color: getDesignToken().colorText,
      fontWeight: '600',
    })
    expect(StyleSheet.flatten(screen.getByText('分类').props.style)).toMatchObject({
      color: getDesignToken().colorTextSecondary,
      fontWeight: '400',
    })
    expect(getTabsToken(getDesignToken())).toMatchObject({
      indicatorHeight: 3,
      indicatorWidth: 40,
      indicatorColor: getDesignToken().colorPrimary,
    })
    expect(StyleSheet.flatten(screen.getByTestId('tabs-nav').props.style)).toMatchObject({
      borderBottomWidth: 0,
    })
    expect(screen.getByTestId('tabs-nav-scroll').props.contentContainerStyle).toMatchObject({
      paddingHorizontal: getDesignToken().paddingXS,
    })
    expect(StyleSheet.flatten(screen.getByText('首页').props.style)).toMatchObject({
      lineHeight: getDesignToken().lineHeight,
    })
  })

  it('animates controlled pane changes and makes animated=false immediate', async () => {
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })
    const renderTabs = (animated = true, value: 'date' | 'time' = 'date') => (
      <Tabs animated={animated} value={value} onChange={() => undefined}>
        <Tab name="date" title="日期">
          <Text>日期内容</Text>
        </Tab>
        <Tab name="time" title="时间">
          <Text>时间内容</Text>
        </Tab>
      </Tabs>
    )
    const view = await render(renderTabs())
    timing.mockClear()
    await view.rerender(renderTabs(true, 'time'))
    await Promise.resolve()
    expect(timing).toHaveBeenCalled()

    timing.mockClear()
    await view.rerender(renderTabs(false))
    await Promise.resolve()
    expect(timing).not.toHaveBeenCalled()
    timing.mockRestore()
  })

  it('keeps lazy panes mounted after their first activation', async () => {
    const mounts = { first: 0, second: 0 }
    const unmounts = { first: 0, second: 0 }

    function Pane({ name, label }: { name: 'first' | 'second'; label: string }) {
      React.useEffect(() => {
        mounts[name] += 1
        return () => {
          unmounts[name] += 1
        }
      }, [name])
      return <Text>{label}</Text>
    }

    await render(
      <Tabs lazyRender defaultValue="first">
        <Tab name="first" title="第一项">
          <Pane name="first" label="第一项内容" />
        </Tab>
        <Tab name="second" title="第二项">
          <Pane name="second" label="第二项内容" />
        </Tab>
      </Tabs>,
    )

    expect(mounts).toEqual({ first: 1, second: 0 })
    await press(screen.getByRole('tab', { name: '第二项' }))
    expect(mounts).toEqual({ first: 1, second: 1 })
    expect(unmounts).toEqual({ first: 0, second: 0 })
    await press(screen.getByRole('tab', { name: '第一项' }))
    await press(screen.getByRole('tab', { name: '第二项' }))
    expect(mounts).toEqual({ first: 1, second: 1 })
    expect(unmounts).toEqual({ first: 0, second: 0 })
  })

  it('restores a controlled tab after a swipe when the parent does not write back', async () => {
    const onChange = jest.fn()

    await render(
      <Tabs testID="controlled-swipe" value="first" onChange={onChange} swipeable>
        <Tab testID="first" name="first" title="第一项">
          <Text>第一项内容</Text>
        </Tab>
        <Tab testID="second" name="second" title="第二项">
          <Text>第二项内容</Text>
        </Tab>
      </Tabs>,
    )

    await act(async () => {
      screen.getByTestId('controlled-swipe-content').props.onLayout({
        nativeEvent: { layout: { width: 100, height: 44, x: 0, y: 0 } },
      })
    })
    await act(async () => {
      fireGestureHandler(getByGestureTestId('controlled-swipe-content-gesture'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationX: -80 },
        { state: State.END, translationX: -80 },
      ])
    })

    expect(onChange).toHaveBeenCalledWith('second')
    expect(screen.getByTestId('first').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.selected).toBe(false)
  })

  it('restores the active tab when a swipe reaches a disabled tab', async () => {
    const onChange = jest.fn()

    await render(
      <Tabs testID="disabled-swipe" defaultValue="first" onChange={onChange} swipeable>
        <Tab testID="first" name="first" title="第一项">
          <Text>第一项内容</Text>
        </Tab>
        <Tab disabled testID="disabled" name="disabled" title="禁用">
          <Text>禁用内容</Text>
        </Tab>
        <Tab testID="third" name="third" title="第三项">
          <Text>第三项内容</Text>
        </Tab>
      </Tabs>,
    )

    await act(async () => {
      screen.getByTestId('disabled-swipe-content').props.onLayout({
        nativeEvent: { layout: { width: 100, height: 44, x: 0, y: 0 } },
      })
    })
    await act(async () => {
      fireGestureHandler(getByGestureTestId('disabled-swipe-content-gesture'), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationX: -80 },
        { state: State.END, translationX: -80 },
      ])
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('first').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('disabled').props.accessibilityState?.selected).toBe(false)
  })

  it('does not create a content pager for navigation-only tabs', async () => {
    await render(
      <Tabs testID="navigation-only">
        <Tab title="第一项" />
        <Tab title="第二项" />
      </Tabs>,
    )

    expect(screen.getByTestId('navigation-only')).toBeTruthy()
    expect(screen.queryByTestId('navigation-only-content')).toBeNull()
  })
})
