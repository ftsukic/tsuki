import { render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { ConfigProvider, Divider, serializeTheme, Space, TsukiProvider, useTsukiTheme } from '..'

function styleOf(id: string) {
  return StyleSheet.flatten(screen.getByTestId(id).props.style)
}

it('renders an accessible horizontal hairline using theme classes and forwards View props and ref', async () => {
  const onLayout = jest.fn()
  const ref = createRef<ComponentRef<typeof View>>()
  await render(
    <Divider ref={ref} testID="divider" accessibilityLabel="Section break" onLayout={onLayout} />,
  )
  expect(screen.getByRole('separator', { name: 'Section break' }).props).toMatchObject({
    pointerEvents: 'none',
    onLayout,
    className: 'self-stretch bg-tsuki-border h-tsuki-divider',
  })
  expect(ref.current).not.toBeNull()
  expect(screen.getByTestId('divider').props.style).toBeUndefined()
})

it('maps explicit thickness, color, and inset to the current orientation and honors inline overrides', async () => {
  const renderLines = (orientation: 'horizontal' | 'vertical') => (
    <Space>
      <Divider
        testID="first"
        orientation={orientation}
        color="#ff0000"
        thickness={4}
        inset={8}
        style={{ width: 5 }}
      />
      <Divider testID="second" orientation={orientation} />
    </Space>
  )
  const view = await render(renderLines('horizontal'))
  expect(styleOf('first')).toMatchObject({
    height: 4,
    marginHorizontal: 8,
    backgroundColor: '#ff0000',
  })
  expect(screen.getByTestId('second').props.className).toBe(
    'self-stretch bg-tsuki-border h-tsuki-divider',
  )

  await view.rerender(renderLines('vertical'))
  expect(styleOf('first')).toMatchObject({
    width: 5,
    marginVertical: 8,
    backgroundColor: '#ff0000',
  })
  expect(styleOf('first')).not.toHaveProperty('height')
  expect(screen.getByTestId('second').props.className).toBe(
    'self-stretch bg-tsuki-border w-tsuki-divider',
  )
})

it('preserves caller accessibility roles and pointer events', async () => {
  const view = await render(
    <Divider testID="line" accessibilityRole="image" pointerEvents="auto" />,
  )
  expect(screen.getByRole('image').props).toMatchObject({ pointerEvents: 'auto' })
  await view.rerender(<Divider accessibilityRole="image" role="presentation" />)
  expect(screen.getByRole('presentation')).toBeOnTheScreen()
})

function ThicknessVariable() {
  return (
    <View
      testID="variables"
      accessibilityLabel={serializeTheme(useTsukiTheme())['--tsuki-divider-thickness']}
    />
  )
}

it('serializes nested and reset Divider thickness tokens into CSS variables', async () => {
  await render(
    <TsukiProvider
      scheme="dark"
      theme={{ semantic: { colorBorder: '#d1d5db' }, components: { Divider: { thickness: 3 } } }}
    >
      <View>
        <Divider testID="root" />
        <ConfigProvider theme={{ components: { Divider: { thickness: 5 } } }}>
          <Divider testID="nested" />
          <ThicknessVariable />
          <ConfigProvider theme={{ inherit: false }}>
            <Divider testID="reset" />
          </ConfigProvider>
        </ConfigProvider>
      </View>
    </TsukiProvider>,
  )
  expect(screen.getByTestId('variables').props.accessibilityLabel).toBe('5px')
  expect(screen.getByTestId('root').props.className).toBe(
    'self-stretch bg-tsuki-border h-tsuki-divider',
  )
  expect(screen.getByTestId('reset').props.className).toBe(
    'self-stretch bg-tsuki-border h-tsuki-divider',
  )
})

it('merges className overrides over theme classes and applies inline styles last', async () => {
  await render(
    <Divider
      testID="line"
      className="bg-red-500 h-4"
      color="#123456"
      thickness={7}
      inset={8}
      style={{ height: 9, backgroundColor: '#abcdef' }}
    />,
  )
  const { className, style } = screen.getByTestId('line').props
  expect(className).toBe('self-stretch bg-red-500 h-4')
  expect(StyleSheet.flatten(style)).toMatchObject({
    height: 9,
    marginHorizontal: 8,
    backgroundColor: '#abcdef',
  })
})
