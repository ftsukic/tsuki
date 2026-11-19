import { render, screen, userEvent } from '@testing-library/react-native'
import { Fragment } from 'react'
import { StyleSheet, View } from 'react-native'
import { Cell, Text, TsukiProvider } from '..'

jest.mock(
  'nativewind',
  () => ({
    vars: (variables: Record<string, string | number>) => variables,
  }),
  { virtual: true },
)

function styleOf(node: ReturnType<typeof screen.getByTestId>) {
  return StyleSheet.flatten(node.props.style)
}

it('renders primitive slots recursively, forwards view props, and keeps custom text intact', async () => {
  const onLayout = jest.fn()
  await render(
    <Cell
      testID="cell"
      titleLines={1}
      valueLines={2}
      onLayout={onLayout}
      leading="Leading"
      title={[
        'Profile',
        <Fragment key="nested">
          <Text testID="custom" numberOfLines={4}>
            Custom
          </Text>
          {7}
        </Fragment>,
      ]}
      titleExtra="New"
      description="Details"
      value={42}
      valueExtra="Verified"
      trailing="More"
      required
    />,
  )
  expect(screen.getByTestId('cell').props.onLayout).toBe(onLayout)
  for (const content of [
    'Leading',
    'Profile',
    'Custom',
    '7',
    'New',
    'Details',
    '42',
    'Verified',
    'More',
    '*',
  ]) {
    expect(screen.getByText(content)).toBeOnTheScreen()
  }
  expect(screen.getByText('Profile').props.numberOfLines).toBe(1)
  expect(screen.getByText('7').props.numberOfLines).toBe(1)
  expect(screen.getByText('42').props.numberOfLines).toBe(2)
  expect(screen.getByTestId('custom').props.numberOfLines).toBe(4)
  expect(screen.queryByTestId('cell-divider')).toBeNull()
})

it('changes only main direction, supports centering and constrains long text', async () => {
  const tree = (vertical: boolean, center: boolean) => (
    <View style={{ width: 165 }}>
      <Cell
        testID="cell"
        title="Long title for a narrow viewport"
        titleLines={1}
        value="Very long value"
        valueLines={1}
        vertical={vertical}
        center={center}
        leading={<View testID="leading" />}
        trailing={<View testID="trailing" />}
        titleExtra={<></>}
        showArrow
        arrowDirection="up"
        size={vertical ? 'large' : 'normal'}
      />
    </View>
  )
  const view = await render(tree(false, false))
  const container = () => screen.getByTestId('leading').parent?.parent
  const titleArea = () => screen.getByText('Long title for a narrow viewport').parent?.parent
  const main = () => titleArea()?.parent
  expect(styleOf(container()!).alignItems).toBe('flex-start')
  expect(styleOf(container()!).minHeight).toBe(44)
  expect(styleOf(main()!)).toMatchObject({ flexDirection: 'row', minWidth: 0, flex: 1 })
  expect(styleOf(titleArea()!).minWidth).toBe(0)
  await view.rerender(tree(true, false))
  expect(styleOf(main()!).flexDirection).toBe('column')
  expect(styleOf(container()!).alignItems).toBe('flex-start')
  expect(styleOf(container()!).minHeight).toBe(56)
  expect(screen.getByTestId('trailing').parent?.parent).toBe(container())
  expect(JSON.stringify(view.toJSON())).toContain('-90deg')
  expect(screen.queryByRole('button')).toBeNull()
  await view.rerender(tree(true, true))
  expect(styleOf(container()!).alignItems).toBe('center')
  expect(styleOf(main()!).flexDirection).toBe('column')
})

it('uses Pressable only for interactive cells and blocks disabled handlers', async () => {
  const user = userEvent.setup()
  const onPress = jest.fn()
  const onLongPress = jest.fn()
  const tree = (disabled: boolean, clickable?: boolean) => (
    <Cell
      title="Action"
      testID="action"
      accessibilityLabel="Open action"
      hitSlop={8}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      clickable={clickable}
    />
  )
  const view = await render(tree(false))
  const button = screen.getByRole('button', { name: 'Open action' })
  expect(button.props.hitSlop).toBe(8)
  await user.press(button)
  await user.longPress(button)
  expect(onPress).toHaveBeenCalledTimes(1)
  expect(onLongPress).toHaveBeenCalledTimes(1)
  await view.rerender(tree(true))
  await user.press(screen.getByRole('button', { disabled: true }))
  expect(onPress).toHaveBeenCalledTimes(1)
  expect(styleOf(screen.getByTestId('action')).opacity).toBe(0.4)
  await view.rerender(tree(false, false))
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.getByTestId('action').props.onPress).toBeUndefined()
})

it('merges semantic classes and native styles and uses the active theme', async () => {
  await render(
    <TsukiProvider scheme="dark" theme={{ components: { Cell: { minHeight: 57 } } }}>
      <Cell
        title="Title"
        value="Value"
        testID="cell"
        divider
        clickable
        testOnly_pressed
        className="bg-red-500"
        classNames={{ root: 'bg-blue-500', title: 'font-semibold', value: 'text-red-500' }}
        styles={{ title: { color: 'pink' }, root: { opacity: 0.7 } }}
        style={{ opacity: 0.8 }}
      />
    </TsukiProvider>,
  )
  const cell = screen.getByTestId('cell')
  expect(cell.props.className).toContain('bg-red-500')
  expect(cell.props.className).not.toContain('bg-blue-500')
  expect(styleOf(cell).opacity).toBe(0.8)
  expect(cell.props.style[0]).toMatchObject({ '--tsuki-cell-bg-value': '#374151' })
  expect(screen.getByText('Title').props.className).toContain('font-semibold')
  expect(styleOf(screen.getByText('Title'))).toMatchObject({
    '--tsuki-cell-line-height-value': '22px',
    color: 'pink',
  })
  expect(screen.getByText('Value').props.className).toContain('text-red-500')
  expect(screen.getByTestId('cell-divider')).toBeOnTheScreen()
})
