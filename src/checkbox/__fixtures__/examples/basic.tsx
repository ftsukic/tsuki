import { Button, Checkbox, Flex, Text } from '@ftsukic/tsuki'
import { useState } from 'react'
import { View } from 'react-native'

/**
 * @title 基础状态
 * @description 展示受控、非受控、禁用、左右标签和两种 checkbox shape。
 */
export default function Example() {
  const [checked, setChecked] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Checkbox checked={checked} onChange={setChecked}>
        受控选项
      </Checkbox>
      <Checkbox defaultChecked>非受控初始选中</Checkbox>
      <Checkbox disabled>禁用未选中</Checkbox>
      <Checkbox disabled checked>
        禁用已选中
      </Checkbox>
      <Checkbox shape="square" labelPosition="left">
        方形且标签在左侧
      </Checkbox>
      <Checkbox shape="square" styles={{ indicator: { borderRadius: 4 } }}>
        <Flex>
          <Text>自定义render</Text>
          <Button variant="text" type="primary">
            协议1
          </Button>
          <Text>和</Text>
          <Button variant="text" type="primary">
            协议2
          </Button>
        </Flex>
      </Checkbox>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        受控状态：{checked ? 'checked' : 'unchecked'}
      </Text>
    </View>
  )
}
