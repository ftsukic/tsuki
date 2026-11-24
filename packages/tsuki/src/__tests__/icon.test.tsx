import { render, screen, userEvent } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef } from 'react'
import { processColor, StyleSheet, View } from 'react-native'
import { ConfigProvider, Icon, TsukiProvider } from '..'
import type { IconDefinition, IconName } from '..'

const custom: IconDefinition = {
  name: 'custom',
  theme: 'outlined',
  icon: {
    tag: 'svg',
    attrs: { viewBox: '0 0 24 24', fill: 'none', testID: 'svg' },
    children: [
      {
        tag: 'g',
        attrs: {},
        children: [
          {
            tag: 'path',
            attrs: { testID: 'path', d: 'M0 0L24 24', stroke: 'currentColor', 'stroke-width': '2' },
          },
        ],
      },
    ],
  },
}

it('renders a built-in icon and forwards ref', async () => {
  const ref = createRef<ComponentRef<typeof View>>()
  const view = await render(
    <Icon ref={ref} name="PlusOutlined" accessibilityRole="image" accessibilityLabel="Plus" />,
  )
  expect(screen.getByRole('image', { name: 'Plus' })).toBeOnTheScreen()
  expect(ref.current).not.toBeNull()
  expect(JSON.stringify(view.toJSON())).toContain('RNSVGPath')
})

it('renders recursive SVG shapes, maps attributes and separates root and SVG styles', async () => {
  await render(
    <Icon
      name={custom}
      testID="icon"
      className="m-2"
      style={{ margin: 7 }}
      svgStyle={{ opacity: 0.5 }}
      size={30}
      color="#ff0000"
      rotation={90}
    />,
  )

  const root = screen.getByTestId('icon')
  const svg = screen.getByTestId('svg')
  expect(root.props.className).toBe('m-2')
  expect(StyleSheet.flatten(root.props.style)).toMatchObject({ margin: 7 })
  expect(svg.props).toMatchObject({ bbWidth: 30, bbHeight: 30 })
  expect(StyleSheet.flatten(svg.props.style)).toMatchObject({
    opacity: 0.5,
    transform: [{ rotate: '90deg' }],
  })
  expect(screen.getByTestId('path').props).toMatchObject({
    stroke: { payload: processColor('#ff0000'), type: 0 },
    strokeWidth: '2',
  })
})

it('uses both explicit colors for a two-tone icon', async () => {
  const view = await render(
    <Icon name="CheckCircleTwoTone" twoToneColor={['#123456', '#abcdef']} />,
  )
  const svg = JSON.stringify(view.toJSON())
  expect(svg).toContain(String(processColor('#123456')))
  expect(svg).toContain(String(processColor('#abcdef')))
})

it('presses the accessible root and honors explicit hit slop and disabled state', async () => {
  const user = userEvent.setup()
  const onPress = jest.fn()
  const view = await render(
    <Icon name={custom} accessibilityLabel="Add" onPress={onPress} size={20} touchableSize={48} />,
  )
  const button = screen.getByRole('button', { name: 'Add' })
  expect(button.props.hitSlop).toBe(14)
  expect(screen.getByTestId('svg').props.bbWidth).toBe(20)
  await user.press(button)
  expect(onPress).toHaveBeenCalledTimes(1)

  await view.rerender(
    <Icon
      name={custom}
      accessibilityLabel="Add"
      onPress={onPress}
      disabled
      hitSlop={{ left: 8 }}
    />,
  )
  const disabledButton = screen.getByRole('button', { name: 'Add', disabled: true })
  expect(disabledButton.props.hitSlop).toEqual({ left: 8 })
  await user.press(disabledButton)
  expect(onPress).toHaveBeenCalledTimes(1)
})

it.each([
  ['light', '#111827'],
  ['dark', '#f9fafb'],
] as const)('uses the %s foreground and reads nested theme overrides', async (scheme, color) => {
  await render(
    <TsukiProvider scheme={scheme}>
      <View>
        <Icon name={custom} />
        <ConfigProvider theme={{ semantic: { colorForeground: '#7c3aed' } }}>
          <Icon name={custom} />
        </ConfigProvider>
      </View>
    </TsukiProvider>,
  )
  const [outer, inner] = screen.getAllByTestId('path')
  expect(outer?.props.stroke.payload).toBe(processColor(color))
  expect(inner?.props.stroke.payload).toBe(processColor('#7c3aed'))
})

it('renders nothing for invalid registry names', async () => {
  const view = await render(<Icon name={'toString' as IconName} />)
  expect(view.toJSON()).toBeNull()
})
