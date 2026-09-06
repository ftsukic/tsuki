import type { FormInstance } from './interface'
import { useForm as useRcForm } from 'rc-field-form'
import { useMemo } from 'react'
import { Keyboard } from 'react-native'

export function useForm<Values = Record<string, unknown>>(
  form?: FormInstance<Values>,
): [FormInstance<Values>] {
  const [rcForm] = useRcForm<Values>()
  const wrappedForm = useMemo(() => {
    if (form) return form
    return {
      ...rcForm,
      submit: () => {
        Keyboard.dismiss()
        rcForm.submit()
      },
    }
  }, [form, rcForm])

  return [wrappedForm]
}
