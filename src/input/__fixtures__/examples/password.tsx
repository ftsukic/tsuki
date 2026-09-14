import { Input } from '../../..'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/**
 * @title Input password
 * @description 使用眼睛按钮切换密码可见状态。
 */
export default function InputPasswordFixture() {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Input
        type="password"
        value={value}
        bordered
        placeholder="请输入密码"
        clearable
        passwordVisible={visible}
        onPasswordVisibleChange={setVisible}
        onChangeText={setValue}
      />
      <Text>密码可见：{visible ? '是' : '否'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
