/**
 * Unistyles 3.0 configuration for BoardFlow
 * Design tokens and theme setup
 */

import { StyleSheet } from 'react-native-unistyles'

// Design Tokens
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
} as const

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const

const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    xxxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const

// Color Palette
const colors = {
  // Primary colors
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Semantic colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Board colors
  blue: '#6366f1',
  pink: '#ec4899',
  green: '#10b981',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
  
  // Background colors
  background: '#f9fafb',
  backgroundDark: '#111827',
  backgroundMedium: '#e2e8f0',
  surface: '#ffffff',
  surfaceDark: '#1f2937',
  
  // Column colors
  columnBackground: '#f1f5f9',
  columnBorder: '#e2e8f0',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#e2e8f0',
  borderMedium: '#cbd5e1',
  borderDark: '#374151',
} as const

// Shadows
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
  },
} as const

// Light Theme Definition
const lightTheme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  
  // Helper functions
  radius: (size: keyof typeof borderRadius) => borderRadius[size],
  
  // Component-specific tokens
  components: {
    card: {
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    button: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
      padding: {
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
      },
      borderRadius: borderRadius.md,
    },
    input: {
      height: 48,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    bottomSheet: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      handleColor: colors.gray300,
    },
  },
} as const

// Configure Unistyles with the light theme
StyleSheet.configure({
  themes: {
    light: lightTheme,
  },
  settings: {
    adaptiveThemes: false,
  },
})

// Type declarations for TypeScript
declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: typeof lightTheme
  }
}

export type AppTheme = typeof lightTheme

