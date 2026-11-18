import { render, screen } from '@testing-library/react-native'
import { Fragment } from 'react'
import { StyleSheet } from 'react-native'
import { Button, Icon, Space, Text } from '..'

jest.mock(
  'nativewind',
  () => ({
    vars: (variables: Record<string, string | number>) => variables,
  }),
  { virtual: true },
)

it('renders an empty native row by default and forwards View props', async () => {
  const onLayout = jest.fn()
  await render(<Space testID="space" accessibilityLabel="Actions" onLayout={onLayout} />)

  const space = screen.getByTestId('space')
  expect(space.props).toMatchObject({ accessibilityLabel: 'Actions', onLayout })
  expect(StyleSheet.flatten(space.props.style)).toMatchObject({
    flexDirection: 'row',
    flexWrap: 'nowrap',
  })
  expect(space.children).toHaveLength(0)
})

it('maps layout props and updates the gap', async () => {
  const view = await render(
    <Space testID="space" direction="vertical" gap={7} wrap align="center" />,
  )

  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({
    flexDirection: 'column',
    gap: 7,
    flexWrap: 'wrap',
    alignItems: 'center',
  })

  await view.rerender(<Space testID="space" gap={19} />)
  expect(StyleSheet.flatten(screen.getByTestId('space').props.style)).toMatchObject({ gap: 19 })
})

it('applies inline styles last and forwards classes with dynamic layout variables', async () => {
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
  expect(screen.getByTestId('space').props).toMatchObject({
    className: 'flex-nowrap will-change-variable flex-col gap-4',
    style: [{ '--tsuki-space-gap': 9 }, { gap: 24 }, { rowGap: 24, columnGap: 24 }],
  })
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
