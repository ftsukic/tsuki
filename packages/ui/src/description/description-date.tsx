import { formatDate } from '../helpers'
import Description from './description'
import type { DescriptionDateProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'

export function DescriptionDate({ text, mode = 'Y-m', ...props }: DescriptionDateProps) {
  return <Description {...props} text={!isNil(text) ? formatDate(mode, text) : undefined} />
}
export default memo(DescriptionDate)
