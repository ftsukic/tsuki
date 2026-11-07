/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PortalHost } from '..'
import FixtureExplorer from '../../example/components/fixture-explorer'
import { FixtureOverview, FixtureOverviewModeProvider } from '../fixture-overview'
import type { StyleProp, ViewStyle } from 'react-native'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }), { virtual: true })
jest.mock('@/theme', () => {
  const actual = jest.requireActual('@/theme')
  return {
    ...actual,
    useAppTheme: () => actual.resolveAppTheme(actual.defaultAppTheme, { mode: 'light' }),
    useAppThemeSettings: () => ({
      mode: 'system',
      setMode: jest.fn(),
      baseFontSize: 16,
      setBaseFontSize: jest.fn(),
    }),
  }
})
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

function createFixtureExamples(onFirstUnmount = jest.fn()) {
  function FirstExample() {
    useEffect(() => () => onFirstUnmount(), [])
    return <Text testID="first-example">第一个示例内容</Text>
  }

  function SecondExample() {
    return <Text testID="second-example">第二个示例内容</Text>
  }

  return {
    examples: [
      {
        Component: FirstExample,
        description: '第一个示例说明',
        id: 'first',
        title: '示例一',
      },
      {
        Component: SecondExample,
        description: '第二个示例说明',
        id: 'second',
        title: '示例二',
      },
    ],
    onFirstUnmount,
  }
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

describe('FixtureOverview mode', () => {
  it('renders every example by default without a provider', async () => {
    const { examples } = createFixtureExamples()

    await render(<FixtureOverview examples={examples} />)

    expect(screen.getByTestId('first-example')).toBeTruthy()
    expect(screen.getByTestId('second-example')).toBeTruthy()
    expect(screen.queryByText('选择示例')).toBeNull()
  })

  it('mounts only the selected example when the provider mode is single', async () => {
    const { examples } = createFixtureExamples()

    await render(
      <FixtureOverviewModeProvider mode="single">
        <PortalHost>
          <FixtureOverview examples={examples} />
        </PortalHost>
      </FixtureOverviewModeProvider>,
    )

    expect(screen.getByTestId('first-example')).toBeTruthy()
    expect(screen.queryByTestId('second-example')).toBeNull()
    expect(screen.getByText('选择示例')).toBeTruthy()
  })

  it('unmounts the previous example after switching selection', async () => {
    const onFirstUnmount = jest.fn()
    const { examples } = createFixtureExamples(onFirstUnmount)

    await render(
      <FixtureOverviewModeProvider mode="single">
        <FixtureOverview examples={examples} />
      </FixtureOverviewModeProvider>,
    )
    await fireEvent.press(screen.getByText('示例二'))

    expect(screen.queryByTestId('first-example')).toBeNull()
    expect(screen.getByTestId('second-example')).toBeTruthy()
    expect(onFirstUnmount).toHaveBeenCalledTimes(1)
  })

  it('lets explicit all mode override a single-mode provider', async () => {
    const { examples } = createFixtureExamples()

    await render(
      <FixtureOverviewModeProvider mode="single">
        <FixtureOverview examples={examples} mode="all" />
      </FixtureOverviewModeProvider>,
    )

    expect(screen.getByTestId('first-example')).toBeTruthy()
    expect(screen.getByTestId('second-example')).toBeTruthy()
    expect(screen.queryByText('选择示例')).toBeNull()
  })

  it('keeps explicit single mode when the provider mode is all', async () => {
    const { examples } = createFixtureExamples()

    await render(
      <FixtureOverviewModeProvider mode="all">
        <FixtureOverview examples={examples} mode="single" />
      </FixtureOverviewModeProvider>,
    )

    expect(screen.getByTestId('first-example')).toBeTruthy()
    expect(screen.queryByTestId('second-example')).toBeNull()
    expect(screen.getByText('选择示例')).toBeTruthy()
  })
})
