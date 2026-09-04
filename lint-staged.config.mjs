export default {
  '*.{js,jsx,mjs,cjs,ts,tsx}': ['eslint --fix', 'prettier --write --ignore-unknown'],
  '*.{json,md,yml,yaml}': ['prettier --write --ignore-unknown'],
};
