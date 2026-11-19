import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import Composition from './examples/composition'
import Horizontal from './examples/horizontal'
import Vertical from './examples/vertical'
import Leading from './examples/leading'
import Description from './examples/description'
import TitleExtra from './examples/title-extra'
import ValueExtra from './examples/value-extra'
import Required from './examples/required'
import Arrow from './examples/arrow'
import Interactive from './examples/interactive'
import Disabled from './examples/disabled'
import Center from './examples/center'
import Divider from './examples/divider'
import Group from './examples/group'
import GroupTitle from './examples/group-title'
import GroupInset from './examples/group-inset'
import CustomClass from './examples/custom-class'
import Theme from './examples/theme'

export default function CellOverview() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Basic />
      <Composition />
      <Horizontal />
      <Vertical />
      <Leading />
      <Description />
      <TitleExtra />
      <ValueExtra />
      <Required />
      <Arrow />
      <Interactive />
      <Disabled />
      <Center />
      <Divider />
      <Group />
      <GroupTitle />
      <GroupInset />
      <CustomClass />
      <Theme />
    </ScrollView>
  )
}
