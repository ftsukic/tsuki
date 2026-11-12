import { cleanup, render } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'
import { FixtureOverview } from '../fixture-overview'
import type { StyleProp, ViewStyle } from 'react-native'

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

afterEach(async () => {
  await cleanup()
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
