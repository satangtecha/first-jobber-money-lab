/**
 * High-fidelity 3D isometric vector graphics matching the Quixel learning dashboard design.
 */

export function graphic3DBrain() {
  return `<svg class="graphic-3d brain" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g-brain-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9D72FF"/>
        <stop offset="60%" stop-color="#7042E0"/>
        <stop offset="100%" stop-color="#4C1FA8"/>
      </linearGradient>
      <linearGradient id="g-brain-front" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B794FF"/>
        <stop offset="100%" stop-color="#8050EB"/>
      </linearGradient>
      <linearGradient id="g-lightning" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFEA79"/>
        <stop offset="100%" stop-color="#FFB800"/>
      </linearGradient>
      <filter id="shadow-3d" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#361A70" flood-opacity="0.35"/>
      </filter>
    </defs>
    <!-- Soft shadow -->
    <ellipse cx="80" cy="122" rx="46" ry="12" fill="#241042" opacity="0.18"/>
    <!-- Brain main mass left -->
    <g filter="url(#shadow-3d)">
      <path d="M48 56 C38 48 38 34 50 28 C60 22 72 30 76 38 C80 30 92 22 102 28 C114 34 114 48 104 56 C116 64 118 80 106 90 C96 98 84 94 76 86 C68 94 56 98 46 90 C34 80 36 64 48 56 Z" fill="url(#g-brain-base)"/>
      <path d="M52 58 C44 52 44 40 54 34 C62 30 72 36 76 42 C80 36 90 30 98 34 C108 40 108 52 100 58 C110 65 110 78 100 86 C92 92 82 89 76 82 C70 89 60 92 52 86 C42 78 42 65 52 58 Z" fill="url(#g-brain-front)" opacity="0.85"/>
      <!-- Brain gyri / lobes grooves -->
      <path d="M76 40 V84" stroke="#4C1FA8" stroke-width="3" stroke-linecap="round"/>
      <path d="M54 46 Q64 50 64 62 Q64 74 54 78" stroke="#4C1FA8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M98 46 Q88 50 88 62 Q88 74 98 78" stroke="#4C1FA8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="42" r="3" fill="#E2D4FF"/>
      <circle cx="92" cy="42" r="3" fill="#E2D4FF"/>
    </g>
    <!-- Lightning sparks -->
    <path d="M30 38 L42 22 L38 34 L48 34 L32 54 L36 40 Z" fill="url(#g-lightning)" filter="drop-shadow(0 2px 4px rgba(255,184,0,0.5))"/>
    <path d="M124 38 L136 22 L132 34 L142 34 L126 54 L130 40 Z" fill="url(#g-lightning)" filter="drop-shadow(0 2px 4px rgba(255,184,0,0.5))"/>
    <!-- Floating spark dots -->
    <circle cx="28" cy="68" r="2.5" fill="#FFEA79"/>
    <circle cx="128" cy="68" r="2.5" fill="#FFEA79"/>
    <circle cx="76" cy="18" r="2" fill="#E2D4FF"/>
  </svg>`;
}

export function graphic3DBlocks() {
  return `<svg class="graphic-3d blocks" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <!-- Cube C (Blue) -->
      <linearGradient id="g-c-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#74D8FF"/><stop offset="1" stop-color="#38A2FF"/></linearGradient>
      <linearGradient id="g-c-left" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2D8BEB"/><stop offset="1" stop-color="#196BC2"/></linearGradient>
      <linearGradient id="g-c-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1E75D4"/><stop offset="1" stop-color="#0E4C93"/></linearGradient>
      <!-- Cube A (Coral Red) -->
      <linearGradient id="g-a-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FF8A80"/><stop offset="1" stop-color="#F44336"/></linearGradient>
      <linearGradient id="g-a-left" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E53935"/><stop offset="1" stop-color="#C62828"/></linearGradient>
      <linearGradient id="g-a-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#D32F2F"/><stop offset="1" stop-color="#B71C1C"/></linearGradient>
      <!-- Cube B (Yellow Gold) -->
      <linearGradient id="g-b-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFE082"/><stop offset="1" stop-color="#FFCA28"/></linearGradient>
      <linearGradient id="g-b-left" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFB300"/><stop offset="1" stop-color="#FFA000"/></linearGradient>
      <linearGradient id="g-b-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FB8C00"/><stop offset="1" stop-color="#E65100"/></linearGradient>
    </defs>
    <!-- Soft shadow -->
    <ellipse cx="60" cy="106" rx="42" ry="10" fill="#2C3E50" opacity="0.16"/>
    
    <!-- Top Cube: C (Blue) -->
    <g transform="translate(36, 12)">
      <!-- Top face -->
      <polygon points="24,0 48,12 24,24 0,12" fill="url(#g-c-top)"/>
      <!-- Left face -->
      <polygon points="0,12 24,24 24,52 0,40" fill="url(#g-c-left)"/>
      <!-- Right face -->
      <polygon points="24,24 48,12 48,40 24,52" fill="url(#g-c-right)"/>
      <!-- Letter C -->
      <text x="12" y="38" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18" transform="skewY(22) scale(1, 0.88)">C</text>
    </g>
    
    <!-- Bottom Left Cube: A (Red) -->
    <g transform="translate(10, 48)">
      <!-- Top face -->
      <polygon points="24,0 48,12 24,24 0,12" fill="url(#g-a-top)"/>
      <!-- Left face -->
      <polygon points="0,12 24,24 24,52 0,40" fill="url(#g-a-left)"/>
      <!-- Right face -->
      <polygon points="24,24 48,12 48,40 24,52" fill="url(#g-a-right)"/>
      <!-- Letter A -->
      <text x="12" y="38" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18" transform="skewY(22) scale(1, 0.88)">A</text>
    </g>

    <!-- Bottom Right Cube: B (Yellow) -->
    <g transform="translate(62, 48)">
      <!-- Top face -->
      <polygon points="24,0 48,12 24,24 0,12" fill="url(#g-b-top)"/>
      <!-- Left face -->
      <polygon points="0,12 24,24 24,52 0,40" fill="url(#g-b-left)"/>
      <!-- Right face -->
      <polygon points="24,24 48,12 48,40 24,52" fill="url(#g-b-right)"/>
      <!-- Letter B -->
      <text x="12" y="38" fill="#5D4037" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18" transform="skewY(22) scale(1, 0.88)">B</text>
    </g>
  </svg>`;
}

export function graphic3DCalendar() {
  return `<svg class="graphic-3d calendar" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g-cal-back" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FF6584"/><stop offset="1" stop-color="#E03058"/></linearGradient>
      <linearGradient id="g-cal-page" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0F3F8"/></linearGradient>
      <filter id="cal-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#D81B60" flood-opacity="0.25"/>
      </filter>
    </defs>
    <!-- Soft shadow -->
    <ellipse cx="60" cy="106" rx="38" ry="8" fill="#2C3E50" opacity="0.16"/>
    <!-- Calendar back plate with rings -->
    <g transform="rotate(-6 60 60)" filter="url(#cal-shadow)">
      <!-- Red binder header -->
      <rect x="22" y="16" width="76" height="84" rx="14" fill="url(#g-cal-page)"/>
      <path d="M22 30 C22 22 28 16 36 16 H84 C92 16 98 22 98 30 V38 H22 Z" fill="url(#g-cal-back)"/>
      <!-- Spiral binder rings -->
      <rect x="34" y="10" width="6" height="14" rx="3" fill="#D3D3D3" stroke="#9E9E9E" stroke-width="1"/>
      <rect x="57" y="10" width="6" height="14" rx="3" fill="#D3D3D3" stroke="#9E9E9E" stroke-width="1"/>
      <rect x="80" y="10" width="6" height="14" rx="3" fill="#D3D3D3" stroke="#9E9E9E" stroke-width="1"/>
      <!-- Calendar grid items -->
      <circle cx="36" cy="52" r="4" fill="#FF8CA3"/>
      <circle cx="50" cy="52" r="4" fill="#FF8CA3"/>
      <circle cx="64" cy="52" r="4" fill="#FF8CA3"/>
      <circle cx="78" cy="52" r="4" fill="#E03058"/>
      
      <circle cx="36" cy="66" r="4" fill="#FF8CA3"/>
      <circle cx="50" cy="66" r="4" fill="#E03058"/>
      <circle cx="64" cy="66" r="4" fill="#FF8CA3"/>
      <circle cx="78" cy="66" r="4" fill="#FF8CA3"/>

      <circle cx="36" cy="80" r="4" fill="#FF8CA3"/>
      <circle cx="50" cy="80" r="4" fill="#FF8CA3"/>
      <circle cx="64" cy="80" r="4" fill="#E03058"/>
      <circle cx="78" cy="80" r="4" fill="#FF8CA3"/>
    </g>
  </svg>`;
}

export function graphic3DNotepad() {
  return `<svg class="graphic-3d notepad" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g-pad-page" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2F5F8"/></linearGradient>
      <linearGradient id="g-pen-body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2D3748"/><stop offset="1" stop-color="#1A202C"/></linearGradient>
      <linearGradient id="g-pen-tip" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD54F"/><stop offset="1" stop-color="#FFA000"/></linearGradient>
      <filter id="pad-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#1A202C" flood-opacity="0.2"/>
      </filter>
    </defs>
    <!-- Soft shadow -->
    <ellipse cx="58" cy="106" rx="36" ry="8" fill="#2C3E50" opacity="0.16"/>
    <!-- Notepad card -->
    <g transform="rotate(-4 60 60)" filter="url(#pad-shadow)">
      <rect x="24" y="18" width="68" height="82" rx="12" fill="url(#g-pad-page)" stroke="#E2E8F0" stroke-width="2"/>
      <!-- Top binder coils -->
      <circle cx="36" cy="24" r="3" fill="#1A202C"/>
      <circle cx="48" cy="24" r="3" fill="#1A202C"/>
      <circle cx="60" cy="24" r="3" fill="#1A202C"/>
      <circle cx="72" cy="24" r="3" fill="#1A202C"/>
      <circle cx="84" cy="24" r="3" fill="#1A202C"/>
      <!-- Checklist lines -->
      <rect x="34" y="40" width="36" height="4" rx="2" fill="#718096"/>
      <rect x="34" y="52" width="48" height="4" rx="2" fill="#CBD5E0"/>
      <rect x="34" y="64" width="42" height="4" rx="2" fill="#CBD5E0"/>
      <rect x="34" y="76" width="30" height="4" rx="2" fill="#CBD5E0"/>
    </g>
    <!-- 3D Stylus / Pencil leaning -->
    <g transform="rotate(32 78 54)">
      <rect x="68" y="24" width="12" height="52" rx="3" fill="url(#g-pen-body)"/>
      <polygon points="68,76 80,76 74,92" fill="url(#g-pen-tip)"/>
      <polygon points="72,88 76,88 74,92" fill="#1A202C"/>
      <rect x="68" y="20" width="12" height="6" rx="2" fill="#E2E8F0"/>
    </g>
  </svg>`;
}

export function graphic3DPalette() {
  return `<svg class="graphic-3d palette" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g-palette-base" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7C4DFF"/><stop offset="1" stop-color="#512DA8"/></linearGradient>
      <linearGradient id="g-brush-body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4A5568"/><stop offset="1" stop-color="#2D3748"/></linearGradient>
      <filter id="pal-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#311B92" flood-opacity="0.25"/>
      </filter>
    </defs>
    <!-- Soft shadow -->
    <ellipse cx="60" cy="106" rx="40" ry="8" fill="#2C3E50" opacity="0.16"/>
    <!-- Palette tray -->
    <g transform="rotate(-8 60 60)" filter="url(#pal-shadow)">
      <path d="M26 50 C26 30 42 18 64 18 C86 18 102 32 102 54 C102 76 84 94 62 94 C50 94 42 86 38 78 C34 70 26 70 26 50 Z" fill="url(#g-palette-base)"/>
      <circle cx="44" cy="74" r="8" fill="#F8FAFC"/>
      <!-- Paint color blobs -->
      <circle cx="48" cy="34" r="6" fill="#FF5252"/>
      <circle cx="68" cy="30" r="6" fill="#FFD740"/>
      <circle cx="86" cy="42" r="6" fill="#69F0AE"/>
      <circle cx="88" cy="62" r="6" fill="#40C4FF"/>
      <circle cx="72" cy="78" r="6" fill="#FF4081"/>
    </g>
    <!-- Paint Brush -->
    <g transform="rotate(38 68 70)">
      <rect x="58" y="32" width="8" height="54" rx="3" fill="url(#g-brush-body)"/>
      <rect x="58" y="24" width="8" height="10" rx="1" fill="#E2E8F0"/>
      <path d="M58 24 C58 16 62 12 62 12 C62 12 66 16 66 24 Z" fill="#69F0AE"/>
    </g>
  </svg>`;
}
