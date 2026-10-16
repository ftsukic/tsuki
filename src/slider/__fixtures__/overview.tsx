import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import Steps from './examples/steps'
import States from './examples/states'
import Theme from './examples/theme'

/**
 * @title Slider overview
 * @description Slider 展示数值选择、步长刻度、禁用只读和外观定制。
 */
export default function SliderOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: Basic,
          id: 'basic',
          title: 'Basic slider',
          description: '受控、非受控和完成事件。',
        },
        {
          Component: Steps,
          id: 'steps',
          title: 'Steps and marks',
          description: '步长、刻度和反向。',
        },
        {
          Component: States,
          id: 'states',
          title: 'Disabled and readonly',
          description: '禁用与只读。',
        },
        {
          Component: Theme,
          id: 'theme',
          title: 'Theme and custom thumb',
          description: 'Token、语义样式和自定义滑块。',
        },
      ]}
    />
  )
}
