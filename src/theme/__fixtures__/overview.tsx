import { FixtureOverview } from '../../fixture-overview'
import ThemeAlgorithmsExample from './examples/algorithms'

/**
 * @title Theme overview
 * @description Theme 汇总亮暗算法和组件 token 覆盖示例。
 */
export default function ThemeOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ThemeAlgorithmsExample,
          description:
            'Switch between light and dark algorithms and inspect a component token override.',
          id: 'algorithms',
          title: 'Theme algorithms and overrides',
        },
      ]}
    />
  )
}
