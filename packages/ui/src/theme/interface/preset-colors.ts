export const presetColors = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

export type PresetColorKey = (typeof presetColors)[number];

export type PresetColorTokens = Record<PresetColorKey, string>;

type PaletteIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ColorPalettes = {
  [key in `${PresetColorKey}-${PaletteIndex}`]: string;
} & {
  [key in `${PresetColorKey}${PaletteIndex}`]: string;
};
