import { Cell } from '../../..'

/**
 * @title Semantic styles
 * @description Customize Cell slots with the existing semantic styles contract.
 */
export default function CellSemanticFixture() {
  return (
    <Cell
      title="通知"
      value="开启"
      isLink
      styles={({ state }) => ({
        root: { paddingHorizontal: 20 },
        title: { color: state.disabled ? '#999999' : '#111111' },
        content: { color: '#1989FA' },
        actions: { width: 24 },
      })}
    />
  )
}
