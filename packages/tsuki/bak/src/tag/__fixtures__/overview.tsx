import { FixtureOverview } from '../../fixture-overview'
import TagBasicExample from './examples/basic'
import TagCloseableExample from './examples/closeable'
import TagCustomColorExample from './examples/custom-color'
import TagShapesExample from './examples/shapes'
import TagSizesExample from './examples/sizes'

/**
 * @title Tag overview
 * @description Tag 汇总语义类型、形状、尺寸、关闭和自定义颜色示例。
 */
export default function TagOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: TagBasicExample,
          description: '展示五种 Tag 语义类型。',
          id: 'basic',
          title: '基础类型',
        },
        {
          Component: TagShapesExample,
          description: '展示 plain、round 和 mark 形状。',
          id: 'shapes',
          title: '形状和空心样式',
        },
        {
          Component: TagSizesExample,
          description: '展示 small、medium 和 large 三种尺寸。',
          id: 'sizes',
          title: '尺寸',
        },
        {
          Component: TagCloseableExample,
          description: '展示由外层状态控制卸载的 closeable 和 disabled 标签。',
          id: 'closeable',
          title: '可关闭和禁用',
        },
        {
          Component: TagCustomColorExample,
          description: '展示自定义背景、自动对比色和显式文字颜色。',
          id: 'custom-color',
          title: '自定义颜色',
        },
      ]}
    />
  )
}
