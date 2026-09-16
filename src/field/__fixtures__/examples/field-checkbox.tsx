import { useState } from 'react'
import { Cell, Checkbox, FieldCheckbox } from '../../..'
import type { CheckboxOption, CheckboxValue } from '../../..'

/**
 * @title FieldCheckbox
 * @description FieldCheckbox 使用 readonly CheckboxValue[]，支持 children 和 options 两种 Checkbox.Group 写法。
 */
export default function FieldCheckboxFixture() {
  const [value, setValue] = useState<readonly CheckboxValue[]>(['email'])
  const options: CheckboxOption[] = [
    { value: 'email', label: '邮件' },
    { value: 'sms', label: '短信通知' },
    { value: 'push', label: '推送', disabled: true },
  ]

  return (
    <Cell.Group border={false}>
      <FieldCheckbox
        title="通知方式"
        variant="button"
        buttonVariant="filled"
        value={value}
        onChange={setValue}
        direction="horizontal"
        gap={8}
        buttonColumns={4}
        buttonLayout="equal"
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
      <FieldCheckbox title="快捷配置" value={value} onChange={setValue} options={options} />
    </Cell.Group>
  )
}
