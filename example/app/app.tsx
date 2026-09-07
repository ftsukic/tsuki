import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { Avatar, Button, Cell, Provider, Radio, TextInput } from '@ftsukic/tsuki'

export default function App() {
  const [selected, setSelected] = useState(false)
  const [value, setValue] = useState('')
  const [pressCount, setPressCount] = useState(0)

  return (
    <SafeAreaProvider>
      <Provider>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>@ftsukic/tsuki</Text>
            <Text style={styles.title}>React Native UI 预览</Text>
            <Text style={styles.description}>
              Expo 示例直接引用根目录 src，检查组件在原生环境中的基础行为。
            </Text>

            <View style={styles.avatarRow}>
              <Avatar size="large" shape="circle">
                T
              </Avatar>
              <View>
                <Text style={styles.sectionTitle}>基础组件</Text>
                <Text style={styles.muted}>Button、Cell、Radio、TextInput</Text>
              </View>
            </View>

            <Cell title="点击次数" value={`${pressCount}`} isLink={false} />
            <Button type="primary" block onPress={() => setPressCount((count) => count + 1)}>
              点击测试
            </Button>

            <Radio checked={selected} onChange={setSelected}>
              我已阅读示例说明
            </Radio>
            <TextInput
              value={value}
              placeholder="输入内容检查 TextInput"
              onChangeText={setValue}
              style={styles.input}
            />
            {value ? <Text style={styles.muted}>当前内容：{value}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </Provider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    gap: 16,
    padding: 24,
  },
  eyebrow: {
    color: '#1989FA',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#101828',
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '600',
  },
  muted: {
    color: '#667085',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
  },
})
