/**
 * @title 尺寸和形状
 * @description Avatar 支持 small、medium、large 和自定义数值尺寸，并可切换圆形、方形或自定义圆角。
 */
import { Avatar, Icon } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar size="small" style={{ backgroundColor: '#1989FA' }}>
          S
        </Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>M</Avatar>
        <Avatar size="large" style={{ backgroundColor: '#FF976A' }}>
          L
        </Avatar>
        <Avatar size={56} shape="square" style={{ backgroundColor: '#7232DD' }}>
          <Icon name="UserOutlined" color="#ffffff" size={26} />
        </Avatar>
        <Avatar size={56} borderRadius={12} style={{ backgroundColor: '#1677FF' }}>
          R
        </Avatar>
      </View>
    </View>
  )
}
