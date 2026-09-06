import { Icon } from '../icon'
import type { TextInputInstance } from '../text-input/interface'
import { TextInput } from '../text-input/text-input'
import { useToken } from '../theme'
import type { PasswordInputProps } from './interface'
import { forwardRef, useState } from 'react'
import { Pressable } from 'react-native'

export const PasswordInput = forwardRef<TextInputInstance, PasswordInputProps>(
  ({ showPasswordText = '显示密码', hidePasswordText = '隐藏密码', ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const { components, token } = useToken()
    const inputToken = components.Input

    return (
      <TextInput
        {...props}
        ref={ref}
        secureTextEntry={!visible}
        suffix={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? hidePasswordText : showPasswordText}
            hitSlop={token.sizeSM}
            onPress={() => setVisible((current) => !current)}
            style={{
              alignItems: 'center',
              flexShrink: 0,
              justifyContent: 'center',
              marginLeft: token.sizeSM,
            }}
          >
            {visible ? (
              <Icon name="EyeOutlined" size={inputToken.clearButtonSize} />
            ) : (
              <Icon name="EyeInvisibleOutlined" size={inputToken.clearButtonSize} />
            )}
          </Pressable>
        }
      />
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
