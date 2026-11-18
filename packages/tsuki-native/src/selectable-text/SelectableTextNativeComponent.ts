import type { CodegenTypes, HostComponent, ViewProps } from 'react-native'
import { codegenNativeComponent } from 'react-native'

type ContentSize = { width: CodegenTypes.Float; height: CodegenTypes.Float }

export interface NativeProps extends ViewProps {
  text: string
  onContentSizeChange?: CodegenTypes.DirectEventHandler<ContentSize>
}

export default codegenNativeComponent<NativeProps>(
  'TsukiSelectableText',
) as HostComponent<NativeProps>
