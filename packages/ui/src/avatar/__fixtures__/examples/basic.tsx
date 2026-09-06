/**
 * @title 尺寸和形状
 * @description Avatar 支持预设和自定义尺寸、方形圆角、自定义圆角，以及小尺寸 icon 和文字的自适应。
 */
import { Avatar, Icon } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Avatar size="small" style={{ backgroundColor: '#1989FA' }}>
          S
        </Avatar>
        <Avatar style={{ backgroundColor: '#07C160' }}>M</Avatar>
        <Avatar size="large" style={{ backgroundColor: '#FF976A' }}>
          L
        </Avatar>
        <Avatar size={56} shape="square" style={{ backgroundColor: '#7232DD' }}>
          <Icon name="UserOutlined" color="#ffffff" />
        </Avatar>
        <Avatar size={56} borderRadius={12} style={{ backgroundColor: '#1677FF' }}>
          R
        </Avatar>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Avatar shape="square" size={64} style={{ backgroundColor: '#1989FA' }}>
          64
        </Avatar>
        <Avatar shape="square" size="large" style={{ backgroundColor: '#07C160' }}>
          L
        </Avatar>
        <Avatar shape="square" style={{ backgroundColor: '#FF976A' }}>
          M
        </Avatar>
        <Avatar shape="square" size="small" style={{ backgroundColor: '#7232DD' }}>
          S
        </Avatar>
        <Avatar
          shape="square"
          size={14}
          icon={<Icon name="UserOutlined" color="#ffffff" />}
          style={{ backgroundColor: '#1677FF' }}
        />
      </View>
    </View>
  )
}
