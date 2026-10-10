import { resolve } from 'node:path'

// Jest's Reanimated mock cannot detect native callback auto-workletization.
import { transformFileSync } from '@babel/core'

describe('Gesture Fixture thread boundaries', () => {
  it.each(['tap', 'interruption'])('keeps %s React updates on the RN thread', (name) => {
    const result = transformFileSync(
      resolve(__dirname, `../gesture/__fixtures__/examples/${name}.tsx`),
      {
        configFile: false,
        babelrc: false,
        parserOpts: { plugins: ['typescript', 'jsx'] },
        plugins: ['react-native-worklets/plugin'],
      },
    )
    const code = result?.code ?? ''
    const closures = [...code.matchAll(/__closure\s*=\s*\{([^}]*?)\}/gs)].map((match) => match[1])
    expect(closures.length).toBeGreaterThan(0)
    for (const closure of closures) {
      expect(closure).not.toMatch(/\b(setCount|setStatus|timer)\s*:/)
      expect(closure).not.toMatch(/\b(tap|pan)\s*:/)
    }
  })
})
