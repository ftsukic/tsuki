import { FixtureOverview } from '../../fixture-overview'
import ButtonGroupFixture from './examples/group'
import ButtonPressFeedbackFixture from './examples/press-feedback'
import ButtonShapesFixture from './examples/shapes'
import ButtonVariantsFixture from './examples/variants'
import ButtonSizesFixture from './examples/sizes'
import ButtonLoadingFixture from './examples/loading'

/**
 * @title 按钮概览
 * @description 按钮的变体、尺寸、图标与加载、形状、按钮组和按下反馈。
 */
export default function ButtonOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: ButtonVariantsFixture,
          description: '展示类型、视觉变体、自定义颜色和语义样式。',
          id: 'variants',
          title: '类型与变体',
        },
        {
          Component: ButtonSizesFixture,
          description: '比较尺寸、块级布局和文字按钮。',
          id: 'sizes',
          title: '尺寸与布局',
        },
        {
          Component: ButtonLoadingFixture,
          description: '切换加载状态，观察图标位置、替换和文字保留。',
          id: 'loading',
          title: '图标与加载',
        },
        {
          Component: ButtonShapesFixture,
          description: '比较默认、方角、胶囊和圆形图标按钮。',
          id: 'shapes',
          title: '形状',
        },
        {
          Component: ButtonGroupFixture,
          description: '展示连接、尺寸和变体继承，以及等分宽度。',
          id: 'group',
          title: '按钮组',
        },
        {
          Component: ButtonPressFeedbackFixture,
          description: '比较文字按钮的透明度和显式覆盖层反馈。',
          id: 'press-feedback',
          title: '按下反馈',
        },
      ]}
    />
  )
}
