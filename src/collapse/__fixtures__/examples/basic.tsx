import { Collapse, CollapseItem, Icon, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

/**
 * @title Basic collapse
 * @description Open multiple panels independently and provide a custom leading icon.
 */
export default function CollapseBasicExample() {
  return (
    <Collapse>
      <CollapseItem icon={<Icon name="InfoCircleOutlined" />} name="first" title="标题 1">
        <Text>这是第一个面板的内容。</Text>
      </CollapseItem>
      <CollapseItem name="second" title="标题 2">
        <View>
          <Text>非 accordion 模式允许同时展开多个面板。</Text>
        </View>
      </CollapseItem>
    </Collapse>
  )
}
