'use client'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B5B5B]/80 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-3 items-center p-3 bg-white/90 backdrop-blur-sm border-2 border-[#C9A96E]/15 rounded-2xl hover:border-[#C9A96E]/30 transition-all">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#C9A96E]/20 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm text-[#6B5B5B] bg-transparent outline-none uppercase"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  )
}