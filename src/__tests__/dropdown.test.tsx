import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
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
})
