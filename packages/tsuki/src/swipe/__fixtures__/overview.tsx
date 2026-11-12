import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Autoplay from './examples/autoplay'
import Loop from './examples/loop'
import Vertical from './examples/vertical'
import CustomIndicator from './examples/custom-indicator'
import Imperative from './examples/imperative'

export default function SwipeOverview() {
  return (
    <FixtureOverview
      examples={[
        { Component: Basic, description: '基础横向轮播。', id: 'basic', title: '基础用法' },
        { Component: Autoplay, description: '自动播放。', id: 'autoplay', title: '自动播放' },
        { Component: Loop, description: '循环播放与首尾衔接。', id: 'loop', title: '循环播放' },
        { Component: Vertical, description: '纵向轮播。', id: 'vertical', title: '纵向滚动' },
        {
          Component: CustomIndicator,
          description: '自定义指示器。',
          id: 'indicator',
          title: '自定义 indicator',
        },
        {
          Component: Imperative,
          description: '命令式导航。',
          id: 'imperative',
          title: 'Imperative ref',
        },
      ]}
    />
  )
}
