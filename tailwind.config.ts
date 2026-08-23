import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF8F3',
        champagne: '#F7E7CE',
        'soft-gold': '#C9A96E',
        'deep-gold': '#B8935A',
        'dusty-rose': '#DCAE96',
        'warm-gray': '#6B5B5B',
      },
      fontFamily: {
        script: ['Great Vibes', 'cursive'],
        display: ['Marcellus', 'serif'],
        elegant: ['Cormorant Garamond', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config