import { createSnackPayload } from './snack';

describe('createSnackPayload', () => {
  it('converts dumi entry, FILE dependencies and NPM dependencies', () => {
    expect(
      createSnackPayload({
        entry: "import Demo from './Demo';",
        dependencies: {
          './Demo.tsx': { type: 'FILE', value: 'export default Demo;' },
          react: { type: 'NPM', value: '^19.1.1' },
        },
      }),
    ).toEqual({
      files: {
        'App.tsx': {
          type: 'CODE',
          contents: "import Demo from './Demo';",
        },
        'Demo.tsx': {
          type: 'CODE',
          contents: 'export default Demo;',
        },
      },
      dependencies: {
        react: '^19.1.1',
      },
    });
  });

  it('returns null when dumi has no entry source', () => {
    expect(createSnackPayload({})).toBeNull();
  });
});
