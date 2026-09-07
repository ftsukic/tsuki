import { defineConfig } from 'dumi'
import path from 'node:path'
import packageJson from './package.json'

const sourceRoot = path.resolve(__dirname, 'src')
const repository = process.env.PUBLIC_PATH || ''
const publicPath = repository ? `/${repository}/` : '/'

export default defineConfig({
  utoopack: {},
  title: 'Tsuki - React Native UI',
  metas: [
    { name: 'keywords', content: 'react native,react,typescript,ui,components' },
    {
      name: 'description',
      content: 'Tsuki 是一个轻量、可靠、可主题定制的 React Native 组件库。',
    },
  ],
  define: {
    'process.env.TSUKI_VERSION': packageJson.version,
  },
  base: publicPath,
  publicPath,
  mfsu: false,
  resolve: {
    entryFile: 'src/index.ts',
    docDirs: ['docs'],
    atomDirs: [],
  },
  alias: {
    '@ftsukic/tsuki$': path.join(sourceRoot, 'index.ts'),
    'react-native$': path.join(__dirname, '.umi-patch/react-native.js'),
    'react-native-svg$': path.join(__dirname, '.umi-patch/react-native-svg.js'),
    'react-native/Libraries/Utilities/codegenNativeComponent$': path.join(
      __dirname,
      '.umi-patch/codegenNativeComponent.js',
    ),
    'dumi-theme-mobile/dist/builtins/Previewer/index$': path.join(
      __dirname,
      '.dumi/theme/builtins/Previewer/index.tsx',
    ),
  },
  outputPath: 'docs-dist',
  theme: {
    '@c-primary': '#1677ff',
    '@s-content-width': '1440px',
  },
  themeConfig: {
    name: 'Tsuki',
    deviceWidth: 375,
    socialLinks: {
      github: 'https://github.com/ftsukic/tsuki',
    },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components' },
      { title: 'GitHub', link: 'https://github.com/ftsukic/tsuki' },
    ],
  },
})
