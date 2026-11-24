import { ScrollView } from 'react-native'
import Basic from './examples/basic'
import HostLifecycle from './examples/host-lifecycle'
import NamedHost from './examples/named-host'
import Multiple from './examples/multiple'
import Theme from './examples/theme'

export default function PortalOverview() {
  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      <Basic />
      <Multiple />
      <NamedHost />
      <HostLifecycle />
      <Theme />
    </ScrollView>
  )
}
