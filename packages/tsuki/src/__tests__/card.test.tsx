import { render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef } from 'react'
import { StyleSheet } from 'react-native'
import type { View } from 'react-native'
import { Button, Card, Icon, Surface, Text } from '..'

function styleOf(id: string) {
  return StyleSheet.flatten(screen.getByTestId(id).props.style)
}

it('uses Surface with Card theme classes and forwards root props and ref', async () => {
  const onLayout = jest.fn()
  const ref = createRef<ComponentRef<typeof View>>()
  await render(
    <Card ref={ref} testID="card" onLayout={onLayout} bordered radius={8} padding={6}>
      <Text>Simple</Text>
    </Card>,
  )
  const root = screen.getByTestId('card')
  let ancestor = root.unstable_fiber?.return
  while (ancestor && ancestor.elementType !== Surface) ancestor = ancestor.return
  expect(ancestor?.elementType).toBe(Surface)
  expect(ref.current).not.toBeNull()
  expect(root.props.onLayout).toBe(onLayout)
  expect(root.props.className).toBe(
    'bg-tsuki-surface overflow-hidden border-tsuki-surface-width border-tsuki-border rounded-tsuki-card p-tsuki-card gap-tsuki-card-gap',
  )
  expect(styleOf('card')).toMatchObject({ padding: 6, borderRadius: 8 })
  expect(screen.getByText('Simple').parent).toBe(root)
})

it('renders full, partial and mixed composition in caller order and forwards section refs', async () => {
  const headerRef = createRef<ComponentRef<typeof View>>()
  const bodyRef = createRef<ComponentRef<typeof View>>()
  const footerRef = createRef<ComponentRef<typeof View>>()
  function Heading() {
    return <Text>Custom title</Text>
  }
  const view = await render(
    <Card testID="card">
      <Card.Header ref={headerRef} testID="header" accessibilityLabel="Header">
        <Icon name="PlusOutlined" />
        <Heading />
      </Card.Header>
      <Card.Body ref={bodyRef} testID="body" padding={5}>
        <Text>Body</Text>
      </Card.Body>
      <Card.Footer ref={footerRef} testID="footer">
        <Button>Save</Button>
      </Card.Footer>
    </Card>,
  )
  const order = () =>
    screen
      .getByTestId('card')
      .children.map((child) => (typeof child === 'string' ? child : child.props.testID))
  expect(order()).toEqual(['header', 'body', 'footer'])
  expect(headerRef.current).not.toBeNull()
  expect(bodyRef.current).not.toBeNull()
  expect(footerRef.current).not.toBeNull()
  expect(screen.getByTestId('header').props.accessibilityLabel).toBe('Header')
  expect(screen.getByTestId('header').props.className).toBe('p-tsuki-card-header')
  expect(screen.getByTestId('body').props.className).toBe('p-tsuki-card-body')
  expect(screen.getByTestId('footer').props.className).toBe('p-tsuki-card-footer')
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

it('merges root and section class names over Card theme classes and preserves inline overrides', async () => {
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
  expect(screen.getByTestId('card').props.className).toBe(
    'overflow-hidden rounded-tsuki-card bg-red-500 p-4 gap-2',
  )
  expect(styleOf('card')).toMatchObject({
    backgroundColor: '#123456',
    padding: 5,
    gap: 3,
  })
  for (const [id, utility, padding] of [
    ['header', 'p-3', 7],
    ['body', 'p-5', 8],
    ['footer', 'p-6', 9],
  ] as const) {
    expect(screen.getByTestId(id).props.className).toBe(utility)
    expect(styleOf(id).padding).toBe(padding)
  }
})
