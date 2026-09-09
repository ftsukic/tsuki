import { Collapse, CollapseItem, Text } from '@ftsukic/tsuki'

/**
 * @title Accordion
 * @description Only one CollapseItem stays expanded at a time.
 */
export default function CollapseAccordionExample() {
  return (
    <Collapse accordion defaultValue="first">
      <CollapseItem name="first" title="标题 1">
        <Text>打开第二项时，第一项会自动收起。</Text>
      </CollapseItem>
      <CollapseItem name="second" title="标题 2">
        <Text>手风琴模式适合互斥内容。</Text>
      </CollapseItem>
      <CollapseItem name="third" title="标题 3">
        <Text>同一项再次点击会关闭内容。</Text>
      </CollapseItem>
    </Collapse>
  )
}
