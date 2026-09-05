export interface StyleInfo<Props, State> {
  props: Readonly<Props>;
  state: Readonly<State>;
}

export type StyleResolver<Props, State, Styles> =
  Styles | ((info: StyleInfo<Props, State>) => Styles);

export function resolveStyles<Props, State, Styles>(
  styles: StyleResolver<Props, State, Styles> | undefined,
  info: StyleInfo<Props, State>,
): Styles | undefined {
  if (styles === undefined) return undefined;

  return typeof styles === 'function'
    ? (styles as (styleInfo: StyleInfo<Props, State>) => Styles)(info)
    : styles;
}
