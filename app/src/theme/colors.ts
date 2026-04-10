export const Colors = {
  // Base
  background: '#0F0F11',
  foreground: '#F2F2F2',
  card: '#18181D',
  cardForeground: '#F2F2F2',
  surfaceElevated: '#1F1F26',

  // Primary (red-orange)
  primary: '#FF5C5C',
  primaryForeground: '#FFFFFF',

  // Secondary (amber)
  secondary: '#F5A623',
  secondaryForeground: '#0D0D0D',

  // Accent (teal)
  accent: '#2DD4A8',
  accentForeground: '#0D0D0D',

  // Muted
  muted: '#262630',
  mutedForeground: '#808096',

  // Destructive
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',

  // Border / Input
  border: '#2A2A35',
  input: '#2A2A35',
  ring: '#FF5C5C',

  // Role accents
  boy: '#6B9FFF',
  girl: '#F472B6',

  // Transparent helpers
  white10: 'rgba(255,255,255,0.1)',
  white15: 'rgba(255,255,255,0.15)',
  white20: 'rgba(255,255,255,0.2)',
  white30: 'rgba(255,255,255,0.3)',
  white40: 'rgba(255,255,255,0.4)',
  white50: 'rgba(255,255,255,0.5)',
  white60: 'rgba(255,255,255,0.6)',
  white70: 'rgba(255,255,255,0.7)',
  white80: 'rgba(255,255,255,0.8)',
  black40: 'rgba(0,0,0,0.4)',
  black60: 'rgba(0,0,0,0.6)',
  black80: 'rgba(0,0,0,0.8)',
  transparent: 'transparent',
};

// Gradient color stops
export const Gradients = {
  primary: ['#FF5C5C', '#F5A623'] as const,
  boy: ['#6B9FFF', '#0EA5E9'] as const,
  girl: ['#F472B6', '#FF5C5C'] as const,
  success: ['#2DD4A8', '#16A34A'] as const,
};
