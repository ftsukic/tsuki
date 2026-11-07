import type { AppColorScheme } from '../types'

const lightColors: AppColorScheme = {
  brand: {
    primary: '#1989FA',
    onPrimary: '#FFFFFF',
    primaryContainer: '#bde7ff',
    onPrimaryContainer: '#123552',
  },
  surface: {
    canvas: '#FFFFFF',
    page: '#f5f5f5',
    container: '#ffffff',
    elevated: '#ffffff',
    sunken: '#F2F3F5',
    overlay: 'rgba(0,0,0,0.45)',
  },
  text: {
    primary: 'rgba(0,0,0,0.88)',
    secondary: 'rgba(0,0,0,0.65)',
    tertiary: 'rgba(0,0,0,0.45)',
    disabled: 'rgba(0,0,0,0.25)',
    inverse: '#FFFFFF',
    link: '#1989FA',
  },
  icon: {
    primary: 'rgba(0,0,0,0.88)',
    secondary: 'rgba(0,0,0,0.65)',
    tertiary: 'rgba(0,0,0,0.45)',
    disabled: 'rgba(0,0,0,0.25)',
  },
  border: {
    subtle: '#f0f0f0',
    default: '#d9d9d9',
    strong: '#bfbfbf',
    focus: '#1989FA',
  },
  status: {
    success: { foreground: '#07C160', background: '#a6f5c2', border: '#4fdb89' },
    warning: { foreground: '#FAAD14', background: '#fff1b8', border: '#ffd666' },
    danger: { foreground: '#EE0A24', background: '#ffafad', border: '#ff5c64' },
    info: { foreground: '#1989FA', background: '#bde7ff', border: '#6bbfff' },
  },
  state: {
    pressed: '#F2F3F5',
    selected: { foreground: '#1989FA', background: '#bde7ff', border: '#6bbfff' },
  },
}

const darkColors: AppColorScheme = {
  brand: {
    primary: '#1989FA',
    onPrimary: '#FFFFFF',
    primaryContainer: '#122944',
    onPrimaryContainer: '#D6E9FF',
  },
  surface: {
    canvas: '#141414',
    page: '#141414',
    container: '#1e1e1e',
    elevated: '#262626',
    sunken: '#101010',
    overlay: 'rgba(0,0,0,0.65)',
  },
  text: {
    primary: 'rgba(255,255,255,0.85)',
    secondary: 'rgba(255,255,255,0.65)',
    tertiary: 'rgba(255,255,255,0.45)',
    disabled: 'rgba(255,255,255,0.25)',
    inverse: '#FFFFFF',
    link: '#1989FA',
  },
  icon: {
    primary: 'rgba(255,255,255,0.85)',
    secondary: 'rgba(255,255,255,0.65)',
    tertiary: 'rgba(255,255,255,0.45)',
    disabled: 'rgba(255,255,255,0.25)',
  },
  border: {
    subtle: 'rgba(255,255,255,0.12)',
    default: 'rgba(255,255,255,0.2)',
    strong: 'rgba(255,255,255,0.35)',
    focus: '#69B1FF',
  },
  status: {
    success: { foreground: '#07C160', background: '#0f3623', border: '#0e6236' },
    warning: { foreground: '#FAAD14', background: '#443111', border: '#7c5914' },
    danger: { foreground: '#EE0A24', background: '#410f17', border: '#76101b' },
    info: { foreground: '#1989FA', background: '#122944', border: '#16497c' },
  },
  state: {
    pressed: '#3a3a3a',
    selected: { foreground: '#69B1FF', background: '#122944', border: '#16497c' },
  },
}

export const colorTokens = { light: lightColors, dark: darkColors }
