import type { FormInstance as RcFormInstance, FormProps as RcFormProps } from 'rc-field-form'
import type { FieldProps as RcFieldProps } from 'rc-field-form/lib/Field'
import type { ReactNode } from 'react'

export type FormInstance<Values = Record<string, unknown>> = RcFormInstance<Values>

export interface FormProps<Values = Record<string, unknown>> extends Omit<
  RcFormProps<Values>,
  'component' | 'children'
> {
  children?: ReactNode
  form?: FormInstance<Values>
}

export interface FormItemProps<Values = Record<string, unknown>> extends Omit<
  RcFieldProps<Values>,
  'children' | 'trigger' | 'valuePropName'
> {
  children?: RcFieldProps<Values>['children']
  trigger?: string
  valuePropName?: string
}
