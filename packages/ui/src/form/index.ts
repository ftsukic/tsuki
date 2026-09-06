import { Form } from './form'
import { FormItem } from './form-item'
import type { FormInstance, FormItemProps, FormProps } from './interface'
import { useForm } from './use-form'
import { List, FormProvider, FieldContext, ListContext, useWatch } from 'rc-field-form'

const FormWithProperties = Object.assign(Form, {
  Item: FormItem,
  List,
  Provider: FormProvider,
  useForm,
  useWatch,
})

export {
  FieldContext as FormItemContext,
  ListContext,
  FormItem,
  FormWithProperties as Form,
  useForm,
}
export type { FormInstance, FormItemProps, FormProps }
