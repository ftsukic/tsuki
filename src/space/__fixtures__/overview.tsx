import { FixtureOverview } from '../../fixture-overview'
import SpaceBasicFixture from './examples/basic'
import SpaceVerticalFixture from './examples/vertical'
import SpaceWrapFixture from './examples/wrap'

/**
 * @title Space overview
 * @description Space 汇总横向、纵向、gap、换行和交叉轴对齐示例。
 */
export default function SpaceOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SpaceBasicFixture,
          description: '横向排列一组操作项。',
          id: 'basic',
          title: '横向间距',
        },
        {
          Component: SpaceVerticalFixture,
          description: '纵向堆叠内容并保持固定 gap。',
          id: 'vertical',
          title: '纵向间距',
        },
        {
          Component: SpaceWrapFixture,
          description: '启用 wrap 并设置交叉轴对齐。',
          id: 'wrap',
          title: '换行和对齐',
        },
      ]}
    />
  )
}
