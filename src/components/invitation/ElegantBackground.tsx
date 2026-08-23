'use client'

interface ElegantBackgroundProps {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  variant?: 'cover' | 'section'
  style?: string
  className?: string
}

export function ElegantBackground({
  primaryColor,
  accentColor,
  backgroundColor,
  variant = 'section',
  style = 'botanical',
  className = '',
}: ElegantBackgroundProps) {
  const renderStyle = () => {
    // ====== NATURE STYLES ======
    if (['botanical', 'floral-garden', 'tropical-leaves'].includes(style)) {
      return <BotanicalStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    if (['cloud-sky', 'ocean-waves'].includes(style)) {
      return <SkyWaterStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    if (style === 'starry-night') {
      return <StarryNightStyle primaryColor={primaryColor} accentColor={accentColor} />
    }

    // ====== GEOMETRIC STYLES ======
    if (['geometric', 'art-deco', 'hexagon-grid', 'triangle-mosaic', 'circular-ripple'].includes(style)) {
      return <GeometricStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    // ====== TEXTURE STYLES ======
    if (['marble', 'concrete-stone'].includes(style)) {
      return <StoneTextureStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    if (['rustic-wood', 'kraft-paper', 'linen-weave'].includes(style)) {
      return <PaperTextureStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    if (style === 'silk-fabric') {
      return <SilkStyle primaryColor={primaryColor} accentColor={accentColor} />
    }

    // ====== ARTISTIC STYLES ======
    if (['watercolor', 'ink-brush', 'oil-painting', 'abstract-splash'].includes(style)) {
      return <ArtisticStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    if (style === 'sketch-line') {
      return <SketchStyle primaryColor={primaryColor} />
    }

    // ====== MINIMAL STYLES ======
    if (['minimalist', 'dot-pattern', 'line-grid'].includes(style)) {
      return <MinimalStyle primaryColor={primaryColor} variant={style} />
    }

    // ====== CULTURAL STYLES ======
    if (['ornate', 'baroque', 'arabesque', 'batik-indonesia'].includes(style)) {
      return <CulturalStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    // ====== ABSTRACT STYLES ======
    if (['gradient-mesh', 'aurora-glow', 'bokeh-lights'].includes(style)) {
      return <AbstractStyle primaryColor={primaryColor} accentColor={accentColor} variant={style} />
    }

    // Default fallback
    return <BotanicalStyle primaryColor={primaryColor} accentColor={accentColor} variant="botanical" />
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ backgroundColor }}
    >
      {renderStyle()}
    </div>
  )
}

/* ============================================
   NATURE: Botanical variations
============================================ */
function BotanicalStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  const leafCount = variant === 'tropical-leaves' ? 8 : 5
  const flowerOpacity = variant === 'floral-garden' ? 0.5 : 0

  return (
    <>
      {/* Top-left leaves */}
      <svg
        className="absolute top-0 left-0 w-72 h-72 opacity-20"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M20 180 Q60 120 40 60 Q80 100 100 40" stroke={primaryColor} strokeWidth="1.5" fill="none" />
        {[...Array(leafCount)].map((_, i) => (
          <ellipse
            key={i}
            cx={30 + i * 15}
            cy={60 + i * 10}
            rx="8"
            ry="20"
            fill={i % 2 === 0 ? primaryColor : accentColor}
            opacity={0.3 + (i % 3) * 0.1}
            transform={`rotate(${-30 - i * 5} ${30 + i * 15} ${60 + i * 10})`}
          />
        ))}
        {/* Flowers for floral-garden */}
        {variant === 'floral-garden' && (
          <>
            {[...Array(4)].map((_, i) => (
              <g key={`flower-${i}`} opacity={flowerOpacity}>
                <circle cx={50 + i * 30} cy={100 + (i % 2) * 30} r="6" fill={accentColor} />
                <circle cx={50 + i * 30} cy={100 + (i % 2) * 30} r="3" fill={primaryColor} />
              </g>
            ))}
          </>
        )}
      </svg>

      {/* Bottom-right leaves (mirror) */}
      <svg
        className="absolute bottom-0 right-0 w-72 h-72 opacity-20 rotate-180"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M20 180 Q60 120 40 60 Q80 100 100 40" stroke={primaryColor} strokeWidth="1.5" fill="none" />
        {[...Array(leafCount)].map((_, i) => (
          <ellipse
            key={i}
            cx={30 + i * 15}
            cy={60 + i * 10}
            rx="8"
            ry="20"
            fill={i % 2 === 0 ? primaryColor : accentColor}
            opacity={0.3 + (i % 3) * 0.1}
            transform={`rotate(${-30 - i * 5} ${30 + i * 15} ${60 + i * 10})`}
          />
        ))}
      </svg>
    </>
  )
}

/* ============================================
   NATURE: Sky & Water
============================================ */
function SkyWaterStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  return (
    <>
      {/* Soft gradients */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${accentColor}40 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${primaryColor}30 0%, transparent 50%)
          `,
        }}
      />

      {variant === 'ocean-waves' ? (
        <svg className="absolute bottom-0 left-0 w-full h-48 opacity-25" preserveAspectRatio="none">
          <path
            d="M0 100 Q25 80 50 100 T100 100 T150 100 T200 100 L200 200 L0 200 Z"
            fill={primaryColor}
            opacity="0.3"
          />
          <path
            d="M0 130 Q25 110 50 130 T100 130 T150 130 T200 130 L200 200 L0 200 Z"
            fill={accentColor}
            opacity="0.25"
          />
        </svg>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full opacity-25"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, ${accentColor}50 0%, transparent 25%),
              radial-gradient(circle at 60% 20%, ${accentColor}40 0%, transparent 30%),
              radial-gradient(circle at 80% 40%, ${accentColor}45 0%, transparent 28%)
            `,
          }}
        />
      )}
    </>
  )
}

/* ============================================
   NATURE: Starry Night
============================================ */
function StarryNightStyle({ primaryColor, accentColor }: {
  primaryColor: string
  accentColor: string
}) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, ${primaryColor}30 1px, transparent 2px),
            radial-gradient(circle at 35% 65%, ${primaryColor}25 1px, transparent 2px),
            radial-gradient(circle at 55% 15%, ${primaryColor}30 1.5px, transparent 2.5px),
            radial-gradient(circle at 75% 45%, ${primaryColor}25 1px, transparent 2px),
            radial-gradient(circle at 90% 75%, ${primaryColor}30 1px, transparent 2px),
            radial-gradient(circle at 45% 85%, ${primaryColor}20 1.5px, transparent 2.5px),
            radial-gradient(circle at 25% 55%, ${primaryColor}25 1px, transparent 2px),
            radial-gradient(circle at 85% 20%, ${primaryColor}30 1px, transparent 2px)
          `,
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}20` }} />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${primaryColor}15` }} />
    </>
  )
}

/* ============================================
   GEOMETRIC STYLES
============================================ */
function GeometricStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  if (variant === 'art-deco') {
    return (
      <>
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${primaryColor}20,
              ${primaryColor}20 2px,
              transparent 2px,
              transparent 20px
            )`,
          }}
        />
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-30" viewBox="0 0 400 100" fill="none">
          <path d="M50 80 L200 20 L350 80" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          <path d="M80 90 L200 40 L320 90" stroke={accentColor} strokeWidth="1" fill="none" />
          <circle cx="200" cy="20" r="5" fill={primaryColor} />
          <circle cx="50" cy="80" r="3" fill={accentColor} />
          <circle cx="350" cy="80" r="3" fill={accentColor} />
        </svg>
      </>
    )
  }

  if (variant === 'hexagon-grid') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hexPattern" width="56" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M28 0 L56 25 L56 75 L28 100 L0 75 L0 25 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </svg>
    )
  }

  if (variant === 'triangle-mosaic') {
    return (
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(60deg, ${primaryColor}15 25%, transparent 25.5%),
            linear-gradient(-60deg, ${accentColor}15 25%, transparent 25.5%)
          `,
          backgroundSize: '80px 140px',
        }}
      />
    )
  }

  if (variant === 'circular-ripple') {
    return (
      <>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                borderColor: `${primaryColor}${Math.max(10, 30 - i * 5).toString(16).padStart(2, '0')}`,
              }}
            />
          ))}
        </div>
      </>
    )
  }

  // Default geometric
  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10"
        style={{
          backgroundImage: `linear-gradient(30deg, ${primaryColor} 12%, transparent 12.5%, transparent 87%, ${primaryColor} 87.5%, ${primaryColor}),
            linear-gradient(150deg, ${primaryColor} 12%, transparent 12.5%, transparent 87%, ${primaryColor} 87.5%, ${primaryColor})`,
          backgroundSize: '80px 140px',
        }}
      />
      <div className="absolute top-10 right-10 w-32 h-32 border-2 rotate-45" style={{ borderColor: `${primaryColor}40` }} />
      <div className="absolute bottom-10 left-10 w-24 h-24 border-2 rotate-12" style={{ borderColor: `${accentColor}40` }} />
    </>
  )
}

/* ============================================
   TEXTURE: Stone/Marble
============================================ */
function StoneTextureStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, ${primaryColor}15 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, ${accentColor}20 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${primaryColor}08 0%, transparent 70%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
        <filter id={`noise-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise-${variant})`} />
      </svg>
    </>
  )
}

/* ============================================
   TEXTURE: Paper/Wood
============================================ */
function PaperTextureStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  const frequency = variant === 'linen-weave' ? '0.1 0.3' : variant === 'rustic-wood' ? '0.01 0.05' : '0.05 0.08'

  return (
    <>
      <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
        <filter id={`paper-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#paper-${variant})`} />
      </svg>
      {variant === 'rustic-wood' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              ${primaryColor}08 50px,
              ${primaryColor}08 52px
            )`,
          }}
        />
      )}
    </>
  )
}

/* ============================================
   TEXTURE: Silk
============================================ */
function SilkStyle({ primaryColor, accentColor }: {
  primaryColor: string
  accentColor: string
}) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(120deg, ${primaryColor}15 0%, transparent 30%, ${accentColor}15 60%, transparent 90%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            105deg,
            transparent,
            transparent 3px,
            ${primaryColor}08 3px,
            ${primaryColor}08 4px
          )`,
        }}
      />
    </>
  )
}

/* ============================================
   ARTISTIC STYLES
============================================ */
function ArtisticStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  return (
    <>
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: accentColor }}
      />

      {variant === 'ink-brush' && (
        <svg className="absolute top-10 right-10 w-32 h-32 opacity-20" viewBox="0 0 100 100">
          <path
            d="M20 50 Q30 20 50 30 T80 50 Q70 80 50 70 T20 50"
            fill={primaryColor}
            opacity="0.5"
          />
        </svg>
      )}

      {variant === 'oil-painting' && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `repeating-radial-gradient(
              circle at 30% 30%,
              ${primaryColor}10,
              ${primaryColor}10 20px,
              transparent 20px,
              transparent 40px
            )`,
          }}
        />
      )}
    </>
  )
}

/* ============================================
   ARTISTIC: Sketch
============================================ */
function SketchStyle({ primaryColor }: { primaryColor: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
      <path d="M50 100 Q150 50 250 120 T450 80" stroke={primaryColor} strokeWidth="0.5" fill="none" strokeDasharray="3,3" />
      <path d="M100 300 Q200 250 300 320 T500 280" stroke={primaryColor} strokeWidth="0.5" fill="none" strokeDasharray="2,4" />
      <circle cx="150" cy="150" r="40" stroke={primaryColor} strokeWidth="0.5" fill="none" strokeDasharray="4,2" />
    </svg>
  )
}

/* ============================================
   MINIMAL STYLES
============================================ */
function MinimalStyle({ primaryColor, variant }: {
  primaryColor: string
  variant: string
}) {
  if (variant === 'dot-pattern') {
    return (
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    )
  }

  if (variant === 'line-grid') {
    return (
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    )
  }

  // Minimalist
  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24" style={{ backgroundColor: `${primaryColor}30` }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24" style={{ backgroundColor: `${primaryColor}30` }} />
      <div className="absolute top-1/2 left-0 w-12 h-px" style={{ backgroundColor: `${primaryColor}30` }} />
      <div className="absolute top-1/2 right-0 w-12 h-px" style={{ backgroundColor: `${primaryColor}30` }} />
    </>
  )
}

/* ============================================
   CULTURAL STYLES
============================================ */
function CulturalStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  if (variant === 'arabesque' || variant === 'batik-indonesia') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id={`cultural-${variant}`} width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30 5 L55 30 L30 55 L5 30 Z"
                fill="none"
                stroke={primaryColor}
                strokeWidth="0.8"
              />
              <circle cx="30" cy="30" r="8" fill="none" stroke={accentColor} strokeWidth="0.5" />
              <circle cx="30" cy="30" r="3" fill={primaryColor} opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#cultural-${variant})`} />
        </svg>
      </>
    )
  }

  if (variant === 'baroque') {
    return (
      <>
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-30" viewBox="0 0 400 150" fill="none">
          <path d="M50 75 Q100 25 150 75 T250 75 T350 75" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          <path d="M75 90 Q125 50 175 90 T275 90" stroke={accentColor} strokeWidth="0.8" fill="none" />
          <circle cx="200" cy="40" r="6" fill={primaryColor} />
          <path d="M190 40 Q200 30 210 40 Q200 50 190 40" fill={accentColor} opacity="0.6" />
          <circle cx="150" cy="60" r="3" fill={accentColor} />
          <circle cx="250" cy="60" r="3" fill={accentColor} />
        </svg>
        <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-30 rotate-180" viewBox="0 0 400 150" fill="none">
          <path d="M50 75 Q100 25 150 75 T250 75 T350 75" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          <path d="M75 90 Q125 50 175 90 T275 90" stroke={accentColor} strokeWidth="0.8" fill="none" />
          <circle cx="200" cy="40" r="6" fill={primaryColor} />
          <path d="M190 40 Q200 30 210 40 Q200 50 190 40" fill={accentColor} opacity="0.6" />
        </svg>
      </>
    )
  }

  // Ornate (default)
  return (
    <>
      <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 opacity-30" viewBox="0 0 400 100" fill="none">
        <path d="M50 50 Q200 0 350 50" stroke={primaryColor} strokeWidth="1" fill="none" />
        <path d="M80 60 Q200 20 320 60" stroke={accentColor} strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="30" r="4" fill={primaryColor} />
        <circle cx="150" cy="40" r="2" fill={accentColor} />
        <circle cx="250" cy="40" r="2" fill={accentColor} />
        <path d="M190 30 Q200 20 210 30 Q200 40 190 30" fill={accentColor} opacity="0.5" />
      </svg>
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 opacity-30 rotate-180" viewBox="0 0 400 100" fill="none">
        <path d="M50 50 Q200 0 350 50" stroke={primaryColor} strokeWidth="1" fill="none" />
        <path d="M80 60 Q200 20 320 60" stroke={accentColor} strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="30" r="4" fill={primaryColor} />
        <circle cx="150" cy="40" r="2" fill={accentColor} />
        <circle cx="250" cy="40" r="2" fill={accentColor} />
      </svg>
    </>
  )
}

/* ============================================
   ABSTRACT STYLES
============================================ */
function AbstractStyle({ primaryColor, accentColor, variant }: {
  primaryColor: string
  accentColor: string
  variant: string
}) {
  if (variant === 'aurora-glow') {
    return (
      <>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, ${primaryColor}30 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 30%, ${accentColor}25 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 50% 80%, ${primaryColor}20 0%, transparent 60%)
            `,
          }}
        />
      </>
    )
  }

  if (variant === 'bokeh-lights') {
    return (
      <>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-xl"
            style={{
              width: `${30 + (i % 5) * 20}px`,
              height: `${30 + (i % 5) * 20}px`,
              left: `${(i * 8.5) % 100}%`,
              top: `${(i * 13) % 100}%`,
              backgroundColor: i % 2 === 0 ? `${primaryColor}30` : `${accentColor}30`,
            }}
          />
        ))}
      </>
    )
  }

  // Gradient mesh (default)
  return (
    <div
      className="absolute inset-0 opacity-40"
      style={{
        background: `
          radial-gradient(at 0% 0%, ${primaryColor}25 0px, transparent 50%),
          radial-gradient(at 100% 0%, ${accentColor}20 0px, transparent 50%),
          radial-gradient(at 100% 100%, ${primaryColor}25 0px, transparent 50%),
          radial-gradient(at 0% 100%, ${accentColor}20 0px, transparent 50%)
        `,
      }}
    />
  )
}
