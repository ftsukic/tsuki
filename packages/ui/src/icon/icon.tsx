import { AntdNativeIcon } from './antd-native-icon'
import { iconDefinitions, type IconName } from './icon-definitions'
import type { AntdNativeIconProps } from './interface'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
import { memo } from 'react'

type IconBaseProps = Omit<AntdNativeIconProps, 'definition'>

export type IconProps = IconBaseProps & {
  name: IconName | IconDefinition
}

function IconComponent({ name, ...props }: IconProps) {
  const resolvedDefinition = typeof name === 'string' ? iconDefinitions[name] : name
  if (!resolvedDefinition) {
    throw new Error('Icon requires a name')
  }

  return <AntdNativeIcon definition={resolvedDefinition} {...props} />
}

IconComponent.displayName = 'Icon'

export const Icon = memo(IconComponent)
