import { render, screen } from '@testing-library/react-native'
import { createRef, Fragment, memo } from 'react'
import type { ComponentRef } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  Cell,
  CellGroup,
  ConfigProvider,
  serializeTheme,
  Text,
  TsukiProvider,
  useTsukiTheme,
} from '..'

function dividers(...ids: string[]) {
  return ids.map((id) => Boolean(screen.queryByTestId(`${id}-divider`)))
}

const MemoCell = memo(Cell)

it('shares the compound export and counts Cell and React.memo(Cell) while preserving fragments, arrays and custom children', async () => {
  const tree = (includeLast: boolean) => (
    <CellGroup title="Group" extra={5}>
      <Cell testID="first" title="First" />
      <Fragment>
        {false}
        {[<Text key="custom">Custom</Text>, <MemoCell key="mid" testID="middle" title="Middle" />]}
      </Fragment>
      {includeLast && <Cell testID="last" title="Last" />}
      <Text>After</Text>
    </CellGroup>
  )
  expect(Cell.Group).toBe(CellGroup)
  const view = await render(tree(true))
  for (const label of ['Group', '5', 'Custom', 'After'])
    expect(screen.getByText(label)).toBeOnTheScreen()
  expect(dividers('first', 'middle', 'last')).toEqual([true, true, false])
  await view.rerender(tree(false))
  expect(dividers('first', 'middle')).toEqual([true, false])
})

it('respects explicit divider and border precedence and isolates nested groups', async () => {
  await render(
    <Cell.Group>
      <Cell testID="no-border" border={false} divider />
      <Cell testID="disabled-divider" divider={false} />
      <CellGroup>
        <Cell testID="nested-single" />
      </CellGroup>
      <Cell testID="forced-last" divider />
    </Cell.Group>,
  )
  expect(dividers('no-border', 'disabled-divider', 'nested-single', 'forced-last')).toEqual([
    false,
    false,
    false,
    true,
  ])
})

function ThemeCheck() {
  const variables = serializeTheme(useTsukiTheme())
  return <Text testID="opacity-token">{variables['--tsuki-cell-disabled-opacity']}</Text>
}

it('uses Surface theme classes for inset styling, forwards ref, and serializes Cell theme tokens', async () => {
  const ref = createRef<ComponentRef<typeof View>>()
  await render(
    <TsukiProvider
      scheme="light"
      theme={{
        semantic: { colorSurface: '#abcdef' },
        components: { Cell: { groupRadius: 21, groupInsetMarginHorizontal: 22 } },
      }}
    >
      <View>
        <CellGroup
          ref={ref}
          inset
          title="Inset"
          testID="group"
          border={false}
          styles={{ root: { marginTop: 5 }, body: { padding: 0 } }}
        >
          <Cell testID="item" title="Item" />
        </CellGroup>
        <ConfigProvider theme={{ inherit: false }}>
          <Cell testID="default" title="Default" />
          <ThemeCheck />
        </ConfigProvider>
      </View>
    </TsukiProvider>,
  )

  expect(ref.current).not.toBeNull()
  const body = screen.getByTestId('item').parent!
  expect(body.props.className).toContain('rounded-tsuki-cell-group-radius')
  expect(body.props.className).toContain('overflow-hidden')
  expect(body.props.className).not.toContain('border-tsuki-surface-width')
  expect(body.parent?.props.className).toContain('mx-tsuki-cell-group-inset-margin-horizontal')
  expect(StyleSheet.flatten(body.props.style)).toMatchObject({ padding: 0 })
  expect(StyleSheet.flatten(screen.getByTestId('group').props.style).marginTop).toBe(5)
  expect(screen.getByTestId('opacity-token')).toHaveTextContent('0.4')
  expect(screen.getByTestId('default').props.className).toContain('bg-tsuki-surface')
})

it('adds only the enabled outer hairlines and leaves a single item without an internal divider', async () => {
  const view = await render(
    <CellGroup>
      <Cell testID="single" />
    </CellGroup>,
  )
  expect(dividers('single')).toEqual([false])
  const outerLines = () =>
    screen
      .getByTestId('single')
      .parent?.children.filter((child) => typeof child !== 'string' && child.props.role === 'none')
  expect(outerLines()).toHaveLength(2)
  await view.rerender(
    <CellGroup border={false}>
      <Cell testID="single" />
    </CellGroup>,
  )
  expect(outerLines()).toHaveLength(0)
})
