import { render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Surface, Text } from '..'

function styleOf(id: string) {
  return StyleSheet.flatten(screen.getByTestId(id).props.style)
}

it('renders theme utility defaults and forwards children, View props, and ref', async () => {
  const onLayout = jest.fn()
  const ref = createRef<ComponentRef<typeof View>>()
  await render(
    <ScrollView>
      <Surface
        ref={ref}
        testID="surface"
        onLayout={onLayout}
        accessibilityLabel="Panel"
        style={{ flex: 1 }}
      >
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
    className: 'bg-tsuki-surface rounded-tsuki-surface p-tsuki-surface overflow-hidden',
  })
  expect(ref.current).not.toBeNull()
  expect(styleOf('surface')).toMatchObject({ flex: 1 })
  expect(styleOf('surface')).not.toHaveProperty('borderWidth')
  expect(screen.getByText('Nested content').parent).toBe(screen.getByTestId('inner'))
})

it('applies explicit props and inset while enabling border only when bordered', async () => {
  await render(
    <View>
      <Surface
        testID="framed"
        radius={0}
        background="#123456"
        padding={4}
        gap={10}
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
  expect(screen.getByTestId('framed').props.className).toBe(
    'bg-tsuki-surface rounded-tsuki-surface p-tsuki-surface mx-tsuki-surface overflow-visible border-tsuki-surface-width border-tsuki-border',
  )
  expect(styleOf('framed')).toMatchObject({
    backgroundColor: '#123456',
    borderRadius: 0,
    padding: 4,
    gap: 10,
    borderWidth: 2,
    borderColor: '#abcdef',
  })
  expect(screen.getByTestId('plain').props.className).not.toContain('border-tsuki-surface-width')
  expect(screen.getByTestId('plain').props.style).toBeUndefined()
  expect(screen.getByTestId('default-border').props.className).toContain(
    'border-tsuki-surface-width border-tsuki-border',
  )
})

it('merges className overrides over theme classes and applies native style last', async () => {
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
    'overflow-hidden bg-red-500 p-4 rounded-xl border-4 border-green-500',
  )
  expect(styleOf('surface')).toMatchObject(style)
})

it('preserves native scroll overflow with a className', async () => {
  await render(<Surface testID="surface" className="p-4" overflow="scroll" />)
  expect(styleOf('surface')).toMatchObject({ overflow: 'scroll' })
})
