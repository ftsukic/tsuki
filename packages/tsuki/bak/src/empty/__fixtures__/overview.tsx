import { FixtureOverview } from '../../fixture-overview'
import EmptyBasicExample from './examples/basic'
import EmptyDescriptionExample from './examples/custom-description'
import EmptyImageExample from './examples/custom-image'
import EmptyActionExample from './examples/action'
import EmptyThemeExample from './examples/theme'

/**
 * @title Empty overview
 * @description Empty 汇总默认空状态、描述、图片、底部操作区域和主题定制示例。
 */
export default function EmptyOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: EmptyBasicExample,
          description: '使用本地 Vant 默认空状态插画，不依赖网络或 Icon。',
          id: 'basic',
          title: '默认 Empty',
        },
        {
          Component: EmptyDescriptionExample,
          description: 'description 支持自定义 ReactNode。',
          id: 'custom-description',
          title: '自定义 description',
        },
        {
          Component: EmptyImageExample,
          description: 'image 支持字符串地址和自定义 ReactNode，imageSize 可调整容器尺寸。',
          id: 'custom-image',
          title: '自定义 image',
        },
        {
          Component: EmptyActionExample,
          description: 'children 会渲染在只负责间距布局的底部操作区域。',
          id: 'action',
          title: '带 Button 操作',
        },
        {
          Component: EmptyThemeExample,
          description: '通过 Empty component token 调整图片尺寸、描述文字和底部间距。',
          id: 'theme',
          title: '主题定制',
        },
      ]}
    />
  )
}
