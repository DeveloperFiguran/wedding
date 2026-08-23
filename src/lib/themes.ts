export interface ThemePreset {
  id: string
  name: string
  description: string
  category: 'classic' | 'romantic' | 'nature' | 'bold' | 'earthy' | 'modern' | 'pastel' | 'dark'
  primary_color: string
  accent_color: string
  text_color: string
  background_color: string
}

export const THEME_PRESETS: ThemePreset[] = [
  // ====== CLASSIC (6) ======
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Gold mewah & timeless',
    category: 'classic',
    primary_color: '#B8935A',
    accent_color: '#D4A574',
    text_color: '#3D342B',
    background_color: '#FBF8F3',
  },
  {
    id: 'champagne-luxury',
    name: 'Champagne Luxury',
    description: 'Champagne elegan & refined',
    category: 'classic',
    primary_color: '#C9A96E',
    accent_color: '#E8D5A8',
    text_color: '#4A3F2F',
    background_color: '#FDFBF5',
  },
  {
    id: 'pearl-ivory',
    name: 'Pearl Ivory',
    description: 'Putih mutiara bersih',
    category: 'classic',
    primary_color: '#A89B8C',
    accent_color: '#D4C9B8',
    text_color: '#4A4238',
    background_color: '#FEFDFB',
  },
  {
    id: 'vintage-bronze',
    name: 'Vintage Bronze',
    description: 'Bronze klasik antik',
    category: 'classic',
    primary_color: '#8C6F47',
    accent_color: '#B89B6E',
    text_color: '#3A2F23',
    background_color: '#FAF6EF',
  },
  {
    id: 'royal-cream',
    name: 'Royal Cream',
    description: 'Krem royal sophisticated',
    category: 'classic',
    primary_color: '#B09A6A',
    accent_color: '#D9C69A',
    text_color: '#453A28',
    background_color: '#FCFAF3',
  },
  {
    id: 'antique-sepia',
    name: 'Antique Sepia',
    description: 'Sepia antik nostalgia',
    category: 'classic',
    primary_color: '#8B7355',
    accent_color: '#C4A876',
    text_color: '#3E3226',
    background_color: '#F9F4E9',
  },

  // ====== ROMANTIC (6) ======
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    description: 'Pink lembut & romantis',
    category: 'romantic',
    primary_color: '#C48B9F',
    accent_color: '#E8B4B8',
    text_color: '#4A3B3F',
    background_color: '#FDF6F7',
  },
  {
    id: 'blush-pink',
    name: 'Blush Pink',
    description: 'Pink pastel feminin',
    category: 'romantic',
    primary_color: '#D4A5A5',
    accent_color: '#F2D7D5',
    text_color: '#5D4037',
    background_color: '#FFF9F9',
  },
  {
    id: 'dusty-mauve',
    name: 'Dusty Mauve',
    description: 'Mauve lembut vintage',
    category: 'romantic',
    primary_color: '#A87C8A',
    accent_color: '#D4B0BC',
    text_color: '#42333A',
    background_color: '#FBF6F8',
  },
  {
    id: 'peach-melody',
    name: 'Peach Melody',
    description: 'Peach hangat ceria',
    category: 'romantic',
    primary_color: '#E5A885',
    accent_color: '#F5CBB0',
    text_color: '#5C4033',
    background_color: '#FFF8F2',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Rose gold modern glam',
    category: 'romantic',
    primary_color: '#B76E79',
    accent_color: '#E0BFB8',
    text_color: '#4A3236',
    background_color: '#FDF7F6',
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Sakura pink lembut',
    category: 'romantic',
    primary_color: '#D897A8',
    accent_color: '#F0C4CE',
    text_color: '#4F3A41',
    background_color: '#FEF9FA',
  },

  // ====== NATURE (6) ======
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    description: 'Hijau sage natural',
    category: 'nature',
    primary_color: '#87A878',
    accent_color: '#B5C9A8',
    text_color: '#3A4438',
    background_color: '#F7F9F4',
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Luxury',
    description: 'Hijau emerald mewah',
    category: 'nature',
    primary_color: '#2E6B54',
    accent_color: '#C9A96E',
    text_color: '#1A332A',
    background_color: '#F5F9F6',
  },
  {
    id: 'olive-grove',
    name: 'Olive Grove',
    description: 'Olive earthy elegan',
    category: 'nature',
    primary_color: '#708238',
    accent_color: '#A8B578',
    text_color: '#333D1F',
    background_color: '#F8FAF3',
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    description: 'Hijau hutan berkabut',
    category: 'nature',
    primary_color: '#4A6741',
    accent_color: '#8BA888',
    text_color: '#2A3826',
    background_color: '#F4F8F3',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    description: 'Mint segar menenangkan',
    category: 'nature',
    primary_color: '#7FB5A0',
    accent_color: '#B8D8C8',
    text_color: '#35544A',
    background_color: '#F6FBF9',
  },
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    description: 'Eucalyptus modern natural',
    category: 'nature',
    primary_color: '#5F8575',
    accent_color: '#A3C4B5',
    text_color: '#2E4239',
    background_color: '#F5F9F7',
  },

  // ====== BOLD & DARK (4) ======
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    description: 'Navy gelap & gold',
    category: 'dark',
    primary_color: '#C9A96E',
    accent_color: '#E8D5A8',
    text_color: '#F5F0E8',
    background_color: '#1A2332',
  },
  {
    id: 'burgundy-royal',
    name: 'Burgundy Royal',
    description: 'Maroon royal klasik',
    category: 'bold',
    primary_color: '#7B2D3E',
    accent_color: '#C9A96E',
    text_color: '#3A1A20',
    background_color: '#FBF5F3',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Ungu royal megah',
    category: 'bold',
    primary_color: '#5D3A6E',
    accent_color: '#C9A96E',
    text_color: '#2D1D36',
    background_color: '#FAF6FB',
  },
  {
    id: 'sapphire-night',
    name: 'Sapphire Night',
    description: 'Biru safir mendalam',
    category: 'dark',
    primary_color: '#D4AF37',
    accent_color: '#F0DC82',
    text_color: '#F5F3E8',
    background_color: '#0F1F3D',
  },

  // ====== EARTHY (4) ======
  {
    id: 'terracotta-sunset',
    name: 'Terracotta Sunset',
    description: 'Terracotta hangat earthy',
    category: 'earthy',
    primary_color: '#C08060',
    accent_color: '#E8B498',
    text_color: '#4A342A',
    background_color: '#FBF5F0',
  },
  {
    id: 'copper-autumn',
    name: 'Copper Autumn',
    description: 'Tembaga musim gugur',
    category: 'earthy',
    primary_color: '#A65E2E',
    accent_color: '#D9A066',
    text_color: '#3E2723',
    background_color: '#FBF6F0',
  },
  {
    id: 'sand-dune',
    name: 'Sand Dune',
    description: 'Pasir gurun hangat',
    category: 'earthy',
    primary_color: '#B08968',
    accent_color: '#D9B99B',
    text_color: '#4A3728',
    background_color: '#FBF7F1',
  },
  {
    id: 'clay-pottery',
    name: 'Clay Pottery',
    description: 'Tanah liat artisan',
    category: 'earthy',
    primary_color: '#9C6644',
    accent_color: '#C99B7A',
    text_color: '#402A1D',
    background_color: '#FAF4EE',
  },

  // ====== MODERN (4) ======
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Biru laut menyegarkan',
    category: 'modern',
    primary_color: '#5B8FA8',
    accent_color: '#A8C8D8',
    text_color: '#2C3E50',
    background_color: '#F4F9FC',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Lavender menenangkan',
    category: 'pastel',
    primary_color: '#9B7EBD',
    accent_color: '#D4C5E2',
    text_color: '#3D3450',
    background_color: '#F9F7FC',
  },
  {
    id: 'ivory-minimalist',
    name: 'Ivory Minimalist',
    description: 'Putih minimalis modern',
    category: 'modern',
    primary_color: '#8A817C',
    accent_color: '#BCB8B1',
    text_color: '#463F3A',
    background_color: '#FAFAF9',
  },
  {
    id: 'charcoal-luxe',
    name: 'Charcoal Luxe',
    description: 'Charcoal gelap mewah',
    category: 'dark',
    primary_color: '#C9A96E',
    accent_color: '#A89B8C',
    text_color: '#F0EDE8',
    background_color: '#2A2A2A',
  },

  // ====== PASTEL (2) ======
  {
    id: 'baby-blue',
    name: 'Baby Blue Sky',
    description: 'Biru langit lembut',
    category: 'pastel',
    primary_color: '#89ABD3',
    accent_color: '#C5D9EC',
    text_color: '#35495E',
    background_color: '#F7FAFD',
  },
  {
    id: 'lilac-whisper',
    name: 'Lilac Whisper',
    description: 'Lilac lembut dreamy',
    category: 'pastel',
    primary_color: '#B399C4',
    accent_color: '#D9CCE2',
    text_color: '#463A52',
    background_color: '#FAF8FC',
  },
]

export const THEME_CATEGORIES = [
  { id: 'all', name: 'Semua' },
  { id: 'classic', name: 'Classic' },
  { id: 'romantic', name: 'Romantic' },
  { id: 'nature', name: 'Nature' },
  { id: 'bold', name: 'Bold' },
  { id: 'earthy', name: 'Earthy' },
  { id: 'modern', name: 'Modern' },
  { id: 'pastel', name: 'Pastel' },
  { id: 'dark', name: 'Dark' },
]

export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0]
}

export function findThemeByColors(colors: {
  primary_color: string
  accent_color: string
  text_color: string
  background_color: string
}): ThemePreset | null {
  return THEME_PRESETS.find(
    (t) =>
      t.primary_color.toLowerCase() === colors.primary_color.toLowerCase() &&
      t.accent_color.toLowerCase() === colors.accent_color.toLowerCase() &&
      t.text_color.toLowerCase() === colors.text_color.toLowerCase() &&
      t.background_color.toLowerCase() === colors.background_color.toLowerCase()
  ) || null
}
