import { Flex, FlexItem } from './flex'

export const FlexWithItem = Object.assign(Flex, { Item: FlexItem })
export { FlexItem }
export { FlexWithItem as Flex }
export type { FlexAlign, FlexItemProps, FlexJustify, FlexProps } from './interface'
