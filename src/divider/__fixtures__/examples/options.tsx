import { Divider } from '../../..'
import { View } from 'react-native'

/**
 * @title Divider options
 * @description Customize color, thickness, inset, and the root style.
 */
export default function DividerOptionsFixture() {
  return (
    <View style={{ gap: 16 }}>
      <Divider color="#1677ff" thickness={2} inset={16} />
      <Divider style={{ opacity: 0.5 }} />
    </View>
  )
}
