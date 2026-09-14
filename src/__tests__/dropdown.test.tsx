import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { createRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfigProvider, DropdownItem, DropdownMenu, PortalHost } from '..'
import type { DropdownItemRef, DropdownMenuRef } from '..'

function AppProvider({
  children,
  theme,
}: {
  children?: ReactNode
  theme?: Parameters<typeof ConfigProvider>[0]['theme']
}) {
  return (
    <ConfigProvider theme={{ token: { motion: false }, ...theme }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function getIconFill(testID: string) {
  const icon = screen.getByTestId(testID)
  return icon.props.children?.props.children?.[0]?.props.fill
}

describe('Dropdown', () => {
  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
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
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()

    await press(screen.getByTestId('dropdown-item-0'))
    expect(screen.getByTestId('dropdown-panel')).toBeTruthy()
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
    expect(screen.getByTestId('dropdown-item-0').props.accessibilityState).toMatchObject({
      expanded: true,
    })

    await press(screen.getByTestId('dropdown-item-0'))
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
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
    await press(screen.getByTestId('reverse'))
    await act(async () => menuRef.current?.open(0))

    expect(screen.getByTestId('dropdown-panel')).toHaveTextContent('面板 B')
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
    await press(screen.getByTestId('dropdown-item-0'))
    await press(screen.getByTestId('active-reverse'))

    expect(screen.getByTestId('dropdown-panel')).toHaveTextContent('面板 A')
    expect(screen.getByTestId('dropdown-item-1').props.accessibilityState).toMatchObject({
      expanded: true,
    })
    expect(screen.getByTestId('dropdown-item-0').props.accessibilityState).toMatchObject({
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
      <AppProvider theme={{ token: { motion: true } }}>
        <Removable />
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0'))
    await act(async () => animations.forEach((animation) => animation.complete()))
    expect(screen.getByTestId('dropdown-panel')).toBeTruthy()

    await press(screen.getByTestId('remove-active'))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClosed).not.toHaveBeenCalled()

    await act(async () => animations.slice(2).forEach((animation) => animation.complete()))
    expect(onClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
    expect(screen.getByTestId('dropdown-item-0').props.accessibilityState).toMatchObject({
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
    await press(screen.getByTestId('disable-item'))
    await act(async () => menuRef.current?.open(0))

    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
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
    await press(screen.getByTestId('dropdown-item-0'))
    const panel = screen.getByTestId('dropdown-panel')
    await press(screen.getByTestId('refresh-metadata'))

    expect(screen.getByTestId('dropdown-panel')).toBe(panel)
    expect(screen.getByTestId('dropdown-title-0')).toHaveTextContent('新标题')
    expect(screen.getByTestId('dropdown-option-0-0')).toHaveTextContent('新选项')
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
      StyleSheet.flatten(screen.getByTestId('dropdown-title-0').props.style),
    ).not.toMatchObject({
      color: '#722ed1',
    })

    await press(screen.getByTestId('dropdown-item-0'))

    expect(StyleSheet.flatten(screen.getByTestId('dropdown-title-0').props.style)).toMatchObject({
      color: '#722ed1',
    })
    expect(screen.getByTestId('dropdown-arrow-0').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ transform: expect.anything() })]),
    )
    expect(screen.getByTestId('dropdown-caret-0').props.style).toMatchObject({
      borderTopColor: '#722ed1',
    })

    expect(
      StyleSheet.flatten(screen.getByTestId('dropdown-option-0-0-text').props.style),
    ).toMatchObject({ color: '#722ed1' })
    expect(
      StyleSheet.flatten(screen.getByTestId('dropdown-option-0-1-text').props.style),
    ).not.toMatchObject({ color: '#722ed1' })
    expect(screen.getByTestId('dropdown-option-0-0').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByTestId('dropdown-option-0-1').props.accessibilityState).toMatchObject({
      selected: false,
    })
    expect(getIconFill('dropdown-option-0-0-check')).toBe('#722ed1')
    expect(screen.queryByTestId('dropdown-option-0-1-check')).toBeNull()
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

    await press(screen.getByTestId('dropdown-item-0'))
    await press(screen.getByTestId('dropdown-option-0-1'))

    expect(onChange).toHaveBeenCalledWith('sales')
    expect(screen.getByTestId('dropdown-title-0')).toHaveTextContent('销量优先')
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()

    await press(screen.getByTestId('dropdown-item-0'))
    expect(
      StyleSheet.flatten(screen.getByTestId('dropdown-option-0-0-text').props.style),
    ).not.toMatchObject({ color: '#722ed1' })
    expect(
      StyleSheet.flatten(screen.getByTestId('dropdown-option-0-1-text').props.style),
    ).toMatchObject({ color: '#722ed1' })
    expect(screen.queryByTestId('dropdown-option-0-0-check')).toBeNull()
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

    await press(screen.getByTestId('dropdown-item-0'))

    expect(
      StyleSheet.flatten(screen.getByTestId('dropdown-option-0-0-text').props.style),
    ).toMatchObject({ color: '#999999' })
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

    await press(screen.getByTestId('dropdown-item-0'))
    const overlay = screen.getByTestId('dropdown-overlay')
    await press(screen.getByTestId('dropdown-item-1'))

    expect(screen.getByText('销量面板')).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay')).toBe(overlay)
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
      <AppProvider theme={{ token: { motion: true } }}>
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

    await press(screen.getByTestId('dropdown-item-0'))
    expect(animations).toHaveLength(2)
    expect(lifecycle.aOpen).toHaveBeenCalledTimes(1)
    await act(async () => animations[0]?.complete())
    expect(lifecycle.aOpened).not.toHaveBeenCalled()
    await act(async () => animations[1]?.complete())
    expect(lifecycle.aOpened).toHaveBeenCalledTimes(1)

    const overlay = screen.getByTestId('dropdown-overlay')
    const panel = screen.getByTestId('dropdown-panel')
    await press(screen.getByTestId('dropdown-item-1'))
    expect(screen.getByTestId('dropdown-panel')).toBe(panel)
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay')).toBe(overlay)
    expect(lifecycle.aClose).toHaveBeenCalledTimes(1)
    expect(lifecycle.bOpen).toHaveBeenCalledTimes(1)
    expect(animations).toHaveLength(3)

    await act(async () => animations[2]?.complete())
    expect(lifecycle.aClosed).toHaveBeenCalledTimes(1)
    expect(lifecycle.bOpened).not.toHaveBeenCalled()
    expect(screen.getByTestId('dropdown-option-1-0')).toBeTruthy()
    expect(screen.getByTestId('dropdown-panel')).toBe(panel)
    expect(screen.getByTestId('dropdown-overlay')).toBe(overlay)
    expect(animations).toHaveLength(4)

    await act(async () => animations[3]?.complete())
    expect(lifecycle.bOpened).toHaveBeenCalledTimes(1)

    await press(screen.getByTestId('dropdown-item-1'))
    expect(lifecycle.bClose).toHaveBeenCalledTimes(1)
    expect(animations).toHaveLength(6)
    await act(async () => animations[4]?.complete())
    await act(async () => animations[5]?.complete())
    expect(lifecycle.bClosed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
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
      <AppProvider theme={{ token: { motion: true } }}>
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

    await press(screen.getByTestId('dropdown-item-0'))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())

    await press(screen.getByTestId('dropdown-item-1'))
    const overlay = screen.getByTestId('dropdown-overlay')
    await press(screen.getByTestId('dropdown-item-2'))
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
    expect(bOpened).not.toHaveBeenCalled()
    expect(animations).toHaveLength(3)

    await act(async () => animations[2]?.complete())
    expect(screen.getByTestId('dropdown-option-2-0')).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay')).toBe(overlay)
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
      <AppProvider theme={{ token: { motion: true } }}>
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

    await press(screen.getByTestId('dropdown-item-0'))
    expect(animations).toHaveLength(1)
    const panel = screen.getByTestId('dropdown-panel')
    await act(async () => {
      panel.props.onLayout({ nativeEvent: { layout: { height: 132 } } })
      await Promise.resolve()
    })
    expect(animations).toHaveLength(2)
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())

    await press(screen.getByTestId('dropdown-item-1'))
    expect(screen.getByText('面板 A')).toBeTruthy()
    expect(animations).toHaveLength(3)
    await act(async () => animations[2]?.complete())
    expect(screen.getByText('面板 B')).toBeTruthy()
    expect(animations).toHaveLength(3)

    await act(async () => {
      screen.getByTestId('dropdown-panel').props.onLayout({
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
      <AppProvider theme={{ token: { motion: true } }}>
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

    await press(screen.getByTestId('dropdown-item-0'))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())
    const overlay = screen.getByTestId('dropdown-overlay')

    await press(screen.getByTestId('dropdown-item-1'))
    await press(screen.getByTestId('dropdown-item-0'))
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
    expect(screen.getByTestId('dropdown-overlay')).toBe(overlay)
    expect(bOpened).not.toHaveBeenCalled()
    expect(bClosed).not.toHaveBeenCalled()
    expect(animations).toHaveLength(4)

    await act(async () => animations[3]?.complete())
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
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

    expect(screen.getByTestId('dropdown-caret-0').props.style).toMatchObject({
      borderLeftWidth: 4,
      borderRightWidth: 4,
      borderTopColor: '#323233',
      borderTopWidth: 4,
    })
    expect(StyleSheet.flatten(screen.getByTestId('dropdown-title-0').props.style)).toMatchObject({
      color: '#323233',
    })

    await press(screen.getByTestId('dropdown-item-0'))
    expect(screen.getByTestId('dropdown-caret-0').props.style).toMatchObject({
      borderTopColor: '#1989fa',
    })
    expect(StyleSheet.flatten(screen.getByTestId('dropdown-title-0').props.style)).toMatchObject({
      color: '#1989fa',
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

    const item = screen.getByTestId('dropdown-item-0')
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
      <AppProvider theme={{ token: { motion: true } }}>
        <DropdownMenu duration={240}>
          <DropdownItem defaultValue="a" options={[{ text: '面板 A', value: 'a' }]} />
        </DropdownMenu>
      </AppProvider>,
    )
    await press(screen.getByTestId('dropdown-item-0'))
    await act(async () => animations[0]?.complete())
    await act(async () => animations[1]?.complete())
    const panel = screen.getByTestId('dropdown-panel')
    await press(screen.getByTestId('dropdown-item-0'))
    expect(screen.getByTestId('dropdown-panel')).toBe(panel)
    expect(screen.getByTestId('dropdown-option-0-0')).toBeTruthy()
    await act(async () => animations[2]?.complete())
    await act(async () => animations[3]?.complete())
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
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

    expect(StyleSheet.flatten(screen.getByTestId('dropdown-item-0').props.style)).toMatchObject({
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

    await press(screen.getByTestId('disabled-item'))
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()

    await press(screen.getByTestId('enabled-item'))
    await press(screen.getByTestId('dropdown-option-1-0'))
    expect(itemOnChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('dropdown-panel')).toBeTruthy()

    await press(screen.getByTestId('dropdown-overlay'))
    expect(screen.getByTestId('dropdown-panel')).toBeTruthy()
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
    await press(screen.getByTestId('controlled-item'))
    await press(screen.getByTestId('dropdown-option-0-1'))
    expect(onChange).toHaveBeenCalledWith('two')
    expect(screen.getByTestId('controlled-value')).toHaveTextContent('two')
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
              content: { padding: 8 },
              optionText: { fontWeight: state.active ? '700' : '400' },
            })}
          >
            <View testID="custom-content" onLayout={() => undefined}>
              <Text>自定义内容</Text>
            </View>
          </DropdownItem>
        </DropdownMenu>
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('dropdown-item-0').props.style)).toMatchObject({
      marginTop: 0,
    })
    expect(screen.getByTestId('dropdown-item-0').props.accessibilityState).toMatchObject({
      expanded: false,
    })

    await act(async () => menuRef.current?.open(0))
    expect(screen.getByTestId('custom-content')).toBeTruthy()
    await act(async () => {
      screen.getByTestId('dropdown-panel').props.onLayout({
        nativeEvent: { layout: { height: 40 } },
      })
      await Promise.resolve()
    })
    expect(lifecycle.open).toHaveBeenCalledTimes(1)
    expect(lifecycle.opened).toHaveBeenCalledTimes(1)
    expect(StyleSheet.flatten(screen.getByTestId('dropdown-item-0').props.style)).toMatchObject({
      marginTop: 2,
    })
    expect(StyleSheet.flatten(screen.getByText('自定义').props.style)).toMatchObject({
      color: '#722ed1',
    })

    await act(async () => itemRef.current?.close())
    expect(lifecycle.close).toHaveBeenCalledTimes(1)
    expect(lifecycle.closed).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('dropdown-panel')).toBeNull()
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

      await press(screen.getByTestId('dropdown-item-0'))

      expect(
        StyleSheet.flatten(screen.getByTestId('dropdown-panel-viewport').props.style),
      ).toMatchObject({
        justifyContent: direction === 'up' ? 'flex-end' : 'flex-start',
        overflow: 'hidden',
      })
      expect(screen.getByTestId('dropdown-overlay')).toBeTruthy()
      expect(screen.getByTestId('dropdown-panel')).toBeTruthy()
    },
  )
})
