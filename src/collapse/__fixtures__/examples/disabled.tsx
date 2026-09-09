import { Collapse, CollapseItem, Text } from '@ftsukic/tsuki'

/**
 * @title Disabled item
 * @description A disabled item keeps its content closed and ignores presses.
 */
export default function CollapseDisabledExample() {
  return (
    <Collapse>
      <CollapseItem name="available" title="可用项">
        <Text>这个面板可以正常展开。</Text>
      </CollapseItem>
      <CollapseItem disabled name="disabled" title="禁用项">
        <Text>禁用项不会被点击展开。</Text>
      </CollapseItem>
    </Collapse>
  )
}
