/**
 * Color Scheme Configuration for Dormitory Management System
 * Primary Colors: Red (Đỏ) - Yellow/Amber (Vàng) - Cyan (Xanh biển)
 */

export const colors = {
  // Primary Colors
  primary: {
    red: '#DC2626', // red-600
    redLight: '#FEE2E2', // red-50
    redDark: '#991B1B', // red-900
  },
  
  yellow: {
    main: '#F59E0B', // amber-500
    light: '#FEF3C7', // amber-100
    dark: '#D97706', // amber-600
  },
  
  cyan: {
    main: '#06B6D4', // cyan-500
    light: '#CFFAFE', // cyan-100
    dark: '#0891B2', // cyan-700
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // Status Colors
  success: '#10B981', // green-500
  error: '#EF4444', // red-500
  warning: '#F59E0B', // amber-500
  info: '#3B82F6', // blue-500
}

// Tailwind Class Mappings
export const tailwindColors = {
  primary: {
    bg: 'bg-red-600',
    bgHover: 'hover:bg-red-700',
    bgLight: 'bg-red-50',
    text: 'text-red-600',
    textHover: 'hover:text-red-700',
    border: 'border-red-600',
    ring: 'ring-red-500',
  },

  secondary: {
    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textHover: 'hover:text-cyan-700',
    border: 'border-cyan-500',
  },

  accent: {
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    textHover: 'hover:text-amber-700',
    border: 'border-amber-500',
  },
}
