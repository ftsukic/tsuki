import type { SnackAsset, SnackAssetDependency, SnackFiles, SnackPayload } from '../types';

const ENTRY_FILE = 'App.tsx';

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/^\.\/?/, '');
}

function isSnackAssetDependency(
  value: SnackAssetDependency | unknown,
): value is SnackAssetDependency {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const dependency = value as Partial<SnackAssetDependency>;
  return (
    (dependency.type === 'FILE' || dependency.type === 'NPM') &&
    typeof dependency.value === 'string'
  );
}

export function createSnackPayload(asset: SnackAsset): SnackPayload | null {
  if (typeof asset.entry !== 'string' || asset.entry.length === 0) {
    return null;
  }

  const files: SnackFiles = {
    [ENTRY_FILE]: {
      type: 'CODE' as const,
      contents: asset.entry,
    },
  };
  const dependencies: Record<string, string> = {};

  for (const [name, rawDependency] of Object.entries(asset.dependencies ?? {})) {
    if (!isSnackAssetDependency(rawDependency)) {
      continue;
    }

    if (rawDependency.type === 'FILE') {
      files[normalizeFilePath(name)] = {
        type: 'CODE',
        contents: rawDependency.value,
      };
      continue;
    }

    dependencies[name] = rawDependency.value;
  }

  return { files, dependencies };
}

export function readSnackId(asset: unknown): string | undefined {
  if (typeof asset !== 'object' || asset === null) {
    return undefined;
  }

  const candidate = asset as { snackId?: unknown };
  return typeof candidate.snackId === 'string' && candidate.snackId.length > 0
    ? candidate.snackId
    : undefined;
}
