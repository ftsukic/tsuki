import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'
import { Button, Card, ConfigProvider, Icon, Surface, Text, TsukiProvider } from '..'

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

it('uses Surface for simple children and forwards root props', async () => {
  const onLayout = jest.fn()
  await render(
    <Card testID="card" onLayout={onLayout} bordered radius={8} padding={6}>
      <Text>Simple</Text>
    </Card>,
  )
  const root = screen.getByTestId('card')
  let ancestor = root.unstable_fiber?.return
  while (ancestor && ancestor.elementType !== Surface) ancestor = ancestor.return
  expect(ancestor?.elementType).toBe(Surface)
  expect(root.props.onLayout).toBe(onLayout)
  expect(styleOf('card')).toMatchObject({
    backgroundColor: '#f9fafb',
    gap: 0,
    padding: 6,
    borderRadius: 8,
    borderColor: '#e5e7eb',
    borderWidth: StyleSheet.hairlineWidth,
  })
  expect(screen.getByText('Simple').parent).toBe(root)
})

it('renders full, partial and mixed composition in caller order', async () => {
  function Heading() {
    return <Text>Custom title</Text>
  }
  const view = await render(
    <Card testID="card">
      <Card.Header testID="header" accessibilityLabel="Header">
        <Icon name="PlusOutlined" />
        <Heading />
      </Card.Header>
      <Card.Body testID="body" padding={5}>
        <Text>Body</Text>
      </Card.Body>
      <Card.Footer testID="footer">
        <Button>Save</Button>
      </Card.Footer>
    </Card>,
  )
  const order = () =>
    screen
      .getByTestId('card')
      .children.map((child) => (typeof child === 'string' ? child : child.props.testID))
  expect(order()).toEqual(['header', 'body', 'footer'])
  expect(screen.getByTestId('header').props.accessibilityLabel).toBe('Header')
  expect(styleOf('body').padding).toBe(5)
  expect(screen.getByText('Custom title')).toBeOnTheScreen()
  expect(screen.getByRole('button', { name: 'Save' })).toBeOnTheScreen()
  await view.rerender(
    <Card testID="card">
      <Card.Header testID="header" />
      <Card.Body testID="body" />
    </Card>,
  )
  expect(order()).toEqual(['header', 'body'])
  await view.rerender(
    <Card testID="card">
      <Card.Body testID="body" />
      <Card.Footer testID="footer" />
    </Card>,
  )
  expect(order()).toEqual(['body', 'footer'])
  await view.rerender(
    <Card testID="card">
      <Card.Footer testID="footer" />
      <Text testID="direct">Direct</Text>
      <Card.Body testID="body" />
    </Card>,
  )
  expect(order()).toEqual(['footer', 'direct', 'body'])
})

it('resolves root and section tokens from nested themes and resets to the current scheme', async () => {
  const tree = (scheme: 'light' | 'dark', padding: number) => (
    <TsukiProvider
      scheme={scheme}
      theme={{
        semantic: { colorSurface: '#7c3aed' },
        components: { Card: { padding, gap: 4, headerPadding: 7 } },
      }}
    >
      <View>
        <ConfigProvider
          theme={{ components: { Card: { borderRadius: 9, bodyPadding: 5, footerPadding: 3 } } }}
        >
          <Card testID="card">
            <Card.Header testID="header" />
            <Card.Body testID="body" />
            <Card.Footer testID="footer" />
          </Card>
          <ConfigProvider theme={{ inherit: false }}>
            <Card testID="reset">
              <Card.Header testID="reset-header" />
            </Card>
          </ConfigProvider>
        </ConfigProvider>
      </View>
    </TsukiProvider>
  )
  const view = await render(tree('light', 10))
  expect(styleOf('card')).toMatchObject({
    backgroundColor: '#7c3aed',
    padding: 10,
    borderRadius: 9,
    gap: 4,
  })
  expect(['header', 'body', 'footer'].map((id) => styleOf(id).padding)).toEqual([7, 5, 3])
  expect(styleOf('reset')).toMatchObject({ backgroundColor: '#f9fafb', padding: 16, gap: 0 })
  await view.rerender(tree('dark', 20))
  expect(styleOf('card').padding).toBe(20)
  expect(styleOf('reset').backgroundColor).toBe('#1f2937')
  expect(styleOf('reset-header').padding).toBe(16)
})

it('merges root and section class names and preserves inline overrides', async () => {
  await render(
    <Card
      testID="card"
      padding={2}
      className="bg-red-500 p-4 gap-2"
      style={{ backgroundColor: '#123456', padding: 5, gap: 3 }}
    >
      <Card.Header testID="header" padding={2} className="p-3" style={{ padding: 7 }} />
      <Card.Body testID="body" className="p-5" style={{ padding: 8 }} />
      <Card.Footer testID="footer" className="p-6" style={{ padding: 9 }} />
    </Card>,
  )
  expect(screen.getByTestId('card').props.style[0]).toMatchObject({
    '--tsuki-surface-gap-value': 0,
    '--tsuki-surface-padding-value': 2,
  })
  expect(screen.getByTestId('card').props.className).toEqual(
    expect.stringContaining('bg-red-500 p-4 gap-2'),
  )
  expect(styleOf('card')).toMatchObject({
    backgroundColor: '#123456',
    padding: 5,
    gap: 3,
    rowGap: 3,
    columnGap: 3,
  })
  for (const [id, utility, padding] of [
    ['header', 'p-3', 7],
    ['body', 'p-5', 8],
    ['footer', 'p-6', 9],
  ] as const) {
    expect(screen.getByTestId(id).props.className).toBe(`will-change-variable ${utility}`)
    expect(styleOf(id).padding).toBe(padding)
  }
})
