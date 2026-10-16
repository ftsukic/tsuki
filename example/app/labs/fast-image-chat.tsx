import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { ImagePreview, useToken } from '@ftsukic/tsuki'
import ChatMessages from '../../../src/image-preview/__fixtures__/examples/chat-messages'
import { fastImageAdapter } from '../../components/fast-image-adapter'

export default function FastImageChatScreen() {
  const { token } = useToken()
  return (
    <ImagePreview.Provider>
      <Stack.Screen options={{ title: 'FastImage 聊天图片' }} />
      <View style={{ flex: 1, padding: 16, backgroundColor: token.colorBgLayout }}>
        <ChatMessages imageAdapter={fastImageAdapter} />
      </View>
    </ImagePreview.Provider>
  )
}
