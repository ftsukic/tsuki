import { render, screen } from '@testing-library/react-native'
import { createRef, Fragment } from 'react'
import type { ComponentRef } from 'react'
import { StyleSheet } from 'react-native'
import type { View } from 'react-native'
import { Button, Icon, Space, Text } from '..'

it('renders an empty native row by default and forwards View props and ref', async () => {
  const onLayout = jest.fn()
  const ref = createRef<ComponentRef<typeof View>>()
  await render(<Space ref={ref} testID="space" accessibilityLabel="Actions" onLayout={onLayout} />)

  const space = screen.getByTestId('space')
  expect(space.props).toMatchObject({
    accessibilityLabel: 'Actions',
    onLayout,
    className: 'flex-row flex-nowrap',
  })
  expect(ref.current).not.toBeNull()
  expect(space.children).toHaveLength(0)
})

it('maps layout props to Tailwind classes and dynamic gap style', async () => {
  const view = await render(
    <Space testID="space" direction="vertical" gap={7} wrap align="center" />,
  )

  expect(screen.getByTestId('space').props.className).toBe('flex-col flex-wrap items-center')
  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({ gap: 7 })

  await view.rerender(<Space testID="space" gap={19} />)
  expect(screen.getByTestId('space').props.className).toBe('flex-row flex-nowrap')
  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({ gap: 19 })
})

it('merges custom classes cleanly and applies inline styles last', async () => {
  const view = await render(
    <Space testID="space" gap={7} wrap style={{ gap: 24, flexWrap: 'nowrap' }} />,
  )
  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({
    gap: 24,
    flexWrap: 'nowrap',
  })

  await view.rerender(
    <Space testID="space" gap={9} className="flex-col gap-4" style={{ gap: 24 }} />,
  )
  expect(screen.getByTestId('space').props.className).toBe('flex-nowrap flex-col gap-4')
  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({ gap: 24 })
})

it('keeps Fragment, nested Space and component children in their original order', async () => {
  await render(
    <Space testID="outer">
      <Fragment>
        <Text testID="first">First</Text>
        <Space testID="inner" direction="vertical">
          <Button testID="action">Save</Button>
          <Space testID="deep">
            <Icon name="CheckOutlined" testID="icon" />
          </Space>
        </Space>
      </Fragment>
      <Text testID="last">Last</Text>
    </Space>,
  )

  expect(screen.getByTestId('outer').children).toEqual([
    screen.getByTestId('first'),
    screen.getByTestId('inner'),
    screen.getByTestId('last'),
  ])
  expect(screen.getByTestId('inner').children).toEqual([
    screen.getByTestId('action'),
    screen.getByTestId('deep'),
  ])
  expect(screen.getByTestId('deep').children).toEqual([screen.getByTestId('icon')])
})
