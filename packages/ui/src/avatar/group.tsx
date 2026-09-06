import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { Avatar } from './avatar'
import { getAvatarToken } from './token'
import type { AvatarGroupProps, AvatarProps } from './interface'
import { Children, isValidElement } from 'react'
import type { ReactElement } from 'react'
import { Pressable, View } from 'react-native'

export function AvatarGroup({
  children,
  size,
  shape,
  max,
  maxCount,
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

  const resolvedMaxCount = max?.count ?? maxCount
  const normalizedMaxCount =
    resolvedMaxCount === undefined || !Number.isFinite(resolvedMaxCount)
      ? undefined
      : Math.max(0, Math.floor(resolvedMaxCount))
  const visibleAvatars =
    normalizedMaxCount === undefined ? avatars : avatars.slice(0, normalizedMaxCount)
  const overflowCount = avatars.length - visibleAvatars.length
  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      children,
      size,
      shape,
      max,
      maxCount,
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
            style={avatarStyle}
          />
        )
      })}
      {overflowCount > 0 ? (
        <Pressable
          onPress={onOverflowPress}
          accessibilityRole={onOverflowPress ? 'button' : undefined}
          accessibilityLabel={`还有 ${overflowCount} 个头像`}
          style={[
            {
              marginLeft: token.groupOverlapping,
              borderRadius:
                groupShape === 'circle'
                  ? (typeof groupSize === 'number' && groupSize > 0
                      ? groupSize
                      : groupSize === 'small'
                        ? token.containerSizeSM
                        : groupSize === 'large'
                          ? token.containerSizeLG
                          : token.containerSize) / 2
                  : token.borderRadius,
            },
            semantic?.overflow,
          ]}
        >
          <Avatar
            size={groupSize}
            shape={groupShape}
            styles={max?.style?.color ? { text: { color: max.style.color } } : undefined}
            style={{ backgroundColor: max?.style?.backgroundColor ?? token.groupBorderColor }}
          >
            {`+${overflowCount}`}
          </Avatar>
        </Pressable>
      ) : null}
    </View>
  )
}

AvatarGroup.displayName = 'Avatar.Group'
