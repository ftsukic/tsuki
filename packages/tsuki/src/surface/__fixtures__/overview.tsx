/**
 * @title Surface
 * @description V2 visual containers with padding, borders, insets, theme and class overrides.
 */
import { View } from 'react-native'
import Basic from './examples/basic'
import Bordered from './examples/bordered'
import CustomClass from './examples/custom-class'
import Inset from './examples/inset'
import Padding from './examples/padding'
import Theme from './examples/theme'

export default function SurfaceOverview() {
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Basic />
      <Bordered />
      <Padding />
      <Inset />
      <Theme />
      <CustomClass />
    </View>
  )
}
