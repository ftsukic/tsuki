import { ScrollView } from 'react-native'
import { Stack } from 'expo-router/stack'
import { ImagePreview } from '@ftsukic/tsuki'
import OnlineImage from '../../../src/image-preview/__fixtures__/examples/online-image'
import { fastImageAdapter } from '../../components/fast-image-adapter'
import { useAppTheme } from '@/theme'

export default function FastImageOriginalScreen() {
  const theme = useAppTheme()
  return (
    <ImagePreview.Provider>
      <Stack.Screen options={{ title: 'FastImage 查看原图' }} />
      <ScrollView
        style={{ backgroundColor: theme.colors.surface.page }}
        contentContainerStyle={{ padding: 16 }}
      >
        <OnlineImage imageAdapter={fastImageAdapter} />
      </ScrollView>
    </ImagePreview.Provider>
  )
}
