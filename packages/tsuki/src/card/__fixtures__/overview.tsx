import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Composition from './examples/composition'
import CustomClass from './examples/custom-class'
import Footer from './examples/footer'
import Header from './examples/header'
import Sections from './examples/sections'
import Theme from './examples/theme'

export default function CardOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Sections />
      <Header />
      <Footer />
      <Composition />
      <CustomClass />
      <Theme />
    </ScrollView>
  )
}
