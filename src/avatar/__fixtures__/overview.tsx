import { FixtureOverview } from '../../fixture-overview'
import AvatarBasicExample from './examples/basic'
import AvatarGroupExample from './examples/group'
import AvatarSourcesExample from './examples/sources'

/**
 * @title Avatar overview
 * @description Avatar 汇总尺寸、形状、来源、分组和角标组合示例。
 */
export default function AvatarOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: AvatarBasicExample,
          description:
            'Avatar 支持 small、medium、large 和自定义数值尺寸，并可切换圆形、方形或自定义圆角。',
          id: 'basic',
          title: '尺寸和形状',
        },
        {
          Component: AvatarSourcesExample,
          description:
            '图片加载失败时按 icon、children 的顺序回退；图片地址支持字符串或 RN Image source。',
          id: 'sources',
          title: '图片、图标和字符',
        },
        {
          Component: AvatarGroupExample,
          description: 'Group 会叠放直接子级 Avatar，maxCount 超出后显示可点击的 +N 头像。',
          id: 'group',
          title: 'Avatar.Group',
        },
      ]}
    />
  )
}
