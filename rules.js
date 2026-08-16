export const RULES_VERSION = 'payday-compass-th/1.0.0';
export const AMOUNT_CAP = 999_999_999_999n;
export const SIGNED_64_MAX = 9_223_372_036_854_775_807n;
export const DISCLAIMER = 'ผลลัพธ์เป็นเพียงประมาณการจากข้อมูลที่คุณกรอก ไม่ใช่คำแนะนำทางการเงิน กฎหมาย หรือสินเชื่อที่อยู่ภายใต้การกำกับ';

export class RulesError extends Error { constructor(code, message) { super(message); this.code = code; } }

function money(value, name) {
  if (typeof value !== 'bigint') throw new RulesError('AMOUNT_MUST_BE_INTEGER_SATANG', `${name} ต้องเป็นจำนวนสตางค์แบบจำนวนเต็ม`);
  if (value < 0n || value > AMOUNT_CAP) throw new RulesError('AMOUNT_OUT_OF_RANGE', `${name} ต้องอยู่ระหว่าง 0 ถึง 9,999,999,999.99 บาท`);
  return value;
}
function dateOnly(value, name) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00+07:00`))) throw new RulesError('INVALID_DATE', `${name} ไม่ถูกต้อง`);
  const [year, month, day] = value.split('-').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) throw new RulesError('INVALID_DATE', `${name} ไม่ถูกต้อง`);
  return value;
}
export function checkedAdd(left, right) {
  const result = left + right;
  if (result > SIGNED_64_MAX) throw new RulesError('AMOUNT_OVERFLOW', 'ยอดรวมเกินขอบเขตที่ระบบรองรับ');
  return result;
}
function dayDifference(from, to) { return BigInt(Math.round((Date.parse(`${to}T00:00:00+07:00`) - Date.parse(`${from}T00:00:00+07:00`)) / 86_400_000)); }
function sum(items, field, asOf, payday, kind) {
  if (!Array.isArray(items)) throw new RulesError('REQUIRED_FIELD_MISSING', `${kind} ต้องเป็นรายการ`);
  const seen = new Set(); let total = 0n; const includedIds = [], excludedIds = [];
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id)) throw new RulesError('DUPLICATE_OR_INVALID_ITEM_ID', 'รหัสรายการต้องไม่ซ้ำกัน');
    seen.add(item.id); money(item[field], `${kind} amount`); const due = dateOnly(item.due_date, `${kind} due date`);
    if (item.unpaid !== true || item.source !== 'self_report') throw new RulesError('INVALID_ITEM_SOURCE', 'รายการต้องเป็นข้อมูลที่คุณกรอกและยังไม่ได้จ่าย');
    if (due < asOf) throw new RulesError('DUE_DATE_BEFORE_AS_OF', 'วันครบกำหนดต้องไม่ก่อนวันนี้');
    if (due <= payday) { total = checkedAdd(total, item[field]); includedIds.push(item.id); } else excludedIds.push(item.id);
  }
  return { total, includedIds, excludedIds };
}

export function calculate(input) {
  if (!input || typeof input !== 'object') throw new RulesError('REQUIRED_FIELD_MISSING', 'ยังไม่มีข้อมูลแผน');
  const asOf = dateOnly(input.as_of_date, 'วันที่คำนวณ'); const payday = dateOnly(input.next_payday_date, 'วันเงินเดือนออก');
  if (typeof input.salary_arrived_today !== 'boolean' || typeof input.self_reported_unable_to_meet_commitments !== 'boolean') throw new RulesError('REQUIRED_FIELD_MISSING', 'กรุณาเลือกคำตอบให้ครบ');
  const remainingDays = dayDifference(asOf, payday);
  if (remainingDays < 0n) throw new RulesError('PAYDAY_IN_PAST', 'วันเงินเดือนออกต้องไม่ก่อนวันนี้');
  if (remainingDays === 0n && input.salary_arrived_today) throw new RulesError('NEXT_PAYDAY_NOT_FUTURE_AFTER_ARRIVAL', 'เมื่อรวมเงินเดือนวันนี้แล้ว ให้เลือกวันเงินเดือนออกครั้งถัดไป');
  const cash = money(input.available_cash_satang, 'เงินที่ใช้ได้');
  const current = money(input.current_buffer_satang, 'เงินสำรองปัจจุบัน');
  const target = money(input.protected_buffer_target_satang, 'เป้าหมายเงินสำรอง');
  const chosen = money(input.chosen_buffer_contribution_satang, 'ยอดกันเงิน');
  const baseline = money(input.variable_spend_baseline_satang_per_day, 'ค่าใช้จ่ายต่อวัน');
  const essential = sum(input.essential_commitments, 'amount_satang', asOf, payday, 'ภาระจำเป็น');
  const debts = sum(input.debt_minimums, 'minimum_satang', asOf, payday, 'ยอดขั้นต่ำหนี้');
  const committed = checkedAdd(essential.total, debts.total);
  const free = cash - committed;
  const gap = target > current ? target - current : 0n;
  const max = free <= 0n ? 0n : (gap < free ? gap : free);
  if (chosen > max) throw new RulesError('CHOSEN_CONTRIBUTION_EXCEEDS_MAX', 'ยอดที่เลือกมากกว่ายอดที่กันได้สูงสุด');
  const safe = free - chosen;
  const daily = remainingDays > 0n ? safe / remainingDays : null;
  const bufferDays = baseline > 0n ? current / baseline : null;
  const safety_state = input.self_reported_unable_to_meet_commitments || free < 0n ? 'support_route' : (safe === 0n || (remainingDays > 0n && baseline > 0n && daily < baseline) ? 'tight' : 'normal');
  return { rules_version: RULES_VERSION, remaining_days: remainingDays, committed_satang: committed, free_after_commitments_satang: free, buffer_gap_satang: gap, max_buffer_contribution_satang: max, safe_to_spend_satang: safe, daily_safe_to_spend_satang: daily, buffer_days: bufferDays, safety_state, included_item_ids: [...essential.includedIds, ...debts.includedIds], excluded_after_payday_ids: [...essential.excludedIds, ...debts.excludedIds], disclaimer: DISCLAIMER, input_source_summary: 'self_report' };
}

export function parseBaht(text) {
  const match = String(text ?? '').trim().replaceAll(',', '').match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new RulesError('AMOUNT_MUST_BE_INTEGER_SATANG', 'กรอกจำนวนเงินเป็นตัวเลขเต็มตั้งแต่ 0 ถึง 9,999,999,999.99 บาท');
  const value = BigInt(match[1]) * 100n + BigInt((match[2] || '').padEnd(2, '0'));
  return money(value, 'จำนวนเงิน');
}
export function formatBaht(value) { if (value === null) return '—'; const sign = value < 0n ? '-' : ''; const absolute = value < 0n ? -value : value; return `${sign}฿${(absolute / 100n).toLocaleString('th-TH')}.${String(absolute % 100n).padStart(2, '0')}`; }
