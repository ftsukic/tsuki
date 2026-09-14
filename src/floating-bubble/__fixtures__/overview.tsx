import { FixtureOverview } from '../../fixture-overview'
import AxisExample from './examples/axis'
import BasicExample from './examples/basic'
import ControlledExample from './examples/controlled'
import CustomExample from './examples/custom'
import MagneticExample from './examples/magnetic'
import SafeAreaExample from './examples/safe-area'
import ThemeExample from './examples/theme'

/**
 * @title FloatingBubble overview
 * @description FloatingBubble 汇总视口定位、拖动方向、磁吸、受控位置、自定义内容、安全区和主题示例。
 */
export default function FloatingBubbleOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: BasicExample,
          description: '默认位于视口右下区域，点击气泡可以更新页面反馈。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: AxisExample,
          description: 'axis 支持横向、纵向、自由拖动和完全锁定四种模式。',
          id: 'axis',
          title: '拖动方向',
        },
        {
          Component: MagneticExample,
          description: 'magnetic="x" 允许自由拖动，松手后吸附到最近的左右边界。',
          id: 'magnetic',
          title: '横向磁吸',
        },
        {
          Component: ControlledExample,
          description: 'offset 与 onOffsetChange 组成受控位置，页面同步展示最终坐标。',
          id: 'controlled',
          title: '受控位置',
        },
        {
          Component: CustomExample,
          description: 'children 可以是任意自定义内容，真实尺寸会参与边界计算。',
          id: 'custom',
          title: '自定义内容',
        },
        {
          Component: SafeAreaExample,
          description: '默认避开顶部和底部 safe area，也可以分别关闭对应 inset。',
          id: 'safe-area',
          title: '安全区',
        },
        {
          Component: ThemeExample,
          description: '通过 FloatingBubble token 和 semantic styles 定制外观。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
