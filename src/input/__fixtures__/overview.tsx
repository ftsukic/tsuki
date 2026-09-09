import { FixtureOverview } from '../../fixture-overview'
import InputBasicFixture from './examples/basic'
import InputLayoutFixture from './examples/layout'
import InputNumberFixture from './examples/number'
import InputPasswordFixture from './examples/password'
import InputTextareaFixture from './examples/textarea'

/**
 * @title Input overview
 * @description Input 汇总基础、密码、数字和多行输入模式。
 */
export default function InputOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: InputBasicFixture,
          description: '受控输入、清除操作和 disabled/readOnly 状态。',
          id: 'basic',
          title: '基础 Input',
        },
        {
          Component: InputPasswordFixture,
          description: 'password 模式通过眼睛按钮切换明文和密文。',
          id: 'password',
          title: 'Password',
        },
        {
          Component: InputNumberFixture,
          description: 'number 模式使用数字键盘，但值保持字符串。',
          id: 'number',
          title: 'Number',
        },
        {
          Component: InputTextareaFixture,
          description: 'multiline 模式支持 rows、清除和字数限制。',
          id: 'textarea',
          title: 'Textarea',
        },
        {
          Component: InputLayoutFixture,
          description: 'small/large 尺寸、前后缀和 addon 组合布局。',
          id: 'layout',
          title: '尺寸和布局',
        },
      ]}
    />
  )
}
