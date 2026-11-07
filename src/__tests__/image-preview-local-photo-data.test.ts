import { Image } from 'react-native'
import { createLocalPhotos } from '../image-preview/__fixtures__/examples/local-photo-data'

it('creates stable local photo items from static assets and metadata', () => {
  const resolveAssetSource = jest.spyOn(Image, 'resolveAssetSource')
  try {
    const first = createLocalPhotos('first')
    const second = createLocalPhotos('second')

    expect(first.map(({ id }) => id)).toEqual(['first-0', 'first-1'])
    expect(second.map(({ id }) => id)).toEqual(['second-0', 'second-1'])
    expect(first.map(({ source }) => source)).toEqual(second.map(({ source }) => source))

    expect(first.map(({ width, height }) => [width, height])).toEqual([
      [1320, 2868],
      [1940, 1202],
    ])
    for (const { source, width, height } of first) {
      expect(source).toBeTruthy()
      expect(typeof source === 'number' || (typeof source === 'object' && source !== null)).toBe(
        true,
      )
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(0)
    }
    expect(first[0].width / first[0].height).toBeCloseTo(1320 / 2868)
    expect(first[1].width / first[1].height).toBeCloseTo(1940 / 1202)
    expect(resolveAssetSource).not.toHaveBeenCalled()
  } finally {
    resolveAssetSource.mockRestore()
  }
})
