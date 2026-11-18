import { Collapse, CollapseItem, Text } from '@ftsukic/tsuki'

/**
 * @title Default expanded
 * @description Start with two panels expanded through defaultValue.
 */
export default function CollapseDefaultExample() {
  return (
    <Collapse defaultValue={['profile', 'security']}>
      <CollapseItem name="profile" title="个人资料">
        <Text>姓名、头像和简介。</Text>
      </CollapseItem>
      <CollapseItem name="security" title="安全设置">
        <Text>密码、设备和登录记录。</Text>
      </CollapseItem>
      <CollapseItem name="notifications" title="通知设置">
        <Text>消息和推送偏好。</Text>
      </CollapseItem>
    </Collapse>
  )
}
