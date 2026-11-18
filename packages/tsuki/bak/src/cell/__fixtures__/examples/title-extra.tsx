import { Cell, Text } from '../../..'

/**
 * @title Title extra
 * @description titleExtra 紧邻 title，属于 title row。
 */
export default function CellTitleExtraFixture() {
  return <Cell title="订单金额" titleExtra={<Text>含运费</Text>} value="¥128" />
}
