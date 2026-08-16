// Phase A: deterministic routing only.  It does not assess creditworthiness,
// negotiate with a creditor, or promise acceptance into any programme.
export const DEBT_ENGINE_VERSION = 'first-jobber-debt-navigator/1.1.0';
export const SATANG_MAX = 9_223_372_036_854_775_807n;

export const ROUTES = Object.freeze({
  ENFORCEMENT_MEDIATION: 'enforcement_mediation',
  SUMMONS_MEDIATION: 'summons_mediation',
  CREDIT_DATA_DISPUTE: 'credit_data_dispute',
  DEBT_CLINIC_CHECK: 'debt_clinic_check',
  CLEAR_DEBT_CHECK: 'clear_debt_check',
  DIRECT_RESTRUCTURING: 'direct_restructuring',
  PREVENTION: 'prevention'
});

const LEGAL_STAGES = new Set(['none', 'collection_only', 'summons', 'judgment', 'enforcement', 'unknown']);
const OVERDUE_BANDS = new Set(['0', '1_89', '90_119', '120_plus', 'unknown']);
const UNSECURED_TYPES = new Set(['credit_card', 'cash_card', 'unsecured_personal_loan']);

export class DebtEngineError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function has(input, key) { return Object.prototype.hasOwnProperty.call(input, key) && input[key] !== null && input[key] !== undefined; }
function missing(input, fields) { return fields.filter((field) => !has(input, field)); }
function validEnum(input, key, values) {
  if (!has(input, key)) return false;
  if (!values.has(input[key])) throw new DebtEngineError('INVALID_ENUM', `${key} ไม่ถูกต้อง`);
  return true;
}
function satang(input, key) {
  if (!has(input, key)) return null;
  const value = input[key];
  if (typeof value !== 'bigint' || value < 0n || value > SATANG_MAX) {
    throw new DebtEngineError('AMOUNT_MUST_BE_NONNEGATIVE_INTEGER_SATANG', `${key} ต้องเป็นจำนวนสตางค์จำนวนเต็มที่ไม่ติดลบ`);
  }
  return value;
}
function booleanIfPresent(input, key) {
  if (has(input, key) && typeof input[key] !== 'boolean') throw new DebtEngineError('INVALID_BOOLEAN', `${key} ต้องเป็น true หรือ false`);
}
function ageIfPresent(input) {
  if (has(input, 'age_years') && (!Number.isInteger(input.age_years) || input.age_years < 0 || input.age_years > 130)) throw new DebtEngineError('INVALID_AGE', 'age_years ไม่ถูกต้อง');
}
function positiveIncome(input) { const value = satang(input, 'monthly_take_home_satang'); return value !== null && value > 0n; }
function validateDebtTypes(input) {
  if (!has(input, 'debt_types')) return;
  if (!Array.isArray(input.debt_types) || input.debt_types.length === 0 || !input.debt_types.every((type) => typeof type === 'string')) {
    throw new DebtEngineError('INVALID_DEBT_TYPES', 'debt_types ต้องเป็นรายการประเภทหนี้ที่ไม่ว่าง');
  }
}
function hasUnsecuredOnly(input) {
  if (input.debt_types_complete !== true) return false;
  return input.debt_types.every((type) => UNSECURED_TYPES.has(type));
}
function actionPack(route) {
  return ({
    [ROUTES.ENFORCEMENT_MEDIATION]: 'led_post_judgment_mediation_v1',
    [ROUTES.SUMMONS_MEDIATION]: 'court_summons_response_v1',
    [ROUTES.CREDIT_DATA_DISPUTE]: 'credit_data_correction_v1',
    [ROUTES.DEBT_CLINIC_CHECK]: 'debt_clinic_sam_check_v1',
    [ROUTES.CLEAR_DEBT_CHECK]: 'clear_debt_sam_check_v1',
    [ROUTES.DIRECT_RESTRUCTURING]: 'creditor_restructuring_v1',
    [ROUTES.PREVENTION]: 'before_overdue_creditor_contact_v1'
  })[route];
}

function result(route, reasons, missingFields = [], safetyFlags = []) {
  return Object.freeze({
    engine_version: DEBT_ENGINE_VERSION,
    route,
    reasons: Object.freeze(reasons),
    missing_fields: Object.freeze([...new Set(missingFields)]),
    action_pack_id: actionPack(route),
    safety_flags: Object.freeze([...new Set(safetyFlags)]),
    disclaimer: 'ผลลัพธ์เป็นการคัดกรองจากข้อมูลที่กรอก ไม่ใช่คำแนะนำทางกฎหมาย การเงิน หรือคำรับรองการอนุมัติ/ยุติหนี้'
  });
}

/**
 * Routes a self-reported debt situation. Monetary fields are BigInt satang.
 * Unknown eligibility facts intentionally stay in missing_fields; they never
 * become an implied "yes".
 */
export function routeDebt(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new DebtEngineError('INPUT_MUST_BE_OBJECT', 'ข้อมูลคัดกรองต้องเป็น object');
  validEnum(input, 'legal_stage', LEGAL_STAGES);
  validEnum(input, 'overdue_band', OVERDUE_BANDS);
  ['credit_data_disputed', 'identity_misuse_suspected', 'bankrupt', 'aml_sanctioned', 'npl_on_2025_09_30', 'clear_debt_creditor_in_scope', 'self_reported_unable_to_pay', 'debt_types_complete'].forEach((key) => booleanIfPresent(input, key));
  validateDebtTypes(input);
  ageIfPresent(input);
  const totalDebt = satang(input, 'total_debt_satang');
  const takeHome = satang(input, 'monthly_take_home_satang');
  const essentials = satang(input, 'essential_living_costs_satang');
  const cashBeforeDebt = takeHome !== null && essentials !== null ? takeHome - essentials : null;
  const sharedMissing = missing(input, ['overdue_band', 'legal_stage', 'debt_types', 'total_debt_satang', 'monthly_take_home_satang', 'essential_living_costs_satang']);
  const cashFlag = cashBeforeDebt !== null && cashBeforeDebt < 0n ? ['negative_cash_before_debt'] : [];

  // Legal status always wins: programme eligibility must never hide a deadline.
  if (input.legal_stage === 'judgment' || input.legal_stage === 'enforcement') {
    return result(ROUTES.ENFORCEMENT_MEDIATION, ['legal_stage_requires_post_judgment_route'], missing(input, ['legal_document_date', 'proposed_affordable_payment_satang']), ['legal_deadline_review', ...cashFlag]);
  }
  if (input.legal_stage === 'summons') {
    return result(ROUTES.SUMMONS_MEDIATION, ['court_summons_requires_immediate_response'], missing(input, ['hearing_date', 'proposed_affordable_payment_satang']), ['legal_deadline_review', ...cashFlag]);
  }
  if (input.credit_data_disputed === true || input.identity_misuse_suspected === true) {
    return result(ROUTES.CREDIT_DATA_DISPUTE, ['credit_data_or_identity_dispute_reported'], missing(input, ['creditor_name', 'disputed_account_reference', 'evidence_available']), ['do_not_use_credit_repair_intermediary']);
  }

  // Debt Clinic: every eligibility input must be explicitly known and true.
  const debtClinicFields = ['overdue_band', 'debt_types', 'debt_types_complete', 'total_debt_satang', 'age_years', 'monthly_take_home_satang', 'bankrupt'];
  if (input.overdue_band === '120_plus') {
    if (missing(input, debtClinicFields).length === 0 && hasUnsecuredOnly(input) && totalDebt <= 200_000_000n && Number.isInteger(input.age_years) && input.age_years >= 0 && input.age_years <= 70 && positiveIncome(input) && input.bankrupt === false) {
      return result(ROUTES.DEBT_CLINIC_CHECK, ['120_plus_overdue_unsecured_debt_within_2m_and_declared_eligibility'], missing(input, ['creditor_name', 'proposed_affordable_payment_satang']), ['official_channel_only']);
    }
    return result(ROUTES.DIRECT_RESTRUCTURING, ['120_plus_overdue_needs_creditor_action_until_debt_clinic_eligibility_is_confirmed'], [...sharedMissing, ...missing(input, debtClinicFields)], ['official_channel_only', ...cashFlag]);
  }

  // Clear Debt requires a historical cut-off and programme-scope facts. Unknown
  // programme facts are intentionally not treated as eligible.
  const clearFields = ['npl_on_2025_09_30', 'total_ncb_npl_satang', 'bankrupt', 'aml_sanctioned', 'legal_stage', 'clear_debt_creditor_in_scope'];
  const clearTotal = satang(input, 'total_ncb_npl_satang');
  if (missing(input, clearFields).length === 0 && input.npl_on_2025_09_30 === true && clearTotal <= 10_000_000n && input.bankrupt === false && input.aml_sanctioned === false && input.legal_stage !== 'judgment' && input.legal_stage !== 'enforcement' && input.clear_debt_creditor_in_scope === true) {
    return result(ROUTES.CLEAR_DEBT_CHECK, ['declared_clear_debt_programme_conditions_met'], missing(input, ['creditor_name', 'proposed_affordable_payment_satang']), ['verify_with_bot_or_sam_only']);
  }
  if (input.npl_on_2025_09_30 === true && clearTotal !== null) {
    return result(ROUTES.DIRECT_RESTRUCTURING, ['clear_debt_programme_not_confirmed_or_not_available'], [...sharedMissing, ...missing(input, clearFields)], ['official_channel_only', ...cashFlag]);
  }

  if (input.overdue_band === '1_89' || input.self_reported_unable_to_pay === true || cashBeforeDebt !== null && cashBeforeDebt < 0n) {
    return result(ROUTES.DIRECT_RESTRUCTURING, ['payment_difficulty_or_early_overdue_reported'], [...sharedMissing, ...missing(input, ['creditor_name', 'account_balance_satang', 'current_monthly_payment_satang', 'next_due_date', 'proposed_affordable_payment_satang'])], cashFlag);
  }

  if (input.overdue_band === '0') {
    return result(ROUTES.PREVENTION, ['no_overdue_reported'], [...sharedMissing, ...missing(input, ['creditor_name', 'account_balance_satang', 'current_monthly_payment_satang', 'next_due_date'])], cashFlag);
  }
  return result(ROUTES.DIRECT_RESTRUCTURING, ['insufficient_or_unknown_status_requires_official_creditor_confirmation'], sharedMissing, ['official_channel_only', ...cashFlag]);
}

export function cashBeforeDebt(input = {}) {
  const income = satang(input, 'monthly_take_home_satang');
  const essentials = satang(input, 'essential_living_costs_satang');
  return income === null || essentials === null ? null : income - essentials;
}
