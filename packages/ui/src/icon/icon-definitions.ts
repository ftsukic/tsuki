import * as iconDefinitions from '@ant-design/icons-svg/lib';
import type { IconDefinition } from '@ant-design/icons-svg/lib/types';

export { iconDefinitions };

const allIconDefinitions = iconDefinitions satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof allIconDefinitions;

export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(allIconDefinitions, value);
}
