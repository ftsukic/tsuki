import { defineConfig } from 'dumi'
import path from 'node:path'

const repo = process.env.PUBLIC_PATH || ''
const publicPath = repo ? `/${repo}` : '/'
const sourceRoot = path.resolve(__dirname, '../../packages/ui/src')

export default defineConfig({
  title: 'React Native UI',
  outputPath: 'dist',
  base: `/${repo}`,
  publicPath,
  favicons: [],
  resolve: {
    entryFile: '../../packages/ui/src/index.ts',
    docDirs: ['docs'],
    atomDirs: [{ type: 'component', dir: '../../packages/ui/src' }],
  },
  alias: {
    '@ftsukic/react-native-ui$': path.join(sourceRoot, 'index.ts'),
    'react-native$': path.join(__dirname, '.umi-patch/react-native.js'),
    'react-native-svg$': path.join(__dirname, '.umi-patch/react-native-svg.js'),
    'react-native/Libraries/Utilities/codegenNativeComponent$': path.join(
      __dirname,
      '.umi-patch/codegenNativeComponent.js',
    ),
  },
  themeConfig: {
    name: 'React Native UI',
    logo: false,
    deviceWidth: 375,
  },
})
