/**
 * @title 组件预览
 */
import { Avatar, Badge, ConfigProvider } from '@ftsukic/react-native-ui'
import { Text, View } from 'react-native'

export default function BadgeOverview() {
  return (
    <ConfigProvider>
      <View style={{ gap: 24, padding: 20, backgroundColor: '#ffffff' }}>
        <View style={{ gap: 12 }}>
          <Text style={{ color: '#68788d', fontSize: 14 }}>数字和红点</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
            <Badge count={5}>
              <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
            </Badge>
            <Badge count={100}>
              <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
            </Badge>
            <Badge dot>
              <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
            </Badge>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Text style={{ color: '#68788d', fontSize: 14 }}>状态</Text>
          <View style={{ gap: 8 }}>
            <Badge status="success" text="在线" />
            <Badge status="processing" text="处理中" />
            <Badge status="error" text="离线" />
          </View>
        </View>
      </View>
    </ConfigProvider>
  )
}
