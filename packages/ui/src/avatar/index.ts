import { Avatar } from './avatar'
import { AvatarGroup } from './group'

export const AvatarWithGroup = Object.assign(Avatar, { Group: AvatarGroup })
export { AvatarWithGroup as Avatar }
export { AvatarGroup }
export { getAvatarToken } from './token'
export type {
  AvatarGroupProps,
  AvatarGroupSemanticStyles,
  AvatarGroupStyleInfo,
  AvatarGroupStyleState,
  AvatarGroupStyles,
  AvatarImageErrorEvent,
  AvatarPresetSize,
  AvatarProps,
  AvatarSemanticStyles,
  AvatarShape,
  AvatarSize,
  AvatarSource,
  AvatarStyleInfo,
  AvatarStyleState,
  AvatarStyles,
} from './interface'
