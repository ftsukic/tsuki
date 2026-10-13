import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ConfigProvider,
  DropdownItem,
  DropdownMenu,
  getDesignToken,
  PortalHost,
  useBackgroundScrollLocked,
} from '..'
import type { DropdownItemRef, DropdownMenuRef } from '..'

function AppProvider({
  children,
  theme,
}: {
  children?: ReactNode
  theme?: Parameters<typeof ConfigProvider>[0]['theme']
}) {
  return (
    <ConfigProvider theme={{ seed: { motion: false }, ...theme }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  // RNTL 14 events are async; the lint rule still assumes the older synchronous API.
  // eslint-disable-next-line testing-library/no-await-sync-events
  await fireEvent.press(target)
}

function getIconFill(testID: string) {
  const icon = screen.getByTestId(testID, { includeHiddenElements: true })
  return icon.props.fill
}

describe('Dropdown', () => {
  afterEach(async () => {
    await cleanup()
    jest.restoreAllMocks()
  })

  it('refreshes open semantic styles, theme and selection behavior without reopening', async () => {
    const options = [
      { text: 'A', value: 'a' },
      { text: 'B', value: 'b' },
    ]
    const onOpen = jest.fn()
    const onChange = jest.fn()
    const content = (accent: string, closeOnSelect: boolean) => (
      <AppProvider>
        <DropdownMenu activeColor={accent}>
          <DropdownItem
            defaultValue="a"
            options={options}
            onOpen={onOpen}
            onChange={onChange}
            closeOnSelect={closeOnSelect}
            styles={{
              title: { fontSize: 20 },
              arrow: { marginLeft: 20 },
              popup: {
                root: { padding: 12 },
                listItemLabel: { color: accent },
                listItemIcon: { width: 20 },
                listItemSelectedIcon: { width: 30 },
              },
            }}
          />
        </DropdownMenu>
      </AppProvider>
    )
    const view = await render(content('#722ed1', true))
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    const panel = screen.getByTestId('dropdown-panel', { includeHiddenElements: true })
    await view.rerender(content('#d4380d', false))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-0-text', { includeHiddenElements: true }).props.style,
      ).color,
    ).toBe('#d4380d')
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }).props.style,
      ).fontSize,
    ).toBe(20)
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-arrow-0', { includeHiddenElements: true }).props.style,
      ).marginLeft,
    ).toBe(20)
    await press(screen.getByTestId('dropdown-option-0-1', { includeHiddenElements: true }))
    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
  })

  it('blocks exiting options and hides them from accessibility during a switch', async () => {
    const animations: Array<() => void> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push(() => callback(true))
      return value
    })
    const onChange = jest.fn()
    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu>
          <DropdownItem options={[{ text: 'A', value: 'a' }]} onChange={onChange} />
          <DropdownItem options={[{ text: 'B', value: 'b' }]} />
        </DropdownMenu>
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => {
      animations[0]()
      animations[1]()
    })
    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    expect(
      screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.pointerEvents,
    ).toBe('none')
    expect(
      screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props
        .importantForAccessibility,
    ).toBe('no-hide-descendants')
    await press(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('uses measured option panel height including semantic padding for exit', async () => {
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value) => value)
    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu>
          <DropdownItem
            options={[{ text: 'A', value: 'a' }]}
            styles={{ popup: { root: { padding: 12 }, listItem: { minHeight: 120 } } }}
          />
        </DropdownMenu>
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () =>
      screen
        .getByTestId('dropdown-panel', { includeHiddenElements: true })
        .props.onLayout({ nativeEvent: { layout: { height: 144 } } }),
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () =>
      screen
        .getByTestId('dropdown-panel', { includeHiddenElements: true })
        .props.onLayout({ nativeEvent: { layout: { height: 145 } } }),
    )
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.style,
      ).transform,
    ).toEqual([{ translateY: -145 }])
  })

  it('restores both channels when reopening and holds the background lock until exit completes', async () => {
    const animations: Array<{ value: number; complete: () => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ value: value as number, complete: () => callback(true) })
      return value
    })
    function Background() {
      const locked = useBackgroundScrollLocked()
      return <View testID="background-lock" accessibilityState={{ disabled: locked }} />
    }
    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <Background />
        <DropdownMenu overlay={false}>
          <DropdownItem options={[{ text: 'A', value: 'a' }]} />
        </DropdownMenu>
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => {
      animations[0].complete()
      animations[1].complete()
    })
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(
      screen.getByTestId('background-lock', { includeHiddenElements: true }).props
        .accessibilityState.disabled,
    ).toBe(true)
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(animations.slice(4).map((animation) => animation.value)).toEqual([1, 1])
    await act(async () => {
      animations[2].complete()
      animations[3].complete()
    })
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()
    await act(async () => {
      animations[4].complete()
      animations[5].complete()
    })
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => {
      animations[6].complete()
      animations[7].complete()
    })
    expect(
      screen.getByTestId('background-lock', { includeHiddenElements: true }).props
        .accessibilityState.disabled,
    ).toBe(false)
  })

  it('keeps measured custom content visible when only its metadata changes', async () => {
    const children = <Text>Custom</Text>
    const content = (color: string) => (
      <AppProvider>
        <DropdownMenu>
          <DropdownItem title="Custom" styles={{ popup: { root: { backgroundColor: color } } }}>
            {children}
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>
    )
    const view = await render(content('red'))
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () =>
      screen
        .getByTestId('dropdown-panel', { includeHiddenElements: true })
        .props.onLayout({ nativeEvent: { layout: { height: 80 } } }),
    )
    await view.rerender(content('blue'))
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      backgroundColor: 'blue',
    })
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.style,
      ).opacity,
    ).not.toBe(0)
    // eslint-disable-next-line testing-library/no-await-sync-events -- RNTL 14 returns a Promise.
    await fireEvent(
      screen.getByTestId('dropdown-panel', { includeHiddenElements: true }),
      'accessibilityEscape',
    )
    await act(async () => undefined)
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it('renders closed options and opens and closes the active item', async () => {
    await render(
      <AppProvider>
        <DropdownMenu>
          <DropdownItem
            defaultValue="default"
            options={[
              { text: '默认排序', value: 'default' },
              { text: '销量优先', value: 'sales' },
            ]}
          />
          <DropdownItem title="筛选">
            <View testID="filter-content">
              <Text>筛选内容</Text>
            </View>
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>,
    )

    expect(screen.getByText('默认排序')).toBeTruthy()
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    expect(
      screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      expanded: true,
    })

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it('preserves keyed item identity when closed items reorder', async () => {
    const menuRef = createRef<DropdownMenuRef>()
    function Reordered() {
      const [reversed, setReversed] = useState(false)
      return (
        <>
          <DropdownMenu ref={menuRef}>
            {reversed
              ? [
                  <DropdownItem key="b" title="B">
                    <Text>面板 B</Text>
                  </DropdownItem>,
                  <DropdownItem key="a" title="A">
                    <Text>面板 A</Text>
                  </DropdownItem>,
                ]
              : [
                  <DropdownItem key="a" title="A">
                    <Text>面板 A</Text>
                  </DropdownItem>,
                  <DropdownItem key="b" title="B">
                    <Text>面板 B</Text>
                  </DropdownItem>,
                ]}
          </DropdownMenu>
          <Text testID="reverse" onPress={() => setReversed(true)}>
            reverse
          </Text>
        </>
      )
    }

    await render(
      <AppProvider>
        <Reordered />
      </AppProvider>,
    )
    await press(screen.getByTestId('reverse', { includeHiddenElements: true }))
    await act(async () => menuRef.current?.open(0))

    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toHaveTextContent(
      '面板 B',
    )
  })

  it('keeps the active keyed item and lifecycle stable when items reorder', async () => {
    const onChange = jest.fn()
    const onOpen = jest.fn()
    const onClose = jest.fn()

    function Reordered() {
      const [reversed, setReversed] = useState(false)
      return (
        <>
          <DropdownMenu onChange={onChange}>
            {reversed
              ? [
                  <DropdownItem key="b" title="B">
                    <Text>面板 B</Text>
                  </DropdownItem>,
                  <DropdownItem key="a" title="A" onOpen={onOpen} onClose={onClose}>
                    <Text>面板 A</Text>
                  </DropdownItem>,
                ]
              : [
                  <DropdownItem key="a" title="A" onOpen={onOpen} onClose={onClose}>
                    <Text>面板 A</Text>
                  </DropdownItem>,
                  <DropdownItem key="b" title="B">
                    <Text>面板 B</Text>
                  </DropdownItem>,
                ]}
          </DropdownMenu>
          <Text testID="active-reverse" onPress={() => setReversed(true)}>
            reverse
          </Text>
        </>
      )
    }

    await render(
      <AppProvider>
        <Reordered />
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await press(screen.getByTestId('active-reverse', { includeHiddenElements: true }))

    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toHaveTextContent(
      '面板 A',
    )
    expect(
      screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      expanded: true,
    })
    expect(
      screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      expanded: false,
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(0)
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes the active item exactly once when it is removed', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ complete: (finished = true) => callback(finished) })
      return value
    })
    const onChange = jest.fn()
    const onClose = jest.fn()
    const onClosed = jest.fn()

    function Removable() {
      const [visible, setVisible] = useState(true)
      return (
        <>
          <DropdownMenu duration={240} onChange={onChange}>
            {visible ? (
              <DropdownItem
                key="a"
                defaultValue="a"
                options={[{ text: 'A', value: 'a' }]}
                onClose={onClose}
                onClosed={onClosed}
              />
            ) : null}
            <DropdownItem key="b" defaultValue="b" options={[{ text: 'B', value: 'b' }]} />
          </DropdownMenu>
          <Text testID="remove-active" onPress={() => setVisible(false)}>
            remove
          </Text>
        </>
      )
    }

    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <Removable />
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => animations.forEach((animation) => animation.complete()))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()

    await press(screen.getByTestId('remove-active', { includeHiddenElements: true }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).not.toHaveBeenCalled()

    await act(async () => animations.slice(2).forEach((animation) => animation.complete()))
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
    expect(
      screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      expanded: false,
    })
  })

  it('blocks a new open after an item becomes disabled', async () => {
    const menuRef = createRef<DropdownMenuRef>()

    function DynamicDisabled() {
      const [disabled, setDisabled] = useState(false)
      return (
        <>
          <DropdownMenu ref={menuRef}>
            <DropdownItem title="A" disabled={disabled}>
              <Text>面板 A</Text>
            </DropdownItem>
          </DropdownMenu>
          <Text testID="disable-item" onPress={() => setDisabled(true)}>
            disable
          </Text>
        </>
      )
    }

    await render(
      <AppProvider>
        <DynamicDisabled />
      </AppProvider>,
    )
    await press(screen.getByTestId('disable-item', { includeHiddenElements: true }))
    await act(async () => menuRef.current?.open(0))

    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it('refreshes active metadata without reopening the popup', async () => {
    const onOpen = jest.fn()
    const onClose = jest.fn()

    function Metadata() {
      const [version, setVersion] = useState<'old' | 'new'>('old')
      const value = version === 'old' ? 'old' : 'new'
      const options = [{ text: version === 'old' ? '旧选项' : '新选项', value }]
      return (
        <>
          <DropdownMenu>
            <DropdownItem
              title={version === 'old' ? '旧标题' : '新标题'}
              value={value}
              options={options}
              onOpen={onOpen}
              onClose={onClose}
            />
          </DropdownMenu>
          <Text testID="refresh-metadata" onPress={() => setVersion('new')}>
            refresh
          </Text>
        </>
      )
    }

    await render(
      <AppProvider>
        <Metadata />
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    const panel = screen.getByTestId('dropdown-panel', { includeHiddenElements: true })
    await press(screen.getByTestId('refresh-metadata', { includeHiddenElements: true }))

    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
    expect(
      screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }),
    ).toHaveTextContent('新标题')
    expect(
      screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true }),
    ).toHaveTextContent('新选项')
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps trigger active state separate from the selected option state', async () => {
    await render(
      <AppProvider>
        <DropdownMenu activeColor="#722ed1">
          <DropdownItem
            defaultValue="default"
            options={[
              { text: '默认排序', value: 'default' },
              { text: '销量优先', value: 'sales' },
              { text: '价格优先', value: 'price' },
            ]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }).props.style,
      ),
    ).not.toMatchObject({
      color: '#722ed1',
    })

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: '#722ed1',
    })
    expect(
      screen.getByTestId('dropdown-arrow-0', { includeHiddenElements: true }).props.style,
    ).toEqual(expect.arrayContaining([expect.objectContaining({ transform: expect.anything() })]))
    expect(
      screen.getByTestId('dropdown-caret-0', { includeHiddenElements: true }).props.style,
    ).toMatchObject({
      borderTopColor: '#722ed1',
    })

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-0-text', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: '#722ed1',
    })
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-1-text', { includeHiddenElements: true }).props.style,
      ),
    ).not.toMatchObject({ color: '#722ed1' })
    expect(
      screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      selected: true,
    })
    expect(
      screen.getByTestId('dropdown-option-0-1', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      selected: false,
    })
    expect(getIconFill('dropdown-option-0-0-check')).toBe('#722ed1')
    expect(
      screen.queryByTestId('dropdown-option-0-1-check', { includeHiddenElements: true }),
    ).toBeNull()
  })

  it('moves selected styles and the trigger title after selecting an option', async () => {
    const onChange = jest.fn()
    await render(
      <AppProvider>
        <DropdownMenu activeColor="#722ed1">
          <DropdownItem
            defaultValue="default"
            onChange={onChange}
            options={[
              { text: '默认排序', value: 'default' },
              { text: '销量优先', value: 'sales' },
            ]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await press(screen.getByTestId('dropdown-option-0-1', { includeHiddenElements: true }))

    expect(onChange).toHaveBeenCalledWith('sales')
    expect(
      screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }),
    ).toHaveTextContent('销量优先')
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-0-text', { includeHiddenElements: true }).props.style,
      ),
    ).not.toMatchObject({ color: '#722ed1' })
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-1-text', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: '#722ed1',
    })
    expect(
      screen.queryByTestId('dropdown-option-0-0-check', { includeHiddenElements: true }),
    ).toBeNull()
    expect(getIconFill('dropdown-option-0-1-check')).toBe('#722ed1')
  })

  it('uses disabled colors for a selected disabled option', async () => {
    await render(
      <AppProvider
        theme={{
          components: {
            Dropdown: { activeColor: '#722ed1', optionDisabledColor: '#999999' },
          },
        }}
      >
        <DropdownMenu>
          <DropdownItem
            defaultValue="locked"
            options={[
              { text: '锁定选项', value: 'locked', disabled: true },
              { text: '可选选项', value: 'available' },
            ]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-option-0-0-text', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: '#999999',
    })
    expect(getIconFill('dropdown-option-0-0-check')).toBe('#999999')
  })

  it('switches items without unmounting the shared overlay', async () => {
    const onChange = jest.fn()
    await render(
      <AppProvider>
        <DropdownMenu onChange={onChange}>
          <DropdownItem title="综合">
            <Text>综合面板</Text>
          </DropdownItem>
          <DropdownItem title="销量">
            <Text>销量面板</Text>
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    const overlay = screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })
    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))

    expect(screen.getByText('销量面板', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBe(overlay)
    expect(onChange).toHaveBeenNthCalledWith(1, 0)
    expect(onChange).toHaveBeenNthCalledWith(2, 1)
  })

  it('runs independent overlay and panel transitions through an item switch', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) {
        animations.push({ complete: (finished = true) => callback(finished) })
      }
      return value
    })
    const lifecycle = {
      aClose: jest.fn(),
      aClosed: jest.fn(),
      aOpen: jest.fn(),
      aOpened: jest.fn(),
      bClose: jest.fn(),
      bClosed: jest.fn(),
      bOpen: jest.fn(),
      bOpened: jest.fn(),
    }

    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem
            defaultValue="a"
            onClose={lifecycle.aClose}
            onClosed={lifecycle.aClosed}
            onOpen={lifecycle.aOpen}
            onOpened={lifecycle.aOpened}
            options={[{ text: 'A', value: 'a' }]}
          />
          <DropdownItem
            defaultValue="b"
            onClose={lifecycle.bClose}
            onClosed={lifecycle.bClosed}
            onOpen={lifecycle.bOpen}
            onOpened={lifecycle.bOpened}
            options={[{ text: 'B', value: 'b' }]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(animations).toHaveLength(2)
    expect(lifecycle.aOpen).toHaveBeenCalledTimes(1)
    await act(async () => animations[0]?.complete())
    expect(lifecycle.aOpened).not.toHaveBeenCalled()
    await act(async () => animations[1]?.complete())
    expect(lifecycle.aOpened).toHaveBeenCalledTimes(1)

    const overlay = screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })
    const panel = screen.getByTestId('dropdown-panel', { includeHiddenElements: true })
    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBe(overlay)
    expect(lifecycle.aClose).toHaveBeenCalledTimes(1)
    expect(lifecycle.bOpen).toHaveBeenCalledTimes(1)
    expect(animations).toHaveLength(3)

    await act(async () => animations[2]?.complete())
    expect(lifecycle.aClosed).toHaveBeenCalledTimes(1)
    expect(lifecycle.bOpened).not.toHaveBeenCalled()
    expect(screen.getByTestId('dropdown-option-1-0', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
    expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBe(overlay)
    expect(animations).toHaveLength(4)

    await act(async () => animations[3]?.complete())
    expect(lifecycle.bOpened).toHaveBeenCalledTimes(1)

    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    expect(lifecycle.bClose).toHaveBeenCalledTimes(1)
    expect(animations).toHaveLength(6)
    await act(async () => animations[4]?.complete())
    await act(async () => animations[5]?.complete())
    expect(lifecycle.bClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it('keeps only the latest pending item during a rapid switch', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ complete: (finished = true) => callback(finished) })
      return value
    })
    const bOpened = jest.fn()
    const cOpened = jest.fn()

    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem defaultValue="a" options={[{ text: '面板 A', value: 'a' }]} />
          <DropdownItem
            defaultValue="b"
            onOpened={bOpened}
            options={[{ text: '面板 B', value: 'b' }]}
          />
          <DropdownItem
            defaultValue="c"
            onOpened={cOpened}
            options={[{ text: '面板 C', value: 'c' }]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())

    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    const overlay = screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })
    await press(screen.getByTestId('dropdown-item-2', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    expect(bOpened).not.toHaveBeenCalled()
    expect(animations).toHaveLength(3)

    await act(async () => animations[2]?.complete())
    expect(screen.getByTestId('dropdown-option-2-0', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBe(overlay)
    expect(animations).toHaveLength(4)
    await act(async () => animations[3]?.complete())
    expect(bOpened).not.toHaveBeenCalled()
    expect(cOpened).toHaveBeenCalledTimes(1)
  })

  it('waits for custom content measurement before switching it in', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ complete: (finished = true) => callback(finished) })
      return value
    })

    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem title="A">
            <View style={{ height: 132 }}>
              <Text>面板 A</Text>
            </View>
          </DropdownItem>
          <DropdownItem title="B">
            <View style={{ height: 88 }}>
              <Text>面板 B</Text>
            </View>
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(animations).toHaveLength(1)
    const panel = screen.getByTestId('dropdown-panel', { includeHiddenElements: true })
    await act(async () => {
      panel.props.onLayout({ nativeEvent: { layout: { height: 132 } } })
      await Promise.resolve()
    })
    expect(animations).toHaveLength(2)
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())

    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    expect(screen.getByText('面板 A', { includeHiddenElements: true })).toBeTruthy()
    expect(animations).toHaveLength(3)
    await act(async () => animations[2]?.complete())
    expect(screen.getByText('面板 B', { includeHiddenElements: true })).toBeTruthy()
    expect(animations).toHaveLength(3)

    await act(async () => {
      screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.onLayout({
        nativeEvent: { layout: { height: 88 } },
      })
      await Promise.resolve()
    })
    expect(animations).toHaveLength(4)
    await act(async () => animations[3]?.complete())
  })

  it('cancels a pending switch when the current item is selected again', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ complete: (finished = true) => callback(finished) })
      return value
    })
    const bOpened = jest.fn()
    const bClosed = jest.fn()

    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem defaultValue="a" options={[{ text: 'A', value: 'a' }]} />
          <DropdownItem
            defaultValue="b"
            onClosed={bClosed}
            onOpened={bOpened}
            options={[{ text: 'B', value: 'b' }]}
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())
    const overlay = screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })

    await press(screen.getByTestId('dropdown-item-1', { includeHiddenElements: true }))
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBe(overlay)
    expect(bOpened).not.toHaveBeenCalled()
    expect(bClosed).not.toHaveBeenCalled()
    expect(animations).toHaveLength(4)

    await act(async () => animations[3]?.complete())
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    expect(bOpened).not.toHaveBeenCalled()
  })

  it('uses Vant-aligned caret geometry and default colors', async () => {
    await render(
      <AppProvider>
        <DropdownMenu>
          <DropdownItem title="排序" options={[{ text: '默认', value: 'default' }]} />
        </DropdownMenu>
      </AppProvider>,
    )

    expect(
      screen.getByTestId('dropdown-caret-0', { includeHiddenElements: true }).props.style,
    ).toMatchObject({
      borderLeftWidth: 4,
      borderRightWidth: 4,
      borderTopColor: getDesignToken().colorText,
      borderTopWidth: 4,
    })
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: getDesignToken().colorText,
    })

    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(
      screen.getByTestId('dropdown-caret-0', { includeHiddenElements: true }).props.style,
    ).toMatchObject({
      borderTopColor: getDesignToken().colorPrimary,
    })
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-title-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: getDesignToken().colorPrimary,
    })
  })

  it('does not add a trigger background flash while pressed', async () => {
    await render(
      <AppProvider>
        <DropdownMenu>
          <DropdownItem title="排序" />
        </DropdownMenu>
      </AppProvider>,
    )

    const item = screen.getByTestId('dropdown-item-0', { includeHiddenElements: true })
    expect(StyleSheet.flatten(item.props.style)).not.toMatchObject({
      backgroundColor: expect.anything(),
    })
  })

  it('preserves the existing panel through motion close', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, _config, callback) => {
      if (callback) animations.push({ complete: (finished = true) => callback(finished) })
      return value
    })
    await render(
      <AppProvider theme={{ seed: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem defaultValue="a" options={[{ text: '面板 A', value: 'a' }]} />
        </DropdownMenu>
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())
    const panel = screen.getByTestId('dropdown-panel', { includeHiddenElements: true })
    await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBe(panel)
    expect(screen.getByTestId('dropdown-option-0-0', { includeHiddenElements: true })).toBeTruthy()
    await act(async () => animations[2]?.complete())
    await act(async () => animations[3]?.complete())
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it('uses non-shrinking trigger widths when swipeThreshold enables scrolling', async () => {
    await render(
      <AppProvider>
        <DropdownMenu swipeThreshold={2}>
          <DropdownItem title="一" />
          <DropdownItem title="二" />
          <DropdownItem title="三" />
        </DropdownMenu>
      </AppProvider>,
    )

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      flexGrow: 0,
      flexShrink: 0,
      width: '50%',
    })
  })

  it('honors overlay behavior, disabled items, disabled options, and closeOnSelect', async () => {
    const onChange = jest.fn()
    const itemOnChange = jest.fn()
    await render(
      <AppProvider>
        <DropdownMenu closeOnPressOverlay={false} overlay onChange={onChange}>
          <DropdownItem
            disabled
            options={[{ text: '不可用', value: 'disabled' }]}
            testID="disabled-item"
          />
          <DropdownItem
            closeOnSelect={false}
            defaultValue="enabled"
            onChange={itemOnChange}
            options={[
              { text: '禁用选项', value: 'disabled', disabled: true },
              { text: '可用选项', value: 'enabled' },
            ]}
            testID="enabled-item"
          />
        </DropdownMenu>
      </AppProvider>,
    )

    await press(screen.getByTestId('disabled-item', { includeHiddenElements: true }))
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()

    await press(screen.getByTestId('enabled-item', { includeHiddenElements: true }))
    await press(screen.getByTestId('dropdown-option-1-0', { includeHiddenElements: true }))
    expect(itemOnChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()

    await press(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true }))
    expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()
  })

  it('updates uncontrolled and controlled values and gives explicit titles precedence', async () => {
    const onChange = jest.fn()
    function Controlled() {
      const [value, setValue] = useState<'one' | 'two'>('one')
      return (
        <>
          <DropdownMenu>
            <DropdownItem
              title="固定标题"
              value={value}
              options={[
                { text: '一', value: 'one' },
                { text: '二', value: 'two' },
              ]}
              onChange={(next) => {
                onChange(next)
                setValue(next as 'one' | 'two')
              }}
              testID="controlled-item"
            />
          </DropdownMenu>
          <Text testID="controlled-value">{value}</Text>
        </>
      )
    }

    await render(
      <AppProvider>
        <Controlled />
      </AppProvider>,
    )

    expect(screen.getByText('固定标题')).toBeTruthy()
    await press(screen.getByTestId('controlled-item', { includeHiddenElements: true }))
    await press(screen.getByTestId('dropdown-option-0-1', { includeHiddenElements: true }))
    expect(onChange).toHaveBeenCalledWith('two')
    expect(
      screen.getByTestId('controlled-value', { includeHiddenElements: true }),
    ).toHaveTextContent('two')
    expect(screen.getByText('固定标题')).toBeTruthy()
  })

  it('supports custom content, refs, direction, lifecycle, theme tokens, and semantic styles', async () => {
    const menuRef = createRef<DropdownMenuRef>()
    const itemRef = createRef<DropdownItemRef>()
    const lifecycle = {
      close: jest.fn(),
      closed: jest.fn(),
      open: jest.fn(),
      opened: jest.fn(),
    }

    await render(
      <AppProvider
        theme={{
          components: { Dropdown: { activeColor: '#722ed1' } },
        }}
      >
        <DropdownMenu
          ref={menuRef}
          direction="up"
          styles={({ state }) => ({
            item: { marginTop: state.active ? 2 : 0 },
            root: { borderWidth: 2 },
          })}
        >
          <DropdownItem
            ref={itemRef}
            title="自定义"
            onOpen={lifecycle.open}
            onOpened={lifecycle.opened}
            onClose={lifecycle.close}
            onClosed={lifecycle.closed}
            styles={({ state }) => ({
              popup: {
                root: { padding: 8 },
                listItemLabel: { fontWeight: state.active ? '700' : '400' },
              },
            })}
          >
            <View testID="custom-content" onLayout={() => undefined}>
              <Text>自定义内容</Text>
            </View>
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>,
    )

    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      marginTop: 0,
    })
    expect(
      screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props
        .accessibilityState,
    ).toMatchObject({
      expanded: false,
    })

    await act(async () => menuRef.current?.open(0))
    expect(screen.getByTestId('custom-content', { includeHiddenElements: true })).toBeTruthy()
    await act(async () => {
      screen.getByTestId('dropdown-panel', { includeHiddenElements: true }).props.onLayout({
        nativeEvent: { layout: { height: 40 } },
      })
      await Promise.resolve()
    })
    expect(lifecycle.open).toHaveBeenCalledTimes(1)
    expect(lifecycle.opened).toHaveBeenCalledTimes(1)
    expect(
      StyleSheet.flatten(
        screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      marginTop: 2,
    })
    expect(StyleSheet.flatten(screen.getByText('自定义').props.style)).toMatchObject({
      color: '#722ed1',
    })

    await act(async () => itemRef.current?.close())
    expect(lifecycle.close).toHaveBeenCalledTimes(1)
    expect(lifecycle.closed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel', { includeHiddenElements: true })).toBeNull()
  })

  it.each(['down', 'up'] as const)(
    'clips the %s panel reveal to its viewport',
    async (direction) => {
      await render(
        <AppProvider>
          <DropdownMenu direction={direction}>
            <DropdownItem title="面板">
              <View style={{ height: 80 }}>
                <Text>面板内容</Text>
              </View>
            </DropdownItem>
          </DropdownMenu>
        </AppProvider>,
      )

      await press(screen.getByTestId('dropdown-item-0', { includeHiddenElements: true }))

      expect(
        StyleSheet.flatten(
          screen.getByTestId('dropdown-panel-viewport', { includeHiddenElements: true }).props
            .style,
        ),
      ).toMatchObject({
        justifyContent: direction === 'up' ? 'flex-end' : 'flex-start',
        overflow: 'hidden',
      })
      expect(screen.getByTestId('dropdown-overlay', { includeHiddenElements: true })).toBeTruthy()
      expect(screen.getByTestId('dropdown-panel', { includeHiddenElements: true })).toBeTruthy()
    },
  )
})
