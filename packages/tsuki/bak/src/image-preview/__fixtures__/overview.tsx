/** @description ImagePreview 的基础、自定义 adapter、手势和缩略图连续过渡示例。 */
import { FixtureOverview } from '../../fixture-overview'
import Basic from './examples/basic'
import CustomRenderer from './examples/custom-renderer'
import GestureExample from './examples/gesture'
import Transition from './examples/transition'
import SourceBasic from './examples/source-basic'
import ChatMessages from './examples/chat-messages'
import NetworkImages from './examples/network-images'
import OnlineImage from './examples/online-image'

export default function ImagePreviewOverview() {
  return (
    <FixtureOverview
      mode="single"
      examples={[
        {
          Component: SourceBasic,
          id: 'source-basic',
          title: '本地图片与统一手势',
          description: '统一验证缩放、分页和来源交接。',
        },
        {
          Component: ChatMessages,
          id: 'chat-messages',
          title: '聊天图片 · 300 张',
          description: '虚拟消息列表、来源回收与长按菜单。',
        },
        {
          Component: NetworkImages,
          id: 'network-images',
          title: '网络图片',
          description: '缩略图与预览独立加载。',
        },
        {
          Component: OnlineImage,
          id: 'online-image',
          title: '原图加载',
          description: '原图加载失败保留预览。',
        },
        { Component: Basic, description: '打开多图预览并切换。', id: 'basic', title: '基础用法' },
        {
          Component: CustomRenderer,
          description: '接入自定义 Image，同时复用组件的加载状态。',
          id: 'custom-renderer',
          title: '自定义图片 adapter',
        },
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
