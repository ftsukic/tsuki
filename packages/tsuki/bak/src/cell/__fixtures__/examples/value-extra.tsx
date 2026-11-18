import { Cell, Text } from '../../..'

/**
 * @title Value extra
 * @description valueExtra 紧邻 value，适合单位、按钮或状态节点。
 */
export default function CellValueExtraFixture() {
  return <Cell title="验证码" value="1234" valueExtra={<Text>秒</Text>} />
}
