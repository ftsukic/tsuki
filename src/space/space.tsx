import { Flex } from '../flex'
import type { SpaceProps } from './interface'

export function Space({
  align,
  direction = 'horizontal',
  gap,
  style,
  wrap = false,
  ...restProps
}: SpaceProps) {
  return (
    <Flex
      {...restProps}
      align={align}
      direction={direction === 'horizontal' ? 'row' : 'column'}
      gap={gap}
      style={style}
      wrap={wrap}
    />
  )
}
