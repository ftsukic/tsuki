import CheckCircleTwoTone from '@ant-design/icons-svg/lib/asn/CheckCircleTwoTone'
import CheckOutlined from '@ant-design/icons-svg/lib/asn/CheckOutlined'
import CloseOutlined from '@ant-design/icons-svg/lib/asn/CloseOutlined'
import DeleteOutlined from '@ant-design/icons-svg/lib/asn/DeleteOutlined'
import InfoCircleOutlined from '@ant-design/icons-svg/lib/asn/InfoCircleOutlined'
import LeftOutlined from '@ant-design/icons-svg/lib/asn/LeftOutlined'
import PlusOutlined from '@ant-design/icons-svg/lib/asn/PlusOutlined'
import RightOutlined from '@ant-design/icons-svg/lib/asn/RightOutlined'
import SearchOutlined from '@ant-design/icons-svg/lib/asn/SearchOutlined'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'

const definitions = {
  CheckCircleTwoTone,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
} satisfies Record<string, IconDefinition>

export type IconName = keyof typeof definitions

export function getIconDefinition(name: IconName): IconDefinition | undefined {
  return Object.hasOwn(definitions, name) ? definitions[name] : undefined
}
