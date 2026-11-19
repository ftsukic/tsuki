import { render, screen } from '@testing-library/react-native'
import { Fragment } from 'react'
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

it('shares the compound export and counts only Cells while preserving fragments, arrays and custom children', async () => {
  const tree = (includeLast: boolean) => (
    <CellGroup title="Group" extra={5}>
      <Cell testID="first" title="First" />
      <Fragment>
        {false}
        {[<Text key="custom">Custom</Text>, <Cell key="mid" testID="middle" title="Middle" />]}
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

it('uses Surface for inset styling, maps current theme, and restores scheme defaults', async () => {
  const tree = (scheme: 'light' | 'dark', radius: number) => (
    <TsukiProvider
      scheme={scheme}
      theme={{
        semantic: { colorSurface: '#abcdef' },
        components: { Cell: { groupRadius: radius, groupInsetMarginHorizontal: 22 } },
      }}
    >
      <View>
        <CellGroup
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
    </TsukiProvider>
  )
  const view = await render(tree('light', 21))
  const body = () => screen.getByTestId('item').parent!
  expect(StyleSheet.flatten(body().props.style)).toMatchObject({
    borderRadius: 21,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#abcdef',
  })
  expect(StyleSheet.flatten(body().props.style)).not.toHaveProperty('borderWidth')
  expect(StyleSheet.flatten(body().parent?.props.style).marginHorizontal).toBe(22)
  expect(StyleSheet.flatten(screen.getByTestId('group').props.style).marginTop).toBe(5)
  expect(screen.getByTestId('opacity-token')).toHaveTextContent('0.4')
  await view.rerender(tree('dark', 9))
  expect(StyleSheet.flatten(body().props.style).borderRadius).toBe(9)
  expect(StyleSheet.flatten(screen.getByTestId('default').props.style).backgroundColor).toBe(
    '#1f2937',
  )
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
