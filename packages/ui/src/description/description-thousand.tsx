import { formatThousandths } from '../helpers'
import Description from './description'
import type { DescriptionThousandProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'

export function DescriptionThousand({ text, ...props }: DescriptionThousandProps) {
  return <Description {...props} text={!isNil(text) ? formatThousandths(`${text}`) : undefined} />
}
export default memo(DescriptionThousand)
