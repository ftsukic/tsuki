import { FixtureOverview } from '../../fixture-overview'
import TransitionLifecycleExample from './examples/transition-lifecycle'
import PropertyAnimationExample from './examples/property-animation'
import TransitionEffectsExample from './examples/transition-effects'
import MotionConfigExample from './examples/motion-config'
import SemanticPresetsExample from './examples/semantic-presets'
import InterruptionExample from './examples/interruption'
import FeedbackExample from './examples/feedback'
import ComponentMotionExample from './examples/component-motion'
import TransitionHooksExample from './examples/transition-hooks'
import SharedProgressExample from './examples/shared-progress'

/**
 * @title Motion 动效
 * @description 分别查看过渡生命周期、属性动画、策略、预设与组件接入。
 */
export default function MotionOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: TransitionLifecycleExample,
          id: 'transition-lifecycle',
          title: '退出与卸载',
          description: '只观察卡片的生命周期与卸载空态。',
        },
        {
          Component: PropertyAnimationExample,
          id: 'property-animation',
          title: '属性动画',
          description: '在固定展示区域内改变属性，始终保持挂载。',
        },
        {
          Component: TransitionEffectsExample,
          id: 'transition-effects',
          title: '基础过渡效果',
          description: '十一种效果独立展示隐藏状态。',
        },
        {
          Component: MotionConfigExample,
          id: 'motion-config',
          title: '动效策略',
          description: '全局、局部开关与减少动态效果。',
        },
        {
          Component: SemanticPresetsExample,
          id: 'semantic-presets',
          title: '语义预设',
          description: '比较浮层与强调场景的 preset。',
        },
        {
          Component: InterruptionExample,
          id: 'interruption',
          title: '快速反转',
          description: '动画途中反向切换与最终完成事件。',
        },
        {
          Component: FeedbackExample,
          id: 'feedback',
          title: '反馈动效',
          description: '旋转、呼吸和错误反馈。',
        },
        {
          Component: ComponentMotionExample,
          id: 'component-motion',
          title: '组件动效',
          description: 'Popup 退出与 Collapse 动态内容。',
        },
        {
          Component: TransitionHooksExample,
          id: 'transition-hooks',
          title: '过渡 Hook',
          description: '自行承载 animated style 的用法。',
        },
        {
          Component: SharedProgressExample,
          id: 'shared-progress',
          title: '共享进度',
          description: '同一个 progress 驱动多个样式。',
        },
      ]}
    />
  )
}
