import { useState } from 'react'
import { Checkbox, FieldCheckbox } from '../../..'
import type { CheckboxValue } from '../../..'

/**
 * @title FieldCheckbox
 * @description FieldCheckbox 使用 readonly CheckboxValue[]，children 直接传给 Checkbox.Group。
 */
export default function FieldCheckboxFixture() {
  const [value, setValue] = useState<readonly CheckboxValue[]>(['email'])

  return (
    <FieldCheckbox
      label="通知方式"
      variant="button"
      value={value}
      onChange={setValue}
      direction="horizontal"
      gap={16}
      buttonColumns={5}
    >
      <Checkbox name="email">邮件</Checkbox>
      <Checkbox name="sms">短信通知</Checkbox>
      <Checkbox name="push">推送</Checkbox>
      <Checkbox name="system">系统消息</Checkbox>
      <Checkbox name="marketing">营销消息</Checkbox>
      <Checkbox name="billing">账单</Checkbox>
      <Checkbox name="security">安全提醒</Checkbox>
      <Checkbox name="activity">活动</Checkbox>
    </FieldCheckbox>
  )
}
