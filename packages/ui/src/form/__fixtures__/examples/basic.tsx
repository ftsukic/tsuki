/**
 * @title 组件预览
 */
import { Form, TextInput, ThemeProvider } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function FormOverview() {
  return (
    <ThemeProvider>
      <View style={{ padding: 16, gap: 12 }}>
        <Form>
          <Form.Item name="name">
            <TextInput placeholder="姓名" />
          </Form.Item>
        </Form>
      </View>
    </ThemeProvider>
  )
}
