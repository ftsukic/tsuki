import { FixtureOverview } from '../../fixture-overview'
import TextInputBasicExample from './examples/basic'

/**
 * @title TextInput overview
 * @description TextInput 展示 React Native 基础输入能力。
 */
export default function TextInputOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: TextInputBasicExample,
          description: '受控、非受控、原生事件、键盘、密码、多行和不可编辑输入。',
          id: 'basic',
          title: 'TextInput states',
        },
      ]}
    />
  )
}
