import { render, screen } from '@testing-library/react-native'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ConfigProvider, Surface, Text, TsukiProvider } from '..'

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

it('renders native defaults and forwards children and View props', async () => {
  const onLayout = jest.fn()
  await render(
    <ScrollView>
      <Surface testID="surface" onLayout={onLayout} accessibilityLabel="Panel" style={{ flex: 1 }}>
        <Text>Parent content</Text>
        <Surface testID="inner">
          <Text>Nested content</Text>
        </Surface>
      </Surface>
    </ScrollView>,
  )
  expect(screen.getByTestId('surface').props).toMatchObject({
    onLayout,
    accessibilityLabel: 'Panel',
  })
  expect(styleOf('surface')).toMatchObject({
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
    overflow: 'hidden',
  })
  expect(styleOf('surface')).not.toHaveProperty('borderWidth')
  expect(screen.getByText('Nested content').parent).toBe(screen.getByTestId('inner'))
})

it('applies props and inset while enabling border props only when bordered', async () => {
  await render(
    <View>
      <Surface
        testID="framed"
        radius={0}
        background="#123456"
        padding={4}
        inset
        overflow="visible"
        bordered
        borderColor="#abcdef"
        borderWidth={2}
      />
      <Surface testID="plain" borderColor="#abcdef" borderWidth={2} />
      <Surface testID="default-border" bordered />
    </View>,
  )
  expect(styleOf('framed')).toMatchObject({
    backgroundColor: '#123456',
    borderRadius: 0,
    padding: 4,
    marginHorizontal: 16,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: '#abcdef',
  })
  expect(styleOf('plain')).not.toHaveProperty('borderColor')
  expect(styleOf('plain')).not.toHaveProperty('borderWidth')
  expect(styleOf('default-border')).toMatchObject({
    borderColor: '#e5e7eb',
    borderWidth: StyleSheet.hairlineWidth,
  })
})

it('inherits and resets local theme tokens and reacts to updates', async () => {
  const tree = (scheme: 'light' | 'dark', padding: number) => (
    <TsukiProvider
      scheme={scheme}
      theme={{
        semantic: { colorSurface: '#7c3aed', colorBorder: '#f59e0b' },
        components: { Surface: { padding } },
      }}
    >
      <View>
        <ConfigProvider theme={{ components: { Surface: { borderRadius: 6, borderWidth: 3 } } }}>
          <Surface testID="local" inset bordered />
          <ConfigProvider theme={{ inherit: false }}>
            <Surface testID="reset" bordered />
          </ConfigProvider>
        </ConfigProvider>
      </View>
    </TsukiProvider>
  )
  const view = await render(tree('light', 10))
  expect(styleOf('local')).toMatchObject({
    backgroundColor: '#7c3aed',
    borderColor: '#f59e0b',
    borderRadius: 6,
    borderWidth: 3,
    padding: 10,
    marginHorizontal: 10,
  })
  expect(styleOf('reset')).toMatchObject({ backgroundColor: '#f9fafb', padding: 16 })
  await view.rerender(tree('dark', 20))
  expect(styleOf('local')).toMatchObject({ padding: 20, marginHorizontal: 20 })
  expect(styleOf('reset')).toMatchObject({
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  })
})

it('lets classes replace prop utilities and applies native style last', async () => {
  const style = { backgroundColor: '#15803d', borderRadius: 0, borderWidth: 2, padding: 7 }
  await render(
    <Surface
      testID="surface"
      bordered
      padding={3}
      radius={4}
      borderWidth={1}
      className="bg-red-500 p-4 rounded-xl border-4 border-green-500"
      style={style}
    />,
  )
  const root = screen.getByTestId('surface')
  expect(root.props.className).toBe(
    'mx-[var(--tsuki-surface-inset-value)] will-change-variable overflow-hidden bg-red-500 p-4 rounded-xl border-4 border-green-500',
  )
  expect(root.props.style[0]).toMatchObject({
    '--tsuki-surface-padding-value': 3,
    '--tsuki-surface-radius': 4,
    '--tsuki-surface-stroke-width': 1,
  })
  expect(styleOf('surface')).toMatchObject(style)
})

it('preserves native scroll overflow with a className', async () => {
  await render(<Surface testID="surface" className="p-4" overflow="scroll" />)
  expect(styleOf('surface')).toMatchObject({ overflow: 'scroll' })
})
