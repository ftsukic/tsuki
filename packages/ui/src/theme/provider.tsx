import type { MappingAlgorithm } from './interface';
import type { AliasToken } from './interface/alias';
import type {
  ComponentTokenFactory,
  ComponentTokenMap,
  ComponentTokenName,
  ComponentTokenOverrides,
} from './interface/components';
import type { MapToken } from './interface/map';
import type { SeedToken } from './interface/seed';
import { composeAlgorithms, defaultAlgorithm } from './themes';
import { defaultSeed } from './themes/seed';
import { createAliasToken } from './util/alias';
import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

export interface ThemeConfig {
  token?: Partial<AliasToken>;
  algorithm?: MappingAlgorithm | readonly MappingAlgorithm[];
  components?: ComponentTokenOverrides;
  inherit?: boolean;
}

interface ThemeValue {
  seed: SeedToken;
  token: AliasToken;
  tokenOverrides: Partial<AliasToken>;
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[];
  componentOverrides: ComponentTokenOverrides;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function isSeedKey(key: string): key is keyof SeedToken {
  return key in defaultSeed;
}

function splitSeedOverrides(overrides: Partial<AliasToken>): Partial<SeedToken> {
  const seedOverrides: Partial<SeedToken> = {};

  for (const [key, value] of Object.entries(overrides)) {
    if (isSeedKey(key) && value !== undefined) {
      Object.assign(seedOverrides, { [key]: value });
    }
  }

  return seedOverrides;
}

function isAlgorithmList(
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[],
): algorithm is readonly MappingAlgorithm[] {
  return Array.isArray(algorithm);
}

function getMapToken(
  seed: SeedToken,
  algorithm: MappingAlgorithm | readonly MappingAlgorithm[],
): MapToken {
  return isAlgorithmList(algorithm) ? composeAlgorithms(algorithm)(seed) : algorithm(seed);
}

function resolveTheme(theme: ThemeConfig = {}, parent?: ThemeValue | null): ThemeValue {
  const inherit = theme.inherit !== false;
  const tokenOverrides: Partial<AliasToken> = {
    ...(inherit ? parent?.tokenOverrides : undefined),
    ...theme.token,
  };
  const seed: SeedToken = {
    ...defaultSeed,
    ...(inherit ? parent?.seed : undefined),
    ...splitSeedOverrides(tokenOverrides),
  };
  const algorithm =
    theme.algorithm ?? (inherit ? parent?.algorithm : undefined) ?? defaultAlgorithm;
  const map = { ...getMapToken(seed, algorithm), ...tokenOverrides };
  const token = createAliasToken(map, tokenOverrides);
  const componentOverrides = {
    ...(inherit ? parent?.componentOverrides : undefined),
    ...theme.components,
  };

  return {
    seed,
    token,
    tokenOverrides,
    algorithm,
    componentOverrides,
  };
}

export function ConfigProvider({
  children,
  theme = {},
}: PropsWithChildren<{ theme?: ThemeConfig }>) {
  const parent = useContext(ThemeContext);
  const value = useMemo(() => resolveTheme(theme, parent), [parent, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function getDesignToken(theme: ThemeConfig = {}) {
  return resolveTheme(theme, null);
}

export function useToken(): ThemeValue {
  const value = useContext(ThemeContext);

  if (!value) throw new Error('useToken must be used inside ConfigProvider');

  return value;
}

export function useOptionalToken(): ThemeValue | null {
  return useContext(ThemeContext);
}

export function useComponentToken<Name extends ComponentTokenName>(
  name: Name,
  factory: ComponentTokenFactory<Name>,
): ComponentTokenMap[Name] {
  const { token, componentOverrides } = useToken();
  const override = componentOverrides[name] as Partial<ComponentTokenMap[Name]> | undefined;

  return useMemo(
    () => ({ ...factory(token), ...override }) as ComponentTokenMap[Name],
    [factory, override, token],
  );
}

export const UIThemeProvider = ConfigProvider;
