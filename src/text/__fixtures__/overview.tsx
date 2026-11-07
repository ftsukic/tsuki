import { FixtureOverview } from '../../fixture-overview'
import TextBasicExample from './examples/basic'
import TextInheritanceExample from './examples/inheritance'
import TextSemanticExample from './examples/semantic'

/**
 * @title Text overview
 * @description Text 汇总基础文本、语义、尺寸和字重示例。
 */
export default function TextOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: TextBasicExample,
          description: '默认文本自动使用当前主题的 colorText，显式 style 可以覆盖主题颜色。',
          id: 'basic',
          title: '基础文本',
        },
        {
          Component: TextInheritanceExample,
          description: '深层业务组件中的 Tsuki Text 继承 Button 内容样式，并可使用 className。',
          id: 'inheritance',
          title: '继承文本样式',
        },
        {
          Component: TextSemanticExample,
          description: '使用 type、size 和 weight 表达移动端常见的文本层级，不提供 Heading 体系。',
          id: 'semantic',
          title: '语义、尺寸和字重',
        },
      ]}
    />
  )
}
