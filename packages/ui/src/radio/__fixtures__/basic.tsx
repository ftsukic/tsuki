import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ConfigProvider, Radio } from '../..'

/**
 * @title Radio and Radio.Group
 * @description Support standalone state, child radios and options-based groups.
 */
export default function RadioBasicFixture() {
  const [standalone, setStandalone] = useState(false)
  const [value, setValue] = useState('apple')

  return (
    <ConfigProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>Standalone</Text>
        <Radio checked={standalone} onChange={setStandalone} shape="round">
          接收通知
        </Radio>

        <Text style={styles.heading}>Child radios</Text>
        <Radio.Group value={value} onChange={(nextValue) => setValue(String(nextValue))} gap={12}>
          <Radio value="apple">Apple</Radio>
          <Radio value="banana">Banana</Radio>
          <Radio value="disabled" disabled>
            Disabled
          </Radio>
        </Radio.Group>

        <Text style={styles.heading}>Options</Text>
        <Radio.Group
          defaultValue={1}
          direction="horizontal"
          options={[
            { value: 1, label: '男' },
            { value: 2, label: '女' },
          ]}
        />

        <Text style={styles.status}>当前值：{value}</Text>
      </View>
    </ConfigProvider>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16, padding: 24 },
  heading: { color: '#68788d', fontSize: 13 },
  status: { color: '#1989fa', fontSize: 14 },
})
