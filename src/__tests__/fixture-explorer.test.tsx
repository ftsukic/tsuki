/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import FixtureExplorer from '../../example/components/fixture-explorer'
import { FixtureOverview } from '../fixture-overview'
import type { StyleProp, ViewStyle } from 'react-native'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }), { virtual: true })
jest.mock('../../example/components/demo-provider', () => ({
  useDemoTheme: () => ({ mode: 'system', setMode: jest.fn() }),
}))
jest.mock('../../example/fixtures/categories', () => ({
  componentCategories: [{ title: '基础组件', components: ['button', 'cell'] }],
}))

interface JsonNode {
  children?: JsonNode[] | null
  props: Record<string, unknown>
  type: string
}

function findNodes(value: unknown, predicate: (node: JsonNode) => boolean): JsonNode[] {
  if (Array.isArray(value)) return value.flatMap((item) => findNodes(item, predicate))
  if (!value || typeof value !== 'object' || !('props' in value)) return []

  const node = value as JsonNode
  const matches = predicate(node) ? [node] : []

  return matches.concat(findNodes(node.children, predicate))
}

function nodeStyle(node: JsonNode) {
  return StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
}

jest.mock('../../example/fixtures/catalog', () => {
  const React = jest.requireActual('react')
  const { Text } = jest.requireActual('react-native')
  const FirstOverview = () => React.createElement(Text, null, 'Button overview')
  const SecondOverview = () => React.createElement(Text, null, 'Cell overview')

  return {
    componentCatalog: [
      {
        Component: FirstOverview,
        component: 'button',
        description: 'Button overview description',
        id: 'button',
        title: 'Button',
      },
      {
        Component: SecondOverview,
        component: 'cell',
        description: 'Cell overview description',
        id: 'cell',
        title: 'Cell',
      },
    ],
  }
})

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')

  return { SafeAreaProvider: View, SafeAreaView: View }
})

describe('FixtureExplorer component navigation', () => {
  afterEach(async () => {
    await cleanup()
    mockPush.mockClear()
  })

  it('opens component and lab routes from the catalog', async () => {
    await render(<FixtureExplorer />)
    expect(screen.getByText('组件游乐场')).toBeTruthy()
    expect(screen.getByText('Button')).toBeTruthy()
    expect(screen.getByText('Cell')).toBeTruthy()
    await fireEvent.press(screen.getByText('Button'))
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/components/[id]',
      params: { id: 'button' },
    })
    await fireEvent.press(screen.getByText('键盘与聊天'))
    expect(mockPush).toHaveBeenCalledWith('/labs/keyboard-chat')
  })

  it('filters the component catalog by search text', async () => {
    await render(<FixtureExplorer />)
    await fireEvent.changeText(screen.getByLabelText('搜索组件'), 'Cell')
    expect(screen.getByText('Cell')).toBeTruthy()
    expect(screen.queryByText('Button')).toBeNull()
    await fireEvent.changeText(screen.getByLabelText('搜索组件'), 'missing')
    expect(screen.getByText('没有找到组件')).toBeTruthy()
  })

  it('applies full bleed only to all-mode example wrappers', async () => {
    const Example = () => (
      <View testID="example-content">
        <Text>example</Text>
      </View>
    )
    const examples = [
      {
        Component: Example,
        description: 'example description',
        id: 'example',
        title: 'Example title',
      },
    ]

    {
      const view = await render(<FixtureOverview examples={examples} fullBleedExamples />)
      const fullBleedWrappers = findNodes(
        view.toJSON(),
        (node) => nodeStyle(node).marginHorizontal === -20,
      )

      expect(fullBleedWrappers).toHaveLength(1)
      expect(fullBleedWrappers[0].children?.[0].props.testID).toBe('example-content')
      await cleanup()
    }

    {
      const view = await render(<FixtureOverview examples={examples} />)
      expect(
        findNodes(view.toJSON(), (node) => nodeStyle(node).marginHorizontal === -20),
      ).toHaveLength(0)
      await cleanup()
    }

    {
      const view = await render(
        <FixtureOverview examples={examples} fullBleedExamples mode="single" />,
      )
      expect(
        findNodes(view.toJSON(), (node) => nodeStyle(node).marginHorizontal === -20),
      ).toHaveLength(0)
    }
  })
})
