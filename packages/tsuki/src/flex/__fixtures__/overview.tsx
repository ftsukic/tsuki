import { FixtureOverview } from '../../fixture-overview'
import FlexAlignmentFixture from './examples/alignment'
import FlexBasicFixture from './examples/basic'
import FlexDirectionsFixture from './examples/directions'
import FlexWrapFixture from './examples/wrap'

/**
 * @title Flex overview
 * @description Flex 汇总方向、换行、gap 以及两轴对齐能力。
 */
export default function FlexOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: FlexBasicFixture,
          description: '使用 gap 排列一组横向兄弟元素。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: FlexDirectionsFixture,
          description: '比较 row 和 column 两种方向。',
          id: 'directions',
          title: '方向',
        },
        {
          Component: FlexWrapFixture,
          description: '启用 wrap 后允许子项换行。',
          id: 'wrap',
          title: '换行',
        },
        {
          Component: FlexAlignmentFixture,
          description: '组合 align 和 justify 完成工具栏布局。',
          id: 'alignment',
          title: '对齐',
        },
      ]}
    />
  )
}
