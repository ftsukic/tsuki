import { FixtureOverview } from '../../fixture-overview'
import SearchBasicExample from './examples/basic'
import SearchContactExample from './examples/contact'
import SearchControlledExample from './examples/controlled'
import SearchDisabledExample from './examples/disabled'
import SearchHeight40Example from './examples/height40'
import SearchMultilineExample from './examples/multiline'
import SearchPrefixExample from './examples/prefix'
import SearchSquareExample from './examples/square'
import SearchSuffixExample from './examples/suffix'

/**
 * @title Search overview
 * @description Search 汇总基础、布局扩展、尺寸、输入状态和联系人搜索场景。
 */
export default function SearchOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: SearchBasicExample,
          description: '默认 round Search 适合列表和页面内过滤。',
          id: 'basic',
          title: 'Basic',
        },
        {
          Component: SearchSquareExample,
          description: '使用 shape="square" 渲染方角搜索框。',
          id: 'square',
          title: 'Square',
        },
        {
          Component: SearchDisabledExample,
          description: '禁用状态保留内容展示，但不响应输入和清除操作。',
          id: 'disabled',
          title: 'Disabled',
        },
        {
          Component: SearchControlledExample,
          description: '通过 value 和 onChange 管理受控搜索关键词。',
          id: 'controlled',
          title: 'Controlled',
        },
        {
          Component: SearchContactExample,
          description: '与 Navbar 组合，展示联系人搜索入口。',
          id: 'contact',
          title: 'Contact search',
        },
        {
          Component: SearchHeight40Example,
          description: '自定义搜索框和真实输入区域的高度。',
          id: 'height40',
          title: 'Height 40',
        },
        {
          Component: SearchPrefixExample,
          description: '使用 prefix 自定义搜索框左侧布局区域。',
          id: 'prefix',
          title: 'Prefix',
        },
        {
          Component: SearchSuffixExample,
          description: '使用 suffix 自定义搜索框右侧布局区域。',
          id: 'suffix',
          title: 'Suffix',
        },
        {
          Component: SearchMultilineExample,
          description: '多行 Search 用于 IM 输入时随内容增长。',
          id: 'multiline',
          title: 'Multiline',
        },
      ]}
      fullBleedExamples
    />
  )
}
