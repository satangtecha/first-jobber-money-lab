/**
 * SkillSpark + Mascot Coach Vector Graphics
 * Clean vector illustrations matching the uploaded SkillSpark UI design
 * seamlessly integrated with our beloved Egg Mascot Coach!
 */

import { mascotSVG } from './mascot.js';

export function graphicSkillSparkOnboarding() {
  return `<div class="sp-onboarding-illustration" aria-hidden="true">
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" class="sp-hero-svg">
      <defs>
        <linearGradient id="sp-sky-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#00A3FF"/>
        </linearGradient>
        <linearGradient id="sp-blue-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#0369A1"/>
        </linearGradient>
        <linearGradient id="sp-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </linearGradient>
        <filter id="sp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#00A3FF" flood-opacity="0.25"/>
        </filter>
        <filter id="sp-shadow-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Soft background glow rings -->
      <circle cx="160" cy="140" r="110" fill="#E0F2FE" opacity="0.6"/>
      <circle cx="160" cy="140" r="85" fill="#BAE6FD" opacity="0.4"/>

      <!-- Lightbulb of Wisdom & Ideas (Top Center) -->
      <g transform="translate(130, 20)">
        <!-- Lightbulb glow rays -->
        <path d="M30 0 V-10 M10 6 L3 -1 M50 6 L57 -1 M0 26 H-10 M60 26 H70" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
        <!-- Bulb body -->
        <path d="M15 30 C5 22 5 8 20 2 C35 -4 55 8 45 30 C40 38 38 42 38 48 H22 C22 42 20 38 15 30 Z" fill="url(#sp-gold-grad)"/>
        <!-- Bulb base -->
        <rect x="22" y="48" width="16" height="5" rx="2" fill="#475569"/>
        <rect x="24" y="54" width="12" height="4" rx="2" fill="#64748B"/>
        <rect x="26" y="59" width="8" height="3" rx="1.5" fill="#334155"/>
        <!-- Filament shine -->
        <path d="M25 18 Q30 12 35 18" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      </g>

      <!-- Isometric Book Stack (Center/Bottom Left) -->
      <!-- Book 1 (Bottom Thick Cyan Book) -->
      <g filter="url(#sp-shadow-soft)">
        <rect x="50" y="210" width="170" height="26" rx="6" fill="#00A3FF"/>
        <path d="M50 210 Q40 223 50 236 L210 236 Q220 223 210 210 Z" fill="#0284C7"/>
        <!-- White pages -->
        <rect x="62" y="214" width="154" height="18" rx="3" fill="#FFFFFF"/>
        <line x1="68" y1="220" x2="208" y2="220" stroke="#E2E8F0" stroke-width="1.5"/>
        <line x1="68" y1="226" x2="208" y2="226" stroke="#E2E8F0" stroke-width="1.5"/>
      </g>

      <!-- Book 2 (Middle Blue Book) -->
      <g filter="url(#sp-shadow-soft)">
        <rect x="70" y="178" width="150" height="24" rx="5" fill="#38BDF8"/>
        <!-- White pages -->
        <rect x="80" y="182" width="134" height="16" rx="3" fill="#FFFFFF"/>
        <line x1="86" y1="188" x2="206" y2="188" stroke="#E2E8F0" stroke-width="1.5"/>
        <line x1="86" y1="193" x2="206" y2="193" stroke="#E2E8F0" stroke-width="1.5"/>
      </g>

      <!-- Book 3 (Top Upright A-Z Blue Book) -->
      <g filter="url(#sp-glow)">
        <rect x="42" y="90" width="84" height="106" rx="10" fill="url(#sp-sky-grad)"/>
        <!-- Spine -->
        <path d="M42 90 H52 V196 H42 Z" fill="#0284C7" opacity="0.6"/>
        <!-- Bookmark ribbon -->
        <path d="M60 90 V115 L66 110 L72 115 V90 Z" fill="#FDE047"/>
        <!-- "A-Z" letters on book -->
        <text x="84" y="148" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.02em">A-Z</text>
        <!-- Bookmark loop line -->
        <path d="M58 84 C58 70 82 70 82 84" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Person / Student silhouette sitting on the book reading a tablet -->
      <g transform="translate(195, 85)">
        <!-- Tablet glow -->
        <rect x="-8" y="42" width="18" height="26" rx="3" fill="#7DD3FC" transform="rotate(-25)"/>
        <!-- Head -->
        <circle cx="20" cy="18" r="10" fill="#1E293B"/>
        <!-- Hair ponytail -->
        <path d="M12 18 C8 12 14 6 22 8 C20 18 12 18 12 18 Z" fill="#0F172A"/>
        <path d="M10 20 C4 24 6 32 10 36" stroke="#0F172A" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Torso (Cyan Top) -->
        <path d="M14 28 Q24 26 30 38 L24 68 Q14 68 12 54 Z" fill="#00A3FF"/>
        <!-- Arms holding tablet -->
        <path d="M22 36 L12 50 L-2 46" stroke="#1E293B" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Legs (Navy Pants) sitting -->
        <path d="M20 64 L40 66 L42 96" stroke="#0F172A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Shoes (Pink sneakers) -->
        <ellipse cx="44" cy="98" rx="8" ry="4" fill="#F43F5E"/>
      </g>
    </svg>
    <!-- Embedded Egg Mascot floating cheerfully beside the books! -->
    <div class="sp-onboarding-mascot">
      ${mascotSVG('point')}
    </div>
  </div>`;
}

export function graphicCourseCardCover(type = 'tax') {
  if (type === 'tax') {
    return `<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="sp-card-cover-svg" aria-hidden="true">
      <rect width="160" height="120" rx="16" fill="#E0F2FE"/>
      <!-- Calculator / Tax forms isometric 3D -->
      <g transform="translate(30, 20)">
        <rect x="15" y="10" width="70" height="75" rx="12" fill="#00A3FF" opacity="0.9"/>
        <rect x="23" y="20" width="54" height="18" rx="6" fill="#FFFFFF"/>
        <text x="68" y="34" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#0284C7" text-anchor="end">฿ 2569</text>
        <circle cx="34" cy="50" r="6" fill="#BAE6FD"/>
        <circle cx="50" cy="50" r="6" fill="#BAE6FD"/>
        <circle cx="66" cy="50" r="6" fill="#BAE6FD"/>
        <circle cx="34" cy="66" r="6" fill="#BAE6FD"/>
        <circle cx="50" cy="66" r="6" fill="#BAE6FD"/>
        <circle cx="66" cy="66" r="6" fill="#FDE047"/>
        <!-- Golden coin -->
        <circle cx="85" cy="25" r="14" fill="#F59E0B"/>
        <circle cx="85" cy="25" r="11" fill="#FBBF24"/>
        <text x="85" y="29" font-size="12" font-weight="900" fill="#78350F" text-anchor="middle">฿</text>
      </g>
    </svg>`;
  }
  if (type === 'investing') {
    return `<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="sp-card-cover-svg" aria-hidden="true">
      <rect width="160" height="120" rx="16" fill="#FEF3C7"/>
      <!-- Growth Chart & 3D Cubes -->
      <g transform="translate(25, 20)">
        <path d="M10 65 L35 45 L60 52 L90 20 L105 28" stroke="#00A3FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="90" cy="20" r="5" fill="#00A3FF"/>
        <rect x="20" y="55" width="16" height="24" rx="4" fill="#FBBF24" opacity="0.6"/>
        <rect x="45" y="42" width="16" height="37" rx="4" fill="#F59E0B" opacity="0.7"/>
        <rect x="70" y="25" width="16" height="54" rx="4" fill="#0284C7" opacity="0.85"/>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="sp-card-cover-svg" aria-hidden="true">
    <rect width="160" height="120" rx="16" fill="#F3E8FF"/>
    <!-- Compass & Map Roadmap -->
    <g transform="translate(30, 20)">
      <circle cx="50" cy="40" r="32" fill="#7C3AED" opacity="0.85"/>
      <circle cx="50" cy="40" r="28" fill="#FFFFFF"/>
      <path d="M50 20 L56 36 L50 44 L44 36 Z" fill="#EF4444"/>
      <path d="M50 60 L44 44 L50 36 L56 44 Z" fill="#64748B"/>
      <circle cx="50" cy="40" r="4" fill="#1E293B"/>
    </g>
  </svg>`;
}

export function graphicMascotAvatar() {
  return `<div class="sp-mascot-avatar-chip">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="sp-avatar-svg">
      <circle cx="20" cy="20" r="19" fill="#00A3FF"/>
      <circle cx="20" cy="20" r="17" fill="#FBF5E6"/>
      <!-- Egg mascot face inside avatar -->
      <circle cx="15" cy="18" r="3" fill="#1B2E4A"/>
      <circle cx="25" cy="18" r="3" fill="#1B2E4A"/>
      <circle cx="16" cy="17" r="1" fill="#FFFFFF"/>
      <circle cx="26" cy="17" r="1" fill="#FFFFFF"/>
      <ellipse cx="12" cy="22" rx="2.5" ry="1.5" fill="#F4A0A0"/>
      <ellipse cx="28" cy="22" rx="2.5" ry="1.5" fill="#F4A0A0"/>
      <path d="M15 23 Q20 27 25 23" stroke="#1B2E4A" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <!-- Pha Khao Ma sash -->
      <rect x="7" y="29" width="26" height="8" rx="2" fill="#3B6BA5"/>
      <line x1="7" y1="33" x2="33" y2="33" stroke="#E8B358" stroke-width="1.5"/>
    </svg>
  </div>`;
}
