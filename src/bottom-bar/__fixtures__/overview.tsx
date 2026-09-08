import { FixtureOverview } from '../../fixture-overview'
import BottomBarBasicExample from './examples/basic'
import BottomBarButtonGroupExample from './examples/button-group'
import BottomBarCustomStyleExample from './examples/custom-style'
import BottomBarInputExample from './examples/input'
import BottomBarSafeAreaExample from './examples/safe-area'

/**
 * @title BottomBar overview
 * @description BottomBar 提供页面底部固定布局，可承载按钮组、输入框和任意操作内容。
 */
export default function BottomBarOverview() {
  return (
    <FixtureOverview
      mode="single"
      fullBleedExamples
      examples={[
        {
          Component: BottomBarBasicExample,
          description: 'BottomBar 作为页面根容器的底部操作区域，children 由调用方决定。',
          id: 'basic',
          title: '基础用法',
        },
        {
          Component: BottomBarButtonGroupExample,
          description: '使用 Button.Group block 在底部展示等宽按钮组。',
          id: 'button-group',
          title: '底部按钮组',
        },
        {
          Component: BottomBarInputExample,
          description: '将 TextInput 和 Button 组合为底部输入操作区域。',
          id: 'input',
          title: '输入操作区',
        },
        {
          Component: BottomBarSafeAreaExample,
          description: '默认把底部 safe-area inset 加入容器内边距。',
          id: 'safe-area',
          title: '底部安全区',
        },
        {
          Component: BottomBarCustomStyleExample,
          description: '通过根 style 覆盖背景、圆角和间距。',
          id: 'custom-style',
          title: '自定义样式',
        },
      ]}
    />
  )
}
