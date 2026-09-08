import { FixtureOverview } from '../../fixture-overview'
import OverlayBasicExample from './examples/basic'
import OverlayEmbeddedExample from './examples/embedded'
import OverlayInteractionsExample from './examples/interactions'
import OverlayThemeExample from './examples/theme'

/**
 * @title Overlay overview
 * @description Overlay 通过 selector 汇总遮罩、嵌入内容、交互和主题示例，每次只挂载一个遮罩。
 */
export default function OverlayOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: OverlayBasicExample,
          description: '使用 show 控制遮罩显示，点击遮罩后由调用方关闭组件。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: OverlayEmbeddedExample,
          description: 'children 会显示在遮罩上方，可放置按钮等交互内容。',
          id: 'embedded',
          title: '嵌入内容',
        },
        {
          Component: OverlayInteractionsExample,
          description: 'backgroundColor 可以设为 transparent，duration 使用毫秒并支持受控开关。',
          id: 'interactions',
          title: '透明遮罩与动画',
        },
        {
          Component: OverlayThemeExample,
          description: '通过 Overlay token 和 semantic styles 定制遮罩与内容区域。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
