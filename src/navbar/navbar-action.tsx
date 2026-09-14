import { forwardRef } from 'react'
import { Pressable } from '../pressable'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { getNavbarToken } from './token'
import type { NavbarActionProps } from './types'
import type { ReactNode } from 'react'

function isTextContent(value: ReactNode): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export const NavbarAction = forwardRef<React.ComponentRef<typeof Pressable>, NavbarActionProps>(
  function NavbarAction({ children, style, ...pressableProps }, ref) {
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

    const actionStyle = {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: token.padding,
    }

    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        pressStyle="opacity"
        style={(state) => [actionStyle, typeof style === 'function' ? style(state) : style]}
      >
        {content}
      </Pressable>
    )
  },
)

NavbarAction.displayName = 'NavbarAction'
