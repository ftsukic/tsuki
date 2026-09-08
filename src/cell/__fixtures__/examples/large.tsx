import { Cell } from '../../..'

/**
 * @title Large
 * @description Compare normal and large Cell typography and vertical padding.
 */
export default function CellLargeFixture() {
  return (
    <>
      <Cell title="普通尺寸" label="14px 标题层级" value="内容" />
      <Cell size="large" title="大号尺寸" label="16px 标题层级" value="内容" />
    </>
  )
}
