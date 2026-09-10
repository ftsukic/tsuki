/** @description ImagePreview 的基础、手势和缩略图连续过渡示例。 */
import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import GestureExample from './examples/gesture'
import Transition from './examples/transition'

export default function ImagePreviewOverview() {
  return (
    <FixtureOverview
      examples={[
        { Component: Basic, description: '打开多图预览并切换。', id: 'basic', title: '基础用法' },
        {
          Component: GestureExample,
          description: '验证缩放、拖动和 dismiss。',
          id: 'gesture',
          title: '手势交互',
        },
        {
          Component: Transition,
          description: '从缩略图连续过渡到全屏。',
          id: 'transition',
          title: '缩略图过渡',
        },
      ]}
    />
  )
}
