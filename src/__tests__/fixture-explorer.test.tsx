import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import FixtureExplorer from '../../example/components/fixture-explorer'
import { FixtureOverview } from '../fixture-overview'
import type { StyleProp, ViewStyle } from 'react-native'

let mockProviderMounts = 0
let mockPortalHostMounts = 0

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

jest.mock(
  '@ftsukic/tsuki',
  () => {
    const React = jest.requireActual('react')
    const { View } = jest.requireActual('react-native')

    function MockPortalHost({ children }: { children?: ReactNode }) {
      React.useState(() => {
        mockPortalHostMounts += 1
        return null
      })

      return React.createElement(View, { testID: 'fixture-portal-host' }, children)
    }

    function MockProvider({ children }: { children?: ReactNode }) {
      React.useState(() => {
        mockProviderMounts += 1
        return null
      })

      return React.createElement(
        View,
        { testID: 'fixture-provider' },
        React.createElement(MockPortalHost, null, children),
      )
    }

    return { Provider: MockProvider }
  },
  { virtual: true },
)

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
  afterEach(() => {
    cleanup()
    mockProviderMounts = 0
    mockPortalHostMounts = 0
  })

  it('shows components, opens an overview, returns, and preserves the portal boundary', async () => {
    await render(<FixtureExplorer />)

    expect(screen.getByText('Components / 组件预览')).toBeTruthy()
    expect(screen.getByText('Button')).toBeTruthy()
    expect(screen.getByText('Cell')).toBeTruthy()
    expect(screen.queryByText('Button variants')).toBeNull()
    expect(screen.queryByText('first fixture content')).toBeNull()
    expect(screen.getAllByTestId('fixture-provider')).toHaveLength(1)
    expect(screen.getAllByTestId('fixture-portal-host')).toHaveLength(1)
    expect(mockProviderMounts).toBe(1)
    expect(mockPortalHostMounts).toBe(1)

    // The explorer's state update is queued by the Pressable event handler.
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByText('Button'))

    expect(screen.getByText('Button overview')).toBeTruthy()
    expect(screen.queryByText('Cell')).toBeNull()
    expect(screen.getAllByTestId('fixture-provider')).toHaveLength(1)
    expect(screen.getAllByTestId('fixture-portal-host')).toHaveLength(1)
    expect(mockProviderMounts).toBe(1)
    expect(mockPortalHostMounts).toBe(1)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('返回组件列表'))

    expect(screen.getByText('Components / 组件预览')).toBeTruthy()
    expect(screen.getByText('Button')).toBeTruthy()
    expect(screen.getByText('Cell')).toBeTruthy()
    expect(screen.getAllByTestId('fixture-provider')).toHaveLength(1)
    expect(screen.getAllByTestId('fixture-portal-host')).toHaveLength(1)
    expect(mockProviderMounts).toBe(1)
    expect(mockPortalHostMounts).toBe(1)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByText('Cell'))

    expect(screen.getByText('Cell overview')).toBeTruthy()
    expect(screen.queryByText('Button')).toBeNull()
    expect(screen.getAllByTestId('fixture-provider')).toHaveLength(1)
    expect(screen.getAllByTestId('fixture-portal-host')).toHaveLength(1)
    expect(mockProviderMounts).toBe(1)
    expect(mockPortalHostMounts).toBe(1)

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('返回组件列表'))

    expect(screen.getByText('Components / 组件预览')).toBeTruthy()
    expect(mockProviderMounts).toBe(1)
    expect(mockPortalHostMounts).toBe(1)
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
      cleanup()
    }

    {
      const view = await render(<FixtureOverview examples={examples} />)
      expect(
        findNodes(view.toJSON(), (node) => nodeStyle(node).marginHorizontal === -20),
      ).toHaveLength(0)
      cleanup()
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
