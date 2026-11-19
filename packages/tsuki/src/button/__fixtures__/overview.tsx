import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import CustomText from './examples/custom-text'
import NestedText from './examples/nested-text'
import TextCascade from './examples/text-cascade'
import SemanticClasses from './examples/semantic-classes'
import Variants from './examples/variants'
import Sizes from './examples/sizes'
import States from './examples/states'
import IconExample from './examples/icon'
import Theme from './examples/theme'

export default function ButtonOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Variants />
      <Sizes />
      <States />
      <IconExample />
      <Theme />
      <SemanticClasses />
      <TextCascade />
      <NestedText />
      <CustomText />
    </ScrollView>
  )
}
