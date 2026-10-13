import { Collapse, CollapseItem, Icon, Text } from '@ftsukic/tsuki'

/**
 * @title Semantic styles
 * @description Customize stable CollapseItem regions without targeting motion or measurement nodes.
 */
export default function CollapseSemanticExample() {
  return (
    <Collapse defaultValue="semantic">
      <CollapseItem
        icon={<Icon name="InfoCircleOutlined" />}
        name="semantic"
        styles={({ state }) => ({
          root: { marginHorizontal: 12 },
          header: { borderRadius: state.active ? 12 : 0 },
          leading: { opacity: state.disabled ? 0.4 : 1 },
          title: { color: '#1677ff' },
          body: { paddingHorizontal: 20 },
        })}
        title="语义区域"
      >
        <Text>style 指向 Item 根节点，styles 分别控制 Header、标题、图标与 Body。</Text>
      </CollapseItem>
    </Collapse>
  )
}
