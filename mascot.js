/**
 * Mascot Coach — Egg mascot SVG illustrations
 * Simplified but recognizable egg character with plaid sash (pha khao ma).
 * Poses: point, study, celebrate, calculate, invest, run
 */

const PLAID = `<pattern id="mc-plaid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
  <rect width="14" height="14" fill="#3B6BA5"/>
  <rect width="7" height="7" fill="#5588BB"/>
  <rect x="7" y="7" width="7" height="7" fill="#5588BB"/>
  <rect x="3.5" y="3.5" width="7" height="7" fill="#E8B358" opacity="0.55"/>
</pattern>`;

function body() {
  return `<ellipse cx="100" cy="262" rx="50" ry="7" fill="#1B2E4A" opacity="0.08"/>
    <ellipse cx="100" cy="140" rx="65" ry="85" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="3"/>
    <path d="M82 55 L88 62 L82 67 L90 72" fill="none" stroke="#1B2E4A" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="78" cy="115" r="13" fill="white" stroke="#1B2E4A" stroke-width="2.5"/>
    <circle cx="122" cy="115" r="13" fill="white" stroke="#1B2E4A" stroke-width="2.5"/>
    <circle cx="80" cy="118" r="6.5" fill="#1B2E4A"/>
    <circle cx="124" cy="118" r="6.5" fill="#1B2E4A"/>
    <circle cx="82.5" cy="115" r="2.5" fill="white"/>
    <circle cx="126.5" cy="115" r="2.5" fill="white"/>
    <ellipse cx="65" cy="135" rx="10" ry="7" fill="#F4A0A0" opacity="0.55"/>
    <ellipse cx="135" cy="135" rx="10" ry="7" fill="#F4A0A0" opacity="0.55"/>
    <path d="M72 142 Q100 165 128 142" fill="none" stroke="#1B2E4A" stroke-width="3" stroke-linecap="round"/>
    <path d="M38 168 Q100 182 162 168 L162 198 Q100 212 38 198 Z" fill="url(#mc-plaid)" stroke="#1B2E4A" stroke-width="2"/>
    <rect x="78" y="218" width="10" height="28" rx="5" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <rect x="112" y="218" width="10" height="28" rx="5" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <ellipse cx="83" cy="253" rx="15" ry="7" fill="#1B2E4A"/>
    <ellipse cx="117" cy="253" rx="15" ry="7" fill="#1B2E4A"/>
    <path d="M70 253 L96 253" stroke="#FBF5E6" stroke-width="2" stroke-linecap="round"/>
    <path d="M104 253 L130 253" stroke="#FBF5E6" stroke-width="2" stroke-linecap="round"/>`;
}

const POSES = {
  point: `<path d="M40 135 Q20 120 12 118" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="10" cy="117" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M160 138 Q175 148 178 155" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="180" cy="157" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <rect x="172" y="100" width="4" height="60" rx="2" fill="#8B6F47" stroke="#1B2E4A" stroke-width="1.5"/>`,

  study: `<path d="M42 148 Q30 158 28 168" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="27" cy="170" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M158 148 Q170 158 172 168" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="173" cy="170" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <rect x="60" y="158" width="80" height="50" rx="6" fill="#FFFFFF" stroke="#1B2E4A" stroke-width="2.5"/>
    <line x1="70" y1="172" x2="130" y2="172" stroke="#7D9C7D" stroke-width="2.5"/>
    <line x1="70" y1="183" x2="115" y2="183" stroke="#E8B358" stroke-width="2.5"/>
    <line x1="70" y1="194" x2="125" y2="194" stroke="#7D9C7D" stroke-width="2.5"/>`,

  celebrate: `<path d="M42 130 Q25 105 20 85" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="18" cy="82" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M158 130 Q175 105 180 85" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="182" cy="82" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M12 62 L18 50 L24 62 M18 50 L18 38" stroke="#E8B358" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M176 62 L182 50 L188 62 M182 50 L182 38" stroke="#E8B358" stroke-width="3" stroke-linecap="round" fill="none"/>`,

  calculate: `<path d="M40 140 Q25 130 18 128" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="15" cy="127" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M160 142 Q168 152 162 162" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="164" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <rect x="118" y="112" width="42" height="52" rx="6" fill="#7D9C7D" stroke="#1B2E4A" stroke-width="2"/>
    <rect x="124" y="119" width="30" height="13" rx="2" fill="#1B2E4A"/>
    <text x="139" y="129" text-anchor="middle" fill="#7D9C7D" font-size="9" font-weight="bold">9%</text>
    <rect x="124" y="138" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>
    <rect x="134" y="138" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>
    <rect x="144" y="138" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>
    <rect x="124" y="148" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>
    <rect x="134" y="148" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>
    <rect x="144" y="148" width="8" height="6" rx="1" fill="#1B2E4A" opacity="0.7"/>`,

  invest: `<path d="M40 135 Q25 115 20 95" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="18" cy="92" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M160 140 Q175 150 178 158" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="180" cy="160" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <circle cx="14" cy="78" r="9" fill="#E8B358" stroke="#1B2E4A" stroke-width="2"/>
    <circle cx="32" cy="62" r="7" fill="#5B7DB8" stroke="#1B2E4A" stroke-width="2"/>
    <circle cx="8" cy="58" r="6" fill="#D4736E" stroke="#1B2E4A" stroke-width="2"/>`,

  run: `<path d="M42 135 Q60 120 75 115" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="77" cy="113" r="8" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M158 140 Q145 155 135 165" fill="none" stroke="#1B2E4A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="133" cy="167" r="7" fill="#FBF5E6" stroke="#1B2E4A" stroke-width="2.5"/>
    <path d="M155 70 L155 240" stroke="#7D9C7D" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M155 70 L178 75 L155 88 Z" fill="#7D9C7D" stroke="#1B2E4A" stroke-width="1.5"/>
    <path d="M145 70 L185 70" stroke="#1B2E4A" stroke-width="2.5" stroke-linecap="round"/>`
};

export function mascotSVG(pose = 'point') {
  const poseContent = POSES[pose] || POSES.point;
  return `<svg class="mc-mascot mc-mascot--${pose}" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${PLAID}</defs>${body()}${poseContent}</svg>`;
}
