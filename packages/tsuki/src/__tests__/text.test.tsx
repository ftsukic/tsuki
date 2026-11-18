import { fireEvent, render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import type { ComponentRef } from 'react'
import type { Text as RNText } from 'react-native'
import { Button, Text, TextClassContext } from '..'

it('renders native text and forwards native props and ref', async () => {
  const onPress = jest.fn()
  const ref = createRef<ComponentRef<typeof RNText>>()
  await render(
    <Text ref={ref} selectable numberOfLines={2} ellipsizeMode="tail" onPress={onPress}>
      Hello
    </Text>,
  )

  const text = screen.getByText('Hello')
  expect(text.props).toMatchObject({
    selectable: true,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
    className: 'text-tsuki-foreground text-base',
  })
  expect(typeof ref.current?.measure).toBe('function')
  fireEvent.press(text)
  expect(onPress).toHaveBeenCalledTimes(1)
})

it('applies the variant before the nearest provider and own classes', async () => {
  await render(
    <TextClassContext.Provider value="text-tsuki-primary font-semibold">
      <Text variant="heading">Inherited</Text>
      <TextClassContext.Provider value="text-tsuki-muted">
        <Text>Inner scope</Text>
        <Text variant="heading" className="text-red-500">
          Override
        </Text>
      </TextClassContext.Provider>
    </TextClassContext.Provider>,
  )

  expect(screen.getByText('Inherited').props.className).toBe(
    'text-2xl text-tsuki-primary font-semibold',
  )
  expect(screen.getByText('Inner scope').props.className).toBe('text-base text-tsuki-muted')
  expect(screen.getByText('Override').props.className).toBe('text-2xl font-bold text-red-500')
})

it('cascades through nested native Text nodes and lets the deepest child override', async () => {
  await render(
    <Text testID="outer" className="text-tsuki-primary">
      Level 1
      <Text testID="middle" className="font-bold">
        Level 2
        <Text testID="inner" className="text-red-500">
          Level 3
        </Text>
      </Text>
    </Text>,
  )

  const outer = screen.getByTestId('outer')
  const middle = screen.getByTestId('middle')
  const inner = screen.getByTestId('inner')
  expect(middle.parent).toBe(outer)
  expect(inner.parent).toBe(middle)
  expect(middle.props.className).toBe('text-base text-tsuki-primary font-bold')
  expect(inner.props.className).toBe('text-base font-bold text-red-500')
})

it('supplies Button content classes to nested Text with local overrides', async () => {
  await render(
    <>
      <Button variant="solid">
        <Text testID="label">
          Confirm <Text>deletion</Text>
        </Text>
      </Button>
      <Button variant="outlined" classNames={{ content: 'font-medium' }}>
        <Text className="text-red-500">Custom</Text>
      </Button>
      <Button variant="outlined">
        <Text>Outlined</Text>
      </Button>
    </>,
  )

  expect(screen.getByTestId('label').props.className).toBe(
    'text-sm font-semibold text-tsuki-primary-foreground',
  )
  expect(screen.getByText('deletion').props.className).toBe(
    'text-sm font-semibold text-tsuki-primary-foreground',
  )
  expect(screen.getByText('Custom').props.className).toBe('text-sm font-medium text-red-500')
  expect(screen.getByText('Outlined').props.className).toBe(
    'text-sm font-semibold text-tsuki-foreground',
  )
})

it.each([
  ['solid', 'text-tsuki-primary-foreground'],
  ['outlined', 'text-tsuki-foreground'],
] as const)('renders %s string labels through Tsuki Text', async (variant, colorClassName) => {
  const labelStyle = { letterSpacing: 1 }
  await render(
    <Button variant={variant} styles={{ content: labelStyle }}>
      Confirm
    </Button>,
  )

  const label = screen.getByText('Confirm')
  let ancestor = label.unstable_fiber?.return
  while (ancestor && ancestor.elementType !== Text) {
    ancestor = ancestor.return
  }
  expect(ancestor?.elementType).toBe(Text)
  expect(label.props).toMatchObject({
    className: `text-sm font-semibold ${colorClassName}`,
    style: labelStyle,
  })
})
