import { Radio } from '@ftsukic/react-native-ui'
import { useState } from 'react'
import { Text, View } from 'react-native'

/**
 * @title 独立 Radio
 * @description standalone Radio 支持受控和非受控两种写法，选中后不会通过再次点击取消。
 */
export default function Example() {
  const [checked, setChecked] = useState(false)

  return (
    <View style={{ gap: 12 }}>
      <Radio checked={checked} onChange={setChecked}>
        受控选项
      </Radio>
      <Radio defaultChecked>非受控初始选中</Radio>
      <Text accessibilityLiveRegion="polite" style={{ color: '#68788d', fontSize: 12 }}>
        受控状态：{checked ? 'checked' : 'unchecked'}
      </Text>
    </View>
  )
}
