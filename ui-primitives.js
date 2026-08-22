export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const ICON_PATHS = Object.freeze({
  back: '<path d="m15 18-6-6 6-6"/><path d="M9 12h10"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  courses: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/>',
  challenges: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  debt: '<path d="M4 7h16"/><path d="M6 4h12v16H6z"/><path d="M9 11h6M9 15h4"/>',
  learn: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
  progress: '<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.38.34.72.6 1 .3.27.68.42 1.1.4h.1v4h-.1c-.42-.02-.8.13-1.1.4-.26.28-.47.62-.6 1z"/>',
  arrow: '<path d="M5 12h14"/><path d="m14 7 5 5-5 5"/>',
  tax: '<path d="M7 3h10l3 3v15H4V3z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  invest: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/>',
  shield: '<path d="M12 3 4.5 6v5c0 4.8 3.1 8.4 7.5 10 4.4-1.6 7.5-5.2 7.5-10V6z"/><path d="m9 12 2 2 4-5"/>',
  labs: '<path d="M9 3h6M10 3v6L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  dots: '<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 2.5s-2.5 1-2.5 2.5a2.5 2.5 0 0 0 5 0"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>'
});

export function renderIcon(name, className = '') {
  const paths = ICON_PATHS[name] || ICON_PATHS.arrow;
  return `<svg class="ui-icon ${escapeHtml(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const LAB_STAGE_LABELS = ['Goal', 'Action', 'Outcome', 'Explanation', 'Next step'];

export function renderLabJourney({ topic = 'general', activeStage = 0, status = '', stages = [] } = {}) {
  const current = Math.max(0, Math.min(LAB_STAGE_LABELS.length - 1, Number(activeStage) || 0));
  const safeStages = LAB_STAGE_LABELS.map((label, index) => ({
    label,
    title: stages[index]?.title || label,
    detail: stages[index]?.detail || ''
  }));
  return `<section class="lab-journey lab-journey--${escapeHtml(topic)}" aria-label="เส้นทางของ Lab นี้">
    <div class="lab-journey__head"><span class="eyebrow">YOUR LAB JOURNEY</span><p>${escapeHtml(status)}</p></div>
    <ol>${safeStages.map((stage, index) => {
      const state = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
      const stateLabel = index < current ? 'เสร็จแล้ว' : index === current ? 'กำลังทำ' : 'ขั้นถัดไป';
      return `<li class="lab-journey__stage is-${state}" ${index === current ? 'aria-current="step"' : ''}>
        <span class="lab-journey__number" aria-hidden="true">${index < current ? '✓' : index + 1}</span>
        <div><span class="lab-journey__label">${escapeHtml(stage.label)} · ${escapeHtml(stateLabel)}</span><b>${escapeHtml(stage.title)}</b>${stage.detail ? `<small>${escapeHtml(stage.detail)}</small>` : ''}</div>
      </li>`;
    }).join('')}</ol>
  </section>`;
}

export function renderInputCard({
  name,
  label,
  value = '',
  type = 'text',
  tone = '',
  inputMode = 'text',
  hint = '',
  placeholder = ''
}) {
  return `<label class="input-card ${tone ? `tone-${tone}` : ''}" for="${escapeHtml(name)}" data-field-anchor="${escapeHtml(name)}">
    <span>${escapeHtml(label)}</span>
    ${hint ? `<small>${escapeHtml(hint)}</small>` : ''}
    <input id="${escapeHtml(name)}" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}"
      ${type === 'text' ? `inputmode="${escapeHtml(inputMode)}"` : ''}
      ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}>
  </label>`;
}

export function renderRouteChoice({ kind = 'radio', name, value, title, note = '', selected = false }) {
  const checked = selected ? 'checked' : '';
  return `<label class="route-choice ${selected ? 'selected' : ''}">
    <input type="${kind}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${checked}>
    <span class="route-check" aria-hidden="true">${selected ? '✓' : ''}</span>
    <span><b>${escapeHtml(title)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ''}</span>
  </label>`;
}

export function renderProgressHeader({ step, total = 3, title, note }) {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeStep = Math.min(safeTotal, Math.max(0, Number(step) || 0));
  const progress = Math.min(100, Math.max(0, (safeStep / safeTotal) * 100));
  return `<section class="wizard-heading">
    <span class="eyebrow">ROUTE CHECK · ${step}/${total}</span>
    <div class="step-track" role="progressbar" aria-label="ขั้นที่ ${safeStep} จาก ${safeTotal}" aria-valuemin="0" aria-valuemax="${safeTotal}" aria-valuenow="${safeStep}" aria-valuetext="ขั้นที่ ${safeStep} จาก ${safeTotal}"><i style="width:${progress}%"></i></div>
    <h1>${escapeHtml(title)}</h1><p>${escapeHtml(note)}</p>
  </section>`;
}

export function renderCockpitIllustration() {
  return `<svg class="hero-illustration" viewBox="0 0 420 280" role="img" aria-label="ภาพแผนที่หนี้และเส้นทางแก้ไข">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#61c8aa"/><stop offset="1" stop-color="#8ea8ff"/></linearGradient></defs>
    <rect x="38" y="30" width="344" height="210" rx="38" fill="#102d3e"/>
    <path d="M76 182 C128 122 164 214 214 145 S305 73 349 104" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="77" cy="182" r="19" fill="#fff"/><circle cx="214" cy="145" r="19" fill="#fff"/><circle cx="349" cy="104" r="19" fill="#fff"/>
    <rect x="82" y="55" width="105" height="17" rx="8" fill="#ffffff35"/><rect x="82" y="82" width="70" height="10" rx="5" fill="#ffffff22"/>
    <rect x="270" y="170" width="70" height="45" rx="14" fill="#fff"/><path d="M286 193l11 10 24-28" fill="none" stroke="#147a69" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

export function renderTopBar({ screen }) {
  const isDashboard = screen === 'home';
  const isCourses = ['learn', 'course', 'course-lesson', 'course-quiz', 'lesson', 'lesson-reflection', 'course-action'].includes(screen);
  const isChallenges = ['learning-progress', 'history'].includes(screen);
  const isTax = screen === 'tax-lab';
  const isDebt = ['portfolio', 'debt-editor', 'payoff', 'reminders', 'consent', 'intake-money', 'intake-status', 'intake-details', 'diagnosis', 'action-plan'].includes(screen);
  const isInvest = screen === 'invest-sim';

  return `<header class="sp-top-header" role="banner">
    <div class="sp-top-inner">
      <div style="display: flex; align-items: center; gap: 12px;">
        ${screen !== 'home' ? `<button class="sp-search-circle-btn" style="width:36px;height:36px;min-width:36px;background:#F1F5F9;color:#0F172A;" data-action="back" aria-label="ย้อนกลับ">${renderIcon('back')}</button>` : ''}
        <button class="sp-brand-badge" data-screen="home" aria-label="SkillSpark First Jobber Money Lab">
          <div class="sp-brand-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span class="sp-brand-name">SkillSpark</span>
        </button>
      </div>

      <nav class="sp-nav-center" aria-label="เมนูหลัก">
        <button class="sp-nav-pill ${isDashboard ? 'active' : ''}" data-screen="home" ${isDashboard ? 'aria-current="page"' : ''}>
          ${renderIcon('dashboard')}
          <span>Dashboard</span>
        </button>
        <button class="sp-nav-pill ${isCourses ? 'active' : ''}" data-screen="learn" ${isCourses ? 'aria-current="page"' : ''}>
          ${renderIcon('courses')}
          <span>Courses</span>
        </button>
        <button class="sp-nav-pill ${isTax ? 'active' : ''}" data-screen="tax-lab" ${isTax ? 'aria-current="page"' : ''}>
          ${renderIcon('tax')}
          <span>Tax Lab</span>
        </button>
        <button class="sp-nav-pill ${isInvest ? 'active' : ''}" data-screen="invest-sim" ${isInvest ? 'aria-current="page"' : ''}>
          ${renderIcon('invest')}
          <span>Invest Lab</span>
        </button>
        <button class="sp-nav-pill ${isDebt ? 'active' : ''}" data-screen="portfolio" ${isDebt ? 'aria-current="page"' : ''}>
          ${renderIcon('briefcase')}
          <span>Debt Map</span>
        </button>
        <button class="sp-nav-pill ${isChallenges ? 'active' : ''}" data-screen="learning-progress" ${isChallenges ? 'aria-current="page"' : ''}>
          ${renderIcon('challenges')}
          <span>Challenges</span>
        </button>
      </nav>

      <div class="sp-top-right">
        <button class="sp-bell-btn" data-screen="learning-progress" aria-label="การแจ้งเตือน">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="sp-bell-dot"></span>
        </button>
        <button class="sp-profile-btn" data-screen="data" aria-label="โปรไฟล์ผู้เรียน">
          <div class="sp-profile-avatar">
            <svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" fill="#00A3FF"/><circle cx="18" cy="15" r="7" fill="#FBF5E6"/><path d="M8 32 C8 25 13 23 18 23 C23 23 28 25 28 32" fill="#FBF5E6"/></svg>
          </div>
          <span class="sp-profile-name">Martin</span>
        </button>
      </div>
    </div>
  </header>`;
}

const NAV_ITEMS = [
  ['home', 'home', 'dashboard', 'Dashboard', 'ภาพรวม'],
  ['learn', 'learn', 'courses', 'Courses', 'หลักสูตร'],
  ['tax-lab', 'tax-lab', 'tax', 'Tax Lab', 'ภาษี'],
  ['invest-sim', 'invest-sim', 'invest', 'Invest Sim', 'ลงทุน'],
  ['portfolio', 'portfolio', 'briefcase', 'Debt Map', 'หนี้สิน'],
  ['learning-progress', 'learning-progress', 'challenges', 'Challenges', 'ภารกิจ']
];

const LEARNING_SCREENS = new Set([
  'learn', 'course', 'course-lesson', 'course-quiz', 'lesson',
  'lesson-reflection', 'tax-lab', 'invest-sim'
]);

export function renderBottomNav({ screen: currentScreen, consent }) {
  return `<nav class="sp-dock-nav" aria-label="แถบเมนูหลัก">
    <button class="sp-dock-item ${currentScreen === 'home' ? 'active' : ''}" data-screen="home" aria-label="Dashboard" title="Dashboard">
      ${renderIcon('dashboard')}
    </button>
    <button class="sp-dock-item ${LEARNING_SCREENS.has(currentScreen) ? 'active' : ''}" data-screen="learn" aria-label="Courses" title="Courses">
      ${renderIcon('courses')}
    </button>
    <button class="sp-dock-item ${currentScreen === 'learning-progress' ? 'active' : ''}" data-screen="learning-progress" aria-label="Challenges" title="Challenges">
      ${renderIcon('challenges')}
    </button>
    <button class="sp-dock-item ${['portfolio', 'debt-editor', 'payoff'].includes(currentScreen) ? 'active' : ''}" data-screen="${consent ? 'portfolio' : 'consent'}" aria-label="Debt Map" title="Debt Map">
      ${renderIcon('briefcase')}
    </button>
    <button class="sp-dock-item ${currentScreen === 'data' ? 'active' : ''}" data-screen="data" aria-label="Profile" title="Profile">
      ${renderIcon('settings')}
    </button>
  </nav>`;
}

export function renderSalaryBuckets({ needs = 55, goals = 25, flexible = 20 } = {}) {
  return `<div class="salary-buckets" aria-label="ตัวอย่างการแบ่งเงินเดือน: ค่าใช้จำเป็น ${needs} เปอร์เซ็นต์ เป้าหมาย ${goals} เปอร์เซ็นต์ และเงินยืดหยุ่น ${flexible} เปอร์เซ็นต์"><span class="salary-label">ภาพรวมที่กำลังเรียน</span><div class="bucket-bar"><i class="needs" style="width:${needs}%">${needs}%</i><i class="goals" style="width:${goals}%">${goals}%</i><i class="flex" style="width:${flexible}%">${flexible}%</i></div><div class="bucket-key"><span><b></b>จำเป็น</span><span><b></b>เป้าหมาย</span><span><b></b>ยืดหยุ่น</span></div></div>`;
}

export function renderErrorPanel({ message, destination = 'intake-money' }) {
  return `<section class="error-panel" role="alert"><span>!</span><h1>ข้อมูลยังไม่พร้อม</h1><p>${escapeHtml(message)}</p><button class="primary" data-screen="${escapeHtml(destination)}">กลับไปตรวจข้อมูล <span>→</span></button></section>`;
}

