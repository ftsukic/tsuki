/**
 * @title Space v2
 * @description Native child spacing, direction, wrapping and NativeWind layout overrides.
 */
import { View } from 'react-native'
import Basic from './examples/basic'
import CustomClass from './examples/custom-class'
import Vertical from './examples/vertical'
import Wrap from './examples/wrap'

export default function SpaceOverview() {
  return (
    <View style={{ gap: 16 }}>
      <Basic />
      <Vertical />
      <Wrap />
      <CustomClass />
    </View>
  )
}
