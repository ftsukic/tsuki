import { Cell } from '../../..'

/**
 * @title Center
 * @description Center the Cell content vertically when a label is present.
 */
export default function CellCenterFixture() {
  return <Cell title="头像" label="使用默认头像" value="更换" center isLink />
}
