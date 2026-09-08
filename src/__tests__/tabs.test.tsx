import { ConfigProvider, Tab, Tabs, getDesignToken, getTabsToken } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('Tabs', () => {
  it('exposes Tab through the compound API', () => {
    expect(Tabs.Tab).toBe(Tab)
  })

  it('supports controlled and uncontrolled selection with optional content', async () => {
    const controlledChange = jest.fn()
    const uncontrolledChange = jest.fn()

    await render(
      <>
        <Tabs testID="controlled" value="message" onChange={controlledChange}>
          <Tab testID="controlled-notice" name="notice" title="通知">
            <Text>通知内容</Text>
          </Tab>
          <Tab testID="controlled-message" name="message" title="消息">
            <Text>消息内容</Text>
          </Tab>
        </Tabs>
        <Tabs defaultValue="second" onChange={uncontrolledChange}>
          <Tab testID="uncontrolled-first" name="first" title="第一项" />
          <Tab testID="uncontrolled-second" name="second" title="第二项" />
        </Tabs>
      </>,
    )

    expect(screen.getByTestId('controlled-message').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByText('消息内容')).toBeTruthy()
    expect(screen.queryByText('通知内容')).toBeNull()
    expect(screen.getByTestId('uncontrolled-second').props.accessibilityState?.selected).toBe(true)

    await press(screen.getByTestId('uncontrolled-first'))
    expect(uncontrolledChange).toHaveBeenCalledWith('first')
    expect(screen.getByTestId('uncontrolled-first').props.accessibilityState?.selected).toBe(true)

    await press(screen.getByTestId('controlled-notice'))
    expect(controlledChange).toHaveBeenCalledWith('notice')
    expect(screen.getByTestId('controlled-message').props.accessibilityState?.selected).toBe(true)
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
    expect(getTabsToken(getDesignToken()).activeColor).toBe(getDesignToken().colorPrimary)
  })
})
