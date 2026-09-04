export type SnackPlatform = 'ios' | 'android' | 'web' | 'mydevice';

export type SnackDependencyType = 'FILE' | 'NPM';

export interface SnackAssetDependency {
  type: SnackDependencyType;
  value: string;
}

export interface SnackAsset {
  entry?: string;
  dependencies?: Record<string, SnackAssetDependency>;
  snackId?: string;
}

export interface SnackFile {
  type: 'CODE';
  contents: string;
}

export type SnackFiles = Record<string, SnackFile>;

export interface SnackPayload {
  files: SnackFiles;
  dependencies: Record<string, string>;
}

export interface SnackPreviewProps {
  snackId?: string;
  platform?: SnackPlatform;
  height?: number;
  theme?: 'light' | 'dark';
}
