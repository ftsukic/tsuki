export { Icon } from './icon'
export type { IconName } from './icon-definitions'
export type { IconProps } from './icon'

// Legacy low-level icon exports retained for compatibility.
// Internal code should import their real implementation paths.
export { AntdNativeIcon } from './antd-native-icon'
export { iconDefinitions, isIconName } from './icon-definitions'
export type { AntdNativeIconProps } from './types'

// Legacy third-party re-export retained for compatibility.
// Do not add new public API through this wildcard export.
export * from '@ant-design/icons-svg/lib'
