import { CURRICULUM_UNITS, PASSING_SCORE, isUnitUnlocked, unitById } from './curriculum.js';

export const ACADEMY_SCHEMA_VERSION = 9;
export const CANONICAL_ACADEMY_SCREENS = Object.freeze([
  'course-lesson',
  'course-quiz',
  'lesson-reflection',
  'course-action',
  'learning-progress'
]);

const canonicalScreens = new Set(CANONICAL_ACADEMY_SCREENS);
const actionStates = new Set(['not_started', 'planned', 'skipped', 'evidence_recorded']);
const reflectionStates = new Set(['draft', 'saved', 'skipped']);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const safeInteger = (value, fallback = 0) => Number.isFinite(Number(value))
  ? Math.max(0, Math.floor(Number(value)))
  : fallback;

export function normalizeCurriculumRecord(record, passingScore = PASSING_SCORE) {
  const source = isRecord(record) ? record : {};
  const bestScore = safeInteger(source.bestScore);
  const step = safeInteger(source.step);
  const passed = bestScore >= passingScore;
  const status = passed ? 'completed' : step > 0 || source.status === 'in_progress' ? 'in_progress' : 'not_started';
  return { ...source, status, step, bestScore };
}

export function normalizeLearningAction(record) {
  const source = isRecord(record) ? record : {};
  const status = actionStates.has(source.status) ? source.status : 'not_started';
  return { ...source, status, note: typeof source.note === 'string' ? source.note : '' };
}

export function normalizeLessonReflection(record) {
  const source = isRecord(record) ? record : {};
  let status = reflectionStates.has(source.status) ? source.status : 'draft';
  const takeaway = typeof source.takeaway === 'string' ? source.takeaway : '';
  const nextAction = typeof source.nextAction === 'string' ? source.nextAction : '';
  if (!source.status && (takeaway.trim() || nextAction.trim())) status = 'saved';
  return { ...source, status, takeaway, nextAction };
}

const reflectionFinished = (record) => ['saved', 'skipped'].includes(normalizeLessonReflection(record).status);
const actionFinished = (record) => ['planned', 'skipped', 'evidence_recorded'].includes(normalizeLearningAction(record).status);

function firstUnlockedUnpassed(state, afterUnit = null) {
  const progress = state.curriculumProgress || {};
  const candidates = CURRICULUM_UNITS.filter((unit) => isUnitUnlocked(unit, progress)
    && normalizeCurriculumRecord(progress[unit.id]).bestScore < PASSING_SCORE);
  if (!candidates.length) return null;
  if (afterUnit) {
    const sameCourseNext = candidates.find((unit) => unit.course === afterUnit.course && unit.level > afterUnit.level);
    if (sameCourseNext) return sameCourseNext;
  }
  const selectedCourse = typeof state.selectedCourse === 'string' ? state.selectedCourse : '';
  return candidates.find((unit) => unit.course === selectedCourse) || candidates[0];
}

export function resolveAcademyResume(state) {
  const source = isRecord(state) ? state : {};
  const progress = isRecord(source.curriculumProgress) ? source.curriculumProgress : {};
  const reflections = isRecord(source.lessonReflections) ? source.lessonReflections : {};
  const actions = isRecord(source.learningActions) ? source.learningActions : {};
  const preferred = isRecord(source.learningResume) && source.learningResume.kind === 'canonical'
    ? source.learningResume
    : null;
  let unit = unitById(preferred?.unitId) || unitById(source.currentUnitId);
  if (unit && !isUnitUnlocked(unit, progress)) unit = null;
  if (!unit) unit = firstUnlockedUnpassed({ ...source, curriculumProgress: progress });
  if (!unit) return { kind: 'canonical', screen: 'learning-progress' };

  const record = normalizeCurriculumRecord(progress[unit.id]);
  if (record.bestScore >= PASSING_SCORE) {
    if (!reflectionFinished(reflections[unit.id])) {
      return { kind: 'canonical', unitId: unit.id, screen: 'lesson-reflection', step: unit.steps.length };
    }
    if (!actionFinished(actions[unit.id])) {
      return { kind: 'canonical', unitId: unit.id, screen: 'course-action', step: unit.steps.length };
    }
    const next = firstUnlockedUnpassed({ ...source, curriculumProgress: progress }, unit);
    return next
      ? { kind: 'canonical', unitId: next.id, screen: 'course-lesson', step: Math.min(normalizeCurriculumRecord(progress[next.id]).step, Math.max(0, next.steps.length - 1)) }
      : { kind: 'canonical', unitId: unit.id, screen: 'learning-progress', step: unit.steps.length };
  }

  const requestedScreen = canonicalScreens.has(preferred?.screen) ? preferred.screen : source.screen;
  const quizReady = record.step >= unit.steps.length;
  if (requestedScreen === 'course-quiz' && quizReady) {
    return { kind: 'canonical', unitId: unit.id, screen: 'course-quiz', step: unit.steps.length };
  }
  return {
    kind: 'canonical',
    unitId: unit.id,
    screen: 'course-lesson',
    step: Math.min(safeInteger(preferred?.step, record.step), Math.max(0, unit.steps.length - 1))
  };
}

export function migrateAcademyStateV9(savedState) {
  const source = isRecord(savedState) ? savedState : {};
  const priorVersion = safeInteger(source.schemaVersion, 1);
  const curriculumProgress = Object.fromEntries(Object.entries(isRecord(source.curriculumProgress) ? source.curriculumProgress : {}).map(([id, record]) => [
    id,
    unitById(id) ? normalizeCurriculumRecord(record) : record
  ]));
  const lessonReflections = Object.fromEntries(Object.entries(isRecord(source.lessonReflections) ? source.lessonReflections : {}).map(([id, record]) => [id, normalizeLessonReflection(record)]));
  const learningActions = Object.fromEntries(Object.entries(isRecord(source.learningActions) ? source.learningActions : {}).map(([id, record]) => [id, normalizeLearningAction(record)]));
  const legacyLessonProgress = { ...(isRecord(source.legacyLessonProgress) ? source.legacyLessonProgress : {}) };
  for (const [id, mastery] of Object.entries(isRecord(source.mastery) ? source.mastery : {})) {
    if (!isRecord(legacyLessonProgress[id])) {
      legacyLessonProgress[id] = {
        mastery,
        evidence: source.currentLesson === id && typeof source.lessonEvidence === 'string' ? source.lessonEvidence : ''
      };
    }
  }

  const migrated = {
    ...source,
    schemaVersion: ACADEMY_SCHEMA_VERSION,
    curriculumProgress,
    lessonReflections,
    learningActions,
    legacyLessonProgress
  };
  const hasLegacyEvidence = typeof source.currentLesson === 'string'
    && (source.mastery?.[source.currentLesson] && source.mastery[source.currentLesson] !== 'not_started'
      || typeof source.lessonEvidence === 'string' && source.lessonEvidence.trim());
  const resumeSource = priorVersion >= ACADEMY_SCHEMA_VERSION ? migrated : { ...migrated, learningResume: null };
  migrated.learningResume = source.screen === 'lesson' && hasLegacyEvidence
    ? { kind: 'legacy', screen: 'lesson', legacyLessonId: source.currentLesson }
    : resolveAcademyResume(resumeSource);
  return migrated;
}

export function academyResumeLabel(resume, unit) {
  if (!resume || resume.screen === 'learning-progress') return 'ดูความก้าวหน้า';
  if (resume.screen === 'course-quiz') return 'ทำ Quiz ต่อ';
  if (resume.screen === 'lesson-reflection') return 'สรุปบทเรียนต่อ';
  if (resume.screen === 'course-action') return 'วาง action ต่อ';
  return unit ? 'เรียนต่อจากจุดเดิม' : 'เริ่มบทเรียนแรก';
}
