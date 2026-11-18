/**
 * @title Divider
 * @description V2 horizontal and vertical separators, insets, theme thickness and class overrides.
 */
import { View } from 'react-native'
import Basic from './examples/basic'
import CustomClass from './examples/custom-class'
import Options from './examples/options'
import Orientation from './examples/orientation'
import Theme from './examples/theme'

export default function DividerOverview() {
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Basic />
      <Orientation />
      <Options />
      <Theme />
      <CustomClass />
    </View>
  )
}
