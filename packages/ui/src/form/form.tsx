import type { FormProps } from './interface'
import { useForm } from './use-form'
import RcForm from 'rc-field-form'
import type { FormInstance as RcFormInstance } from 'rc-field-form'
import { forwardRef, useImperativeHandle } from 'react'

function InternalForm<Values = Record<string, unknown>>(
  { children, form, ...props }: FormProps<Values>,
  ref: React.ForwardedRef<RcFormInstance<Values>>,
) {
  const [wrappedForm] = useForm(form)
  useImperativeHandle(ref, () => wrappedForm, [wrappedForm])

  return (
    <RcForm {...props} component={false} form={wrappedForm}>
      {children}
    </RcForm>
  )
}

export const Form = forwardRef(InternalForm)
