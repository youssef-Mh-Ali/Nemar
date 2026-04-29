import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        secondary: 'hsl(var(--secondary))',
        card: 'hsl(var(--card))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-navy': 'var(--gradient-navy)',
        'gradient-gold': 'var(--gradient-gold)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elegant: 'var(--shadow-elegant)',
        gold: 'var(--shadow-gold)',
      },
    },
  },
  plugins: [],
} satisfies Config

