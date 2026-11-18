import { FixtureOverview } from '../../fixture-overview'
import WatermarkBasicExample from './examples/basic'
import WatermarkCustomExample from './examples/custom'
import WatermarkImageExample from './examples/image'
import WatermarkLayoutExample from './examples/layout'
import WatermarkMultilineExample from './examples/multiline'
import WatermarkThemeExample from './examples/theme'

/**
 * @title Watermark overview
 * @description Watermark 汇总文字、图片、平铺布局、语义样式和主题 token 示例。
 */
export default function WatermarkOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: WatermarkBasicExample,
          description: '水印覆盖自身内容区域，且不阻挡下方内容的点击。',
          id: 'basic',
          title: '基础文字',
        },
        {
          Component: WatermarkMultilineExample,
          description: '数组内容会在同一个水印块中按多行文字渲染。',
          id: 'multiline',
          title: '多行文字',
        },
        {
          Component: WatermarkImageExample,
          description: '图片水印使用 RN ImageSource，并限制在单个水印区域中。',
          id: 'image',
          title: '图片水印',
        },
        {
          Component: WatermarkLayoutExample,
          description: '调整单块尺寸、两轴间距、起始偏移、旋转和透明度。',
          id: 'layout',
          title: '布局和透明度',
        },
        {
          Component: WatermarkCustomExample,
          description: '使用 root、mark 和 text 语义插槽定制局部外观。',
          id: 'custom',
          title: '语义样式',
        },
        {
          Component: WatermarkThemeExample,
          description: '通过 ConfigProvider 覆盖 Watermark component token。',
          id: 'theme',
          title: '主题 token',
        },
      ]}
    />
  )
}
