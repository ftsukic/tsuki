import { fireEvent, render, screen, userEvent } from '@testing-library/react-native'
import { createRef, Fragment, useState } from 'react'
import type { ComponentRef } from 'react'
import { StyleSheet, View } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { Cell, Text, TsukiProvider } from '..'

/* eslint-disable testing-library/no-await-sync-events -- RNTL fireEvent uses async act in this suite. */

function styleOf(node: ReturnType<typeof screen.getByTestId>) {
  return StyleSheet.flatten(node.props.style)
}

it('renders primitive slots recursively, forwards view props and ref, and keeps custom text intact', async () => {
  const onLayout = jest.fn()
  const ref = createRef<ComponentRef<typeof View>>()
  await render(
    <Cell
      ref={ref}
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
  expect(ref.current).not.toBeNull()
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

it('changes main direction, supports centering and large size classes', async () => {
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
  expect(container()?.props.className).toContain('items-start')
  expect(container()?.props.className).toContain('min-h-tsuki-cell-min-height')
  expect(main()?.props.className).toContain('flex-row')
  expect(main()?.props.className).toContain('min-w-0')
  expect(titleArea()?.props.className).toContain('min-w-0')

  await view.rerender(tree(true, false))
  expect(main()?.props.className).toContain('flex-col')
  expect(container()?.props.className).toContain('items-start')
  expect(container()?.props.className).toContain('min-h-tsuki-cell-large-min-height')
  expect(screen.getByTestId('trailing').parent?.parent).toBe(container())
  expect(JSON.stringify(view.toJSON())).toContain('-90deg')
  expect(screen.queryByRole('button')).toBeNull()

  await view.rerender(tree(true, true))
  expect(container()?.props.className).toContain('items-center')
  expect(main()?.props.className).toContain('flex-col')
})

it('uses Pressable only for interactive cells, blocks disabled handlers, and applies disabled opacity class', async () => {
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
  expect(button.props.className).not.toContain('opacity-tsuki-cell-disabled-opacity')
  await user.press(button)
  await user.longPress(button)
  expect(onPress).toHaveBeenCalledTimes(1)
  expect(onLongPress).toHaveBeenCalledTimes(1)

  await view.rerender(tree(true))
  const disabledButton = screen.getByRole('button', { disabled: true })
  await user.press(disabledButton)
  expect(onPress).toHaveBeenCalledTimes(1)
  expect(disabledButton.props.className).toContain('opacity-tsuki-cell-disabled-opacity')

  await view.rerender(tree(false, false))
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.getByTestId('action').props.onPress).toBeUndefined()
})

it('merges semantic classes cleanly without inline opacity blocking className overrides', async () => {
  const view = await render(
    <TsukiProvider scheme="dark">
      <Cell
        title="Title"
        value="Value"
        testID="cell"
        divider
        clickable
        testOnly_pressed
        className="bg-red-500 opacity-50"
        classNames={{ root: 'bg-blue-500', title: 'font-semibold', value: 'text-red-500' }}
        styles={{ title: { color: 'pink' }, root: { minWidth: 80 } }}
        style={{ minWidth: 120 }}
      />
    </TsukiProvider>,
  )
  const cell = screen.getByTestId('cell')
  expect(cell.props.className).toContain('bg-red-500')
  expect(cell.props.className).toContain('opacity-50')
  expect(cell.props.className).not.toContain('bg-blue-500')
  expect(styleOf(cell).opacity).toBeUndefined()
  expect(styleOf(cell).minWidth).toBe(120)

  const background = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(styleOf(background!).backgroundColor).toBe('#374151')
  expect(styleOf(background!).opacity).toBe(1)

  expect(screen.getByText('Title').props.className).toContain('font-semibold')
  expect(screen.getByText('Title').props.className).toContain('leading-tsuki-cell-line-height')
  expect(styleOf(screen.getByText('Title'))).toMatchObject({ color: 'pink' })
  expect(screen.getByText('Value').props.className).toContain('text-red-500')
  expect(screen.getByText('Value').props.className).toContain('text-tsuki-cell-font-size')
  expect(screen.getByTestId('cell-divider')).toBeOnTheScreen()
})

it('leaves idle Cell background to NativeWind classes and updates pressed feedback across theme changes', async () => {
  const withTiming = Reanimated.withTiming as jest.Mock
  withTiming.mockImplementation((target: number) => target)

  function ChangeSchemeOnPress() {
    const [scheme, setScheme] = useState<'light' | 'dark'>('light')

    return (
      <TsukiProvider scheme={scheme}>
        <Cell
          testID="theme-changing-cell"
          title="Change theme while pressed"
          clickable
          onPressIn={() => setScheme('dark')}
        />
      </TsukiProvider>
    )
  }

  const view = await render(<ChangeSchemeOnPress />)
  const cell = screen.getByTestId('theme-changing-cell')
  expect(cell.props.className).toContain('bg-tsuki-surface')
  expect(styleOf(cell).backgroundColor).toBeUndefined()

  await fireEvent(cell, 'pressIn')
  const background = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(styleOf(background!)).toMatchObject({ backgroundColor: '#374151', opacity: 1 })

  await fireEvent(cell, 'pressOut')
  await view.rerender(<ChangeSchemeOnPress />)
  const idleBackground = view.root?.queryAll(
    (instance) => instance.props.testID === 'tsuki-press-feedback-background',
  )[0]
  expect(styleOf(idleBackground!).opacity).toBe(0)
})
