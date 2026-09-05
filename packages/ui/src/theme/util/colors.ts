import { FastColor } from '@ant-design/fast-color';

export function alphaColor(color: string, alpha: number): string {
  return new FastColor(color).setA(alpha).toRgbString();
}

export function solidColor(color: string, brightness: number): string {
  return new FastColor(color).darken(brightness).toHexString();
}
