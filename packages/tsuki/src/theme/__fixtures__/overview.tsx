import { FixtureOverview } from '../../fixture-overview'
import ThemeAlgorithmsExample from './examples/algorithms'

/**
 * @title Theme overview
 * @description Theme 展示明暗算法、当前配置和解析后生效的主题参数。
 */
export default function ThemeOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ThemeAlgorithmsExample,
          description: '切换明暗主题，查看当前输入配置和解析后生效的主题参数。',
          id: 'algorithms',
          title: 'Theme algorithms and overrides',
        },
      ]}
    />
  )
}
