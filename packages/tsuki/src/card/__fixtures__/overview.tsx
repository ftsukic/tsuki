/**
 * @title Card
 * @description V2 cards with optional content sections, actions, class and theme overrides.
 */
import { View } from 'react-native'
import Basic from './examples/basic'
import Composition from './examples/composition'
import CustomClass from './examples/custom-class'
import Footer from './examples/footer'
import Header from './examples/header'
import Sections from './examples/sections'
import Theme from './examples/theme'

export default function CardOverview() {
  return (
    <View style={{ gap: 12 }}>
      <Basic />
      <Sections />
      <Header />
      <Footer />
      <Composition />
      <CustomClass />
      <Theme />
    </View>
  )
}
