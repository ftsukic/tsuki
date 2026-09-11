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
      value={value}
      onChange={setValue}
      direction="horizontal"
      gap={16}
    >
      <Checkbox name="email">邮件</Checkbox>
      <Checkbox name="sms">短信</Checkbox>
      <Checkbox name="push">推送</Checkbox>
    </FieldCheckbox>
  )
}
