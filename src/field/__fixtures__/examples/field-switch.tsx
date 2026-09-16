import { useState } from 'react'
import { Cell, FieldSwitch } from '../../..'
import { Text } from 'react-native'

/**
 * @title FieldSwitch
 * @description FieldSwitch 直接组合 Cell 和 Switch，保留 Switch 的值类型、loading 和 beforeChange 能力。
 */
export default function FieldSwitchFixture() {
  const [notifications, setNotifications] = useState(false)
  const [status, setStatus] = useState('等待确认')
  const [connection, setConnection] = useState<'enabled' | 'disabled'>('disabled')
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Cell.Group border={false}>
        <FieldSwitch title="通知" value={notifications} onChange={setNotifications} />
        <FieldSwitch
          title="自定义值"
          value={connection}
          activeValue="enabled"
          inactiveValue="disabled"
          onChange={setConnection}
        />
        <FieldSwitch title="禁用" defaultValue disabled />
        <FieldSwitch title="只读" defaultValue readOnly />
        <FieldSwitch title="加载中" defaultValue loading />
        <FieldSwitch
          title="尺寸和颜色"
          defaultValue
          size="large"
          activeColor="#07C160"
          inactiveColor="#DCDEE0"
        />
        <FieldSwitch
          title="Switch 样式"
          switchStyles={({ state }) => ({
            root: { opacity: state.active ? 1 : 0.8 },
          })}
        />
        <FieldSwitch
          title="确认开启"
          beforeChange={async (nextValue) => {
            setStatus('确认中...')
            setLoading(true)
            await new Promise((resolve) => setTimeout(resolve, 350))
            setStatus(nextValue ? '已确认开启' : '已确认关闭')
            setLoading(false)
            return true
          }}
          loading={loading}
          onChange={(nextValue) => setStatus(nextValue ? '状态为开启' : '状态为关闭')}
        />
      </Cell.Group>
      <Text>确认状态：{status}</Text>
    </>
  )
}
