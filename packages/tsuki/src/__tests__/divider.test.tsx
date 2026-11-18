import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'
import { ConfigProvider, Divider, serializeTheme, Space, TsukiProvider, useTsukiTheme } from '..'

jest.mock(
  'nativewind',
  () => ({
    vars: (variables: Record<string, string | number>) => variables,
  }),
  { virtual: true },
)

function styleOf(id: string) {
  return StyleSheet.flatten(screen.getByTestId(id).props.style)
}

it('renders an accessible horizontal hairline and forwards View props', async () => {
  const onLayout = jest.fn()
  await render(<Divider testID="divider" accessibilityLabel="Section break" onLayout={onLayout} />)
  expect(screen.getByRole('separator', { name: 'Section break' }).props).toMatchObject({
    pointerEvents: 'none',
    onLayout,
  })
  expect(styleOf('divider')).toMatchObject({
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    backgroundColor: '#e5e7eb',
  })
})

it('maps thickness and inset to the current orientation and honors native overrides', async () => {
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
      <Divider testID="second" />
    </Space>
  )
  const view = await render(renderLines('horizontal'))
  expect(styleOf('first')).toMatchObject({
    height: 4,
    marginHorizontal: 8,
    backgroundColor: '#ff0000',
  })
  await view.rerender(renderLines('vertical'))
  expect(styleOf('first')).toMatchObject({
    width: 5,
    marginVertical: 8,
    backgroundColor: '#ff0000',
  })
  expect(styleOf('first')).not.toHaveProperty('height')
  expect(styleOf('second')).toMatchObject({ height: StyleSheet.hairlineWidth })
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

it('merges and resets theme overrides, serializes thickness and updates with scheme changes', async () => {
  const tree = (scheme: 'dark' | 'light', thickness: number) => (
    <TsukiProvider
      scheme={scheme}
      theme={{ semantic: { colorBorder: '#d1d5db' }, components: { Divider: { thickness } } }}
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
    </TsukiProvider>
  )
  const view = await render(tree('dark', 3))
  expect(styleOf('root')).toMatchObject({ height: 3, backgroundColor: '#d1d5db' })
  expect(styleOf('nested')).toMatchObject({ height: 5, backgroundColor: '#d1d5db' })
  expect(styleOf('reset')).toMatchObject({
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#374151',
  })
  expect(screen.getByTestId('variables').props.accessibilityLabel).toBe('5px')
  await view.rerender(tree('light', 6))
  expect(styleOf('root')).toMatchObject({ height: 6 })
  expect(styleOf('reset')).toMatchObject({ backgroundColor: '#e5e7eb' })
})

it('puts class color and size after props, and inline styles last', async () => {
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
  expect(className).toBe(
    'self-stretch will-change-variable mx-[var(--tsuki-divider-inset)] bg-red-500 h-4',
  )
  expect(style[0]).toMatchObject({
    '--tsuki-divider-color': '#123456',
    '--tsuki-divider-size': 7,
    '--tsuki-divider-inset': 8,
  })
  expect(StyleSheet.flatten(style)).toMatchObject({ height: 9, backgroundColor: '#abcdef' })
})
