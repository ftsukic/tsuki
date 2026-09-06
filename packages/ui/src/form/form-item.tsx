import type { FormItemProps } from './interface'
import { Field } from 'rc-field-form'
import type { EventArgs } from 'rc-field-form/lib/interface'

function getValueFromEvent(...args: EventArgs) {
  return args[0]
}

export function FormItem<Values = Record<string, unknown>>({
  children,
  getValueFromEvent: customGetValueFromEvent,
  trigger = 'onChangeText',
  valuePropName = 'value',
  ...props
}: FormItemProps<Values>) {
  return (
    <Field
      {...props}
      trigger={trigger}
      valuePropName={valuePropName}
      getValueFromEvent={customGetValueFromEvent ?? getValueFromEvent}
    >
      {children}
    </Field>
  )
}
