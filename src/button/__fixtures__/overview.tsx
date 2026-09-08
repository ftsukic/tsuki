import { FixtureOverview } from '../../fixture-overview'
import ButtonGroupFixture from './examples/group'
import ButtonShapesFixture from './examples/shapes'
import ButtonVariantsFixture from './examples/variants'

/**
 * @title Button overview
 * @description Button 的类型、状态和形状预览。
 */
export default function ButtonOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ButtonVariantsFixture,
          description: 'Check the common button types, states, sizes and semantic slots.',
          id: 'variants',
          title: 'Button variants',
        },
        {
          Component: ButtonGroupFixture,
          description:
            'Show connected horizontal button groups, inherited sizes and child overrides.',
          id: 'group',
          title: 'Button groups',
        },
        {
          Component: ButtonShapesFixture,
          description:
            'Compare the default, square, round and icon-only circle shapes across sizes.',
          id: 'shapes',
          title: 'Button shapes',
        },
      ]}
    />
  )
}
