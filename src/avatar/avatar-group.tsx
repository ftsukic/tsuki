import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { Avatar } from './avatar'
import { getAvatarToken } from './token'
import type { AvatarGroupProps, AvatarProps } from './types'
import { Pressable } from '../pressable'
import { Children, isValidElement } from 'react'
import type { ReactElement } from 'react'
import { View } from 'react-native'

export function AvatarGroup({
  children,
  size,
  shape,
  borderRadius,
  maxCount,
  showOverflow = true,
  onOverflowPress,
  style,
  styles,
  ...viewProps
}: AvatarGroupProps) {
  const token = useComponentToken('Avatar', getAvatarToken)
  const avatars = Children.toArray(children).filter(
    (child): child is ReactElement<AvatarProps> => isValidElement(child) && child.type === Avatar,
  )
  if (avatars.length === 0) return null

  const groupSize = size ?? avatars[0]?.props.size ?? 'medium'
  const groupShape = shape ?? avatars[0]?.props.shape ?? 'circle'
  const resolvedGroupSize =
    typeof groupSize === 'number'
      ? Number.isFinite(groupSize) && groupSize > 0
        ? groupSize
        : token.containerSize
      : groupSize === 'small'
        ? token.containerSizeSM
        : groupSize === 'large'
          ? token.containerSizeLG
          : token.containerSize
  const resolvedOverflowRadius =
    borderRadius ?? (groupShape === 'circle' ? resolvedGroupSize / 2 : token.borderRadius)

  const normalizedMaxCount =
    maxCount === undefined || !Number.isFinite(maxCount)
      ? undefined
      : Math.max(0, Math.floor(maxCount))
  const visibleAvatars =
    normalizedMaxCount === undefined ? avatars : avatars.slice(0, normalizedMaxCount)
  const overflowCount = avatars.length - visibleAvatars.length
  const OverflowHost = onOverflowPress ? Pressable : View
  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      children,
      size,
      shape,
      borderRadius,
      maxCount,
      showOverflow,
      onOverflowPress,
      style,
      styles,
    },
    state: { visibleCount: visibleAvatars.length, overflowCount },
  })

  return (
    <View
      {...viewProps}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
        },
        semantic?.root,
        style,
      ]}
    >
      {visibleAvatars.map((avatar, index) => {
        const avatarStyle = [
          {
            marginLeft: index === 0 ? 0 : token.groupOverlapping,
            borderColor: token.groupBorderColor,
            borderWidth: token.groupBorderWidth,
          },
          semantic?.item,
          avatar.props.style,
        ]
        return (
          <Avatar
            {...avatar.props}
            key={avatar.key ?? index}
            size={avatar.props.size ?? groupSize}
            shape={avatar.props.shape ?? groupShape}
            borderRadius={avatar.props.borderRadius ?? borderRadius}
            style={avatarStyle}
          />
        )
      })}
      {showOverflow && overflowCount > 0 ? (
        <OverflowHost
          {...(onOverflowPress ? { onPress: onOverflowPress, pressStyle: 'opacity' as const } : {})}
          accessible
          accessibilityRole={onOverflowPress ? 'button' : 'image'}
          accessibilityLabel={`还有 ${overflowCount} 个头像`}
          style={[
            {
              marginLeft: visibleAvatars.length > 0 ? token.groupOverlapping : 0,
              borderRadius: resolvedOverflowRadius,
            },
            semantic?.overflow,
          ]}
        >
          <Avatar
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            size={groupSize}
            shape={groupShape}
            borderRadius={borderRadius}
            styles={{
              root: [{ backgroundColor: token.groupBorderColor }, semantic?.overflowAvatar],
              text: semantic?.overflowText,
            }}
          >
            {`+${overflowCount}`}
          </Avatar>
        </OverflowHost>
      ) : null}
    </View>
  )
}

AvatarGroup.displayName = 'Avatar.Group'
