import { FixtureOverview } from '../../fixture-overview'
import MotionExample from './examples/MotionExample'
import PresetsExample from './examples/PresetsExample'
import ProgressExample from './examples/progress'

/**
 * @title Motion overview
 * @description 统一动画 Hook 和 preset 的可视化验证。
 */
export default function MotionOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: MotionExample,
          description: '验证 fade、scale 和 popupBottom transition。',
          id: 'transitions',
          title: 'Transitions',
        },
        {
          Component: PresetsExample,
          description: '验证 dialog、drawerLeft 和 drawerRight preset。',
          id: 'presets',
          title: 'Presets',
        },
        {
          Component: ProgressExample,
          description: '使用同一个 shared progress 同时驱动多个动画样式。',
          id: 'progress',
          title: 'Shared progress',
        },
      ]}
    />
  )
}
