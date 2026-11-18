module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@ftsukic/tsuki/dist/**/*.{js,cjs}',
  ],
  presets: [require('nativewind/preset'), require('@ftsukic/tsuki/nativewind-v4-preset')],
  theme: { extend: {} },
  plugins: [],
}
