/**
 * @title Icon
 * @description V2 icons with sizes, colors, custom SVG definitions and touch targets.
 */
import { View } from 'react-native'
import { TsukiProvider } from '../../theme'
import Basic from './examples/basic'
import Sizes from './examples/sizes'
import Colors from './examples/colors'
import TwoTone from './examples/two-tone'
import Custom from './examples/custom'
import Interactive from './examples/interactive'

export default function IconOverview() {
  return (
    <TsukiProvider scheme="light">
      <View style={{ gap: 16 }}>
        <Basic />
        <Sizes />
        <Colors />
        <TwoTone />
        <Custom />
        <Interactive />
      </View>
    </TsukiProvider>
  )
}
