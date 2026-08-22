// Phase 6 pilot data is deliberately separate from the learner's finance data.
// This module accepts only bounded research fields so an export can never include
// salary, debt, portfolio, free-text reflection, account identifiers, or email.
export const PILOT_SCHEMA_VERSION = 1;
export const PILOT_TASK_IDS = Object.freeze(['resume_lesson', 'finish_explain', 'use_lab', 'identify_action', 'recover_missing']);
export const PILOT_TASKS = Object.freeze([
  { id: 'resume_lesson', title: 'กลับมาเรียนบทที่ค้าง', prompt: 'กลับไปยังบทเรียนที่ค้างและเปิดช่วงที่ต้องเรียนต่อ' },
  { id: 'finish_explain', title: 'จบบทและอธิบายสิ่งที่เรียน', prompt: 'ทำบทเรียนหนึ่งระดับให้จบ แล้วอธิบายแนวคิดหลักแก่ผู้ดำเนินการทดสอบ' },
  { id: 'use_lab', title: 'ใช้ Lab และอ่านผล', prompt: 'ใช้ Tax, Investment หรือ Debt Lab ด้วยข้อมูลสมมติ แล้วบอกว่าผลลัพธ์หมายความว่าอะไร' },
  { id: 'identify_action', title: 'ระบุ action ถัดไป', prompt: 'เลือกงานจริงหนึ่งอย่างหลังเรียนและบันทึก action' },
  { id: 'recover_missing', title: 'กลับไปแก้ข้อมูลที่ขาด', prompt: 'จากหน้าผลที่แจ้งว่าข้อมูลขาด ให้กดกลับไปยังช่องที่ต้องเติม' }
]);

export const TASK_STATUS = new Set(['not_started', 'started', 'completed', 'blocked']);
export const TASK_OUTCOMES = new Set(['completed_without_help', 'completed_with_help', 'blocked']);
export const COMPREHENSION = new Set(['clear', 'unclear']);
export const ISSUE_TAGS = new Set(['navigation', 'wording', 'visual_hierarchy', 'input', 'result_interpretation', 'accessibility', 'performance', 'other']);
export const EVIDENCE_BY_TASK = Object.freeze({
  resume_lesson: new Set(['lesson_opened']),
  finish_explain: new Set(['quiz_passed', 'reflection_opened', 'reflection_saved']),
  use_lab: new Set(['lab_calculated', 'lab_advanced', 'route_created']),
  identify_action: new Set(['next_action_saved']),
  recover_missing: new Set(['fill_missing'])
});

const iso = (now = new Date()) => now instanceof Date ? now.toISOString() : new Date(now).toISOString();
const dateOnly = (now = new Date()) => iso(now).slice(0, 10);
const safeCode = (value) => typeof value === 'string' && /^[A-Z2-9]{6,20}$/.test(value) ? value : '';
const cleanTags = (tags) => [...new Set((Array.isArray(tags) ? tags : []).filter((tag) => ISSUE_TAGS.has(tag)))];
const emptyTask = () => ({ status: 'not_started', started_at: null, completed_at: null, elapsed_seconds: null, help_count: 0, outcome: null, ease: null, comprehension: null, issue_tags: [], critical_safety: false, evidence: [] });
const onlyKeys = (value, keys) => Object.keys(value || {}).every((key) => keys.has(key));

export function createParticipantCode(random = Math.random) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
}

export function createPilotSession({ participantCode = createParticipantCode(), consentConfirmed = false, now = new Date() } = {}) {
  return {
    schema_version: PILOT_SCHEMA_VERSION,
    participant_code: safeCode(participantCode) || createParticipantCode(),
    consent_confirmed: consentConfirmed === true,
    started_at: iso(now),
    finished_at: null,
    tasks: Object.fromEntries(PILOT_TASK_IDS.map((id) => [id, emptyTask()]))
  };
}

export function normalizePilotSession(value) {
  if (!value || typeof value !== 'object' || !safeCode(value.participant_code)) return null;
  const session = createPilotSession({ participantCode: value.participant_code, consentConfirmed: value.consent_confirmed === true, now: value.started_at || new Date() });
  session.finished_at = typeof value.finished_at === 'string' ? value.finished_at : null;
  for (const id of PILOT_TASK_IDS) {
    const source = value.tasks?.[id] || {};
    const task = emptyTask();
    task.status = TASK_STATUS.has(source.status) ? source.status : 'not_started';
    task.started_at = typeof source.started_at === 'string' ? source.started_at : null;
    task.completed_at = typeof source.completed_at === 'string' ? source.completed_at : null;
    task.elapsed_seconds = Number.isInteger(source.elapsed_seconds) && source.elapsed_seconds >= 0 && source.elapsed_seconds <= 7200 ? source.elapsed_seconds : null;
    task.help_count = Number.isInteger(source.help_count) && source.help_count >= 0 && source.help_count <= 20 ? source.help_count : 0;
    task.outcome = TASK_OUTCOMES.has(source.outcome) ? source.outcome : null;
    task.ease = Number.isInteger(source.ease) && source.ease >= 1 && source.ease <= 7 ? source.ease : null;
    task.comprehension = COMPREHENSION.has(source.comprehension) ? source.comprehension : null;
    task.issue_tags = cleanTags(source.issue_tags);
    task.critical_safety = source.critical_safety === true;
    task.evidence = (Array.isArray(source.evidence) ? source.evidence : []).filter((event) => EVIDENCE_BY_TASK[id].has(event?.name) && typeof event.at === 'string').slice(-20).map((event) => ({ name: event.name, at: event.at }));
    session.tasks[id] = task;
  }
  return session;
}

export function startPilotTask(session, id, now = new Date()) {
  const next = normalizePilotSession(session);
  if (!next?.consent_confirmed || !PILOT_TASK_IDS.includes(id)) return next;
  const task = next.tasks[id];
  if (task.status === 'not_started') {
    task.status = 'started';
    task.started_at = iso(now);
  }
  return next;
}

export function addPilotEvidence(session, id, name, now = new Date()) {
  const next = normalizePilotSession(session);
  if (!next || !PILOT_TASK_IDS.includes(id) || !EVIDENCE_BY_TASK[id].has(name)) return next;
  const task = next.tasks[id];
  if (task.status !== 'started') return next;
  if (!task.evidence.some((event) => event.name === name)) task.evidence.push({ name, at: iso(now) });
  return next;
}

export function scorePilotTask(session, id, values = {}, now = new Date()) {
  const next = normalizePilotSession(session);
  if (!next || !PILOT_TASK_IDS.includes(id)) return next;
  const task = next.tasks[id];
  if (task.status === 'not_started') return next;
  const outcome = TASK_OUTCOMES.has(values.outcome) ? values.outcome : null;
  const ease = Number(values.ease);
  const helpCount = Number(values.help_count);
  const comprehension = COMPREHENSION.has(values.comprehension) ? values.comprehension : null;
  if (!outcome || !Number.isInteger(ease) || ease < 1 || ease > 7 || !Number.isInteger(helpCount) || helpCount < 0 || helpCount > 20 || (id === 'finish_explain' && !comprehension)) return next;
  task.outcome = outcome;
  task.status = outcome === 'blocked' ? 'blocked' : 'completed';
  task.ease = ease;
  task.help_count = helpCount;
  task.comprehension = id === 'finish_explain' ? comprehension : null;
  task.issue_tags = cleanTags(values.issue_tags);
  task.critical_safety = values.critical_safety === true;
  task.completed_at = iso(now);
  task.elapsed_seconds = Math.max(0, Math.min(7200, Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)));
  return next;
}

export function finishPilotSession(session, now = new Date()) {
  const next = normalizePilotSession(session);
  if (!next?.consent_confirmed) return next;
  const allRated = PILOT_TASK_IDS.every((id) => ['completed', 'blocked'].includes(next.tasks[id].status) && next.tasks[id].outcome && next.tasks[id].ease);
  if (allRated) next.finished_at = iso(now);
  return next;
}

export function pilotTaskIsStarted(session, id) {
  const normalized = normalizePilotSession(session);
  return normalized?.tasks?.[id]?.status === 'started';
}

export function buildPilotExport(session, exportedAt = new Date()) {
  const normalized = normalizePilotSession(session);
  if (!normalized?.consent_confirmed) return null;
  return {
    kind: 'first-jobber-money-lab-phase6-pilot',
    schema_version: PILOT_SCHEMA_VERSION,
    exported_on: dateOnly(exportedAt),
    participant_code: normalized.participant_code,
    consent_confirmed: true,
    tasks: Object.fromEntries(PILOT_TASK_IDS.map((id) => {
      const task = normalized.tasks[id];
      return [id, { status: task.status, outcome: task.outcome, elapsed_seconds: task.elapsed_seconds, help_count: task.help_count, ease: task.ease, comprehension: task.comprehension, issue_tags: task.issue_tags, critical_safety: task.critical_safety, evidence: task.evidence.map((event) => event.name) }];
    }))
  };
}

export function validatePilotExport(value) {
  if (!value || value.kind !== 'first-jobber-money-lab-phase6-pilot' || value.schema_version !== PILOT_SCHEMA_VERSION) return { ok: false, reason: 'invalid schema' };
  if (!onlyKeys(value, new Set(['kind', 'schema_version', 'exported_on', 'participant_code', 'consent_confirmed', 'tasks']))) return { ok: false, reason: 'unsafe extra field' };
  if (!safeCode(value.participant_code) || !/^\d{4}-\d{2}-\d{2}$/.test(value.exported_on || '') || value.consent_confirmed !== true) return { ok: false, reason: 'incomplete session' };
  if (!onlyKeys(value.tasks, new Set(PILOT_TASK_IDS))) return { ok: false, reason: 'unsafe task field' };
  const tasks = {};
  for (const id of PILOT_TASK_IDS) {
    const source = value.tasks?.[id];
    if (!onlyKeys(source, new Set(['status', 'outcome', 'elapsed_seconds', 'help_count', 'ease', 'comprehension', 'issue_tags', 'critical_safety', 'evidence']))) return { ok: false, reason: `unsafe extra field in ${id}` };
    const outcome = TASK_OUTCOMES.has(source?.outcome) ? source.outcome : null;
    const expectedStatus = outcome === 'blocked' ? 'blocked' : 'completed';
    const elapsed = Number(source?.elapsed_seconds);
    const help = Number(source?.help_count);
    const ease = Number(source?.ease);
    const comprehension = COMPREHENSION.has(source?.comprehension) ? source.comprehension : null;
    const evidence = Array.isArray(source?.evidence) ? [...new Set(source.evidence)] : null;
    if (!outcome || source.status !== expectedStatus || !Number.isInteger(elapsed) || elapsed < 0 || elapsed > 7200 || !Number.isInteger(help) || help < 0 || help > 20 || !Number.isInteger(ease) || ease < 1 || ease > 7) return { ok: false, reason: `incomplete ${id}` };
    if (id === 'finish_explain' && !comprehension) return { ok: false, reason: `incomplete ${id}` };
    if (!Array.isArray(evidence) || evidence.some((name) => typeof name !== 'string' || !EVIDENCE_BY_TASK[id].has(name))) return { ok: false, reason: `unsafe evidence in ${id}` };
    if (!Array.isArray(source.issue_tags) || source.issue_tags.some((tag) => !ISSUE_TAGS.has(tag)) || typeof source.critical_safety !== 'boolean') return { ok: false, reason: `unsafe rating in ${id}` };
    tasks[id] = { status: source.status, outcome, elapsed_seconds: elapsed, help_count: help, ease, comprehension: id === 'finish_explain' ? comprehension : null, issue_tags: cleanTags(source.issue_tags), critical_safety: source.critical_safety, evidence };
  }
  return { ok: true, value: { kind: value.kind, schema_version: value.schema_version, exported_on: value.exported_on, participant_code: value.participant_code, consent_confirmed: true, tasks } };
}
