import { Space } from '../space'
import { useToken } from '../theme'
import ButtonBar from './button-bar'
import type { ButtonBarConfirmProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'
import { View } from 'react-native'

export function ButtonBarConfirm({ children, cancel, ...props }: ButtonBarConfirmProps) {
  const { components } = useToken()
  return (
    <ButtonBar {...props} alone style={{ flexDirection: 'row', alignItems: 'center' }}>
      {!isNil(cancel) ? (
        <Space
          direction="horizontal"
          tail
          align="center"
          minWidth={components.ButtonBar.buttonMinWidth}
        >
          {cancel}
        </Space>
      ) : null}
      <View style={{ flex: 1 }}>{children}</View>
    </ButtonBar>
  )
}

export default memo(ButtonBarConfirm)
