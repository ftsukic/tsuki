/**
 * @title 图片、图标和字符
 * @description 图片加载失败时按 icon、children 的顺序回退；图片地址支持字符串或 RN Image source。
 */
import { Avatar, Icon } from '@ftsukic/react-native-ui'
import { View } from 'react-native'

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128" alt="头像" />
      <Avatar
        icon={<Icon name="UserOutlined" color="#ffffff" size={18} />}
        style={{ backgroundColor: '#1989FA' }}
      >
        A
      </Avatar>
      <Avatar gap={2} style={{ backgroundColor: '#07C160' }}>
        USER
      </Avatar>
      <Avatar
        src="https://invalid.example/avatar.png"
        icon={<Icon name="UserOutlined" color="#ffffff" size={18} />}
        alt="加载失败后显示用户图标"
        style={{ backgroundColor: '#FF976A' }}
      />
    </View>
  )
}
