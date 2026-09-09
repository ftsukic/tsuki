import { forwardRef } from 'react'
import { Text } from 'react-native'
import { InteractionPressable } from '../interaction'
import { useComponentToken, useToken } from '../theme'
import { getNavbarToken } from './token'
import type { NavbarActionProps } from './interface'
import type { ReactNode } from 'react'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export const NavbarAction = forwardRef<
  React.ComponentRef<typeof InteractionPressable>,
  NavbarActionProps
>(function NavbarAction({ children, style, ...pressableProps }, ref) {
  const navbarToken = useComponentToken('Navbar', getNavbarToken)
  const { token } = useToken()
  const content = isTextContent(children) ? (
    <Text
      ellipsizeMode="tail"
      numberOfLines={1}
      style={{
        color: navbarToken.actionColor,
        flexShrink: 0,
        fontFamily: token.fontFamily,
        fontSize: navbarToken.actionFontSize,
        lineHeight: token.lineHeight,
        maxWidth: '100%',
      }}
    >
      {children}
    </Text>
  ) : (
    children
  )

  return (
    <InteractionPressable
      ref={ref}
      {...pressableProps}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          backgroundColor: pressed ? token.interactionActiveColor : 'transparent',
          flexDirection: 'row',
          flexShrink: 0,
          justifyContent: 'center',
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {content}
    </InteractionPressable>
  )
})

NavbarAction.displayName = 'NavbarAction'
