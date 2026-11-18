import type { HostComponent, ViewProps } from 'react-native'
import { codegenNativeComponent } from 'react-native'

export interface NativeProps extends ViewProps {
  text: string
}

export default codegenNativeComponent<NativeProps>(
  'TsukiSelectableText',
) as HostComponent<NativeProps>
