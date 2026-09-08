import { Cell } from '../../..'

/**
 * @title Extra extension
 * @description extra is a library extension rendered at the end of the CellGroup header.
 */
export default function CellExtraFixture() {
  return (
    <Cell.Group title="账户信息" extra="编辑">
      <Cell title="昵称" value="Altron" />
    </Cell.Group>
  )
}
