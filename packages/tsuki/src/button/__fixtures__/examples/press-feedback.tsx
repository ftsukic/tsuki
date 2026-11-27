/**
 * @title Press Feedback
 * @description Compares scale, opacity, overlay, and disabled press feedback modes.
 */
import { Button } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function PressFeedbackExample() {
  return (
    <View style={{ gap: 8 }}>
      <Button pressFeedback="scale">Scale (Default)</Button>
      <Button pressFeedback="opacity">Opacity</Button>
      <Button pressFeedback="overlay" variant="outlined">
        Overlay
      </Button>
      <Button pressFeedback="none" variant="ghost">
        None
      </Button>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingVertical: 4 }}>
        <Button variant="link">Link (Default Opacity)</Button>
        <Button variant="link" pressFeedback="none">
          Link (None)
        </Button>
      </View>
    </View>
  )
}
