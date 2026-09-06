import { Radio } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

/**
 * @title 按钮样式
 * @description 参考 Ant Design Radio.Group，支持 optionType、outline/solid 和三种尺寸，也支持 Radio.Button。
 */
export default function Example() {
  return (
    <View style={{ gap: 16 }}>
      <Radio.Group defaultValue="apple" optionType="button" buttonStyle="outline">
        <Radio value="apple">Apple</Radio>
        <Radio value="pear">Pear</Radio>
        <Radio value="orange">Orange</Radio>
      </Radio.Group>
      <Radio.Group defaultValue="middle" optionType="button" buttonStyle="solid" size="small">
        <Radio.Button value="small">Small</Radio.Button>
        <Radio.Button value="middle">Middle</Radio.Button>
        <Radio.Button value="large">Large</Radio.Button>
      </Radio.Group>
      <Radio.Group block defaultValue="middle" optionType="button" buttonStyle="solid" size="small">
        <Radio.Button value="small">Small</Radio.Button>
        <Radio.Button value="middle">Middle</Radio.Button>
        <Radio.Button value="large">Large</Radio.Button>
      </Radio.Group>
    </View>
  )
}
