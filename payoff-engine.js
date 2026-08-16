// Educational payoff comparisons only. Amounts are integer satang and interest
// is rounded up each month so the estimates do not understate charges.
export const PAYOFF_ENGINE_VERSION = 'first-jobber-payoff/1.0.0';
export const DEFAULT_MAX_MONTHS = 1_200;
const MAX_SATANG = 9_223_372_036_854_775_807n;

export class PayoffEngineError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function required(value, key) {
  if (value === null || value === undefined) throw new PayoffEngineError('REQUIRED_FIELD_MISSING', `${key} ต้องระบุ`);
  return value;
}
function amount(value, key, allowZero = true) {
  required(value, key);
  if (typeof value !== 'bigint' || value < 0n || value > MAX_SATANG || (!allowZero && value === 0n)) throw new PayoffEngineError('INVALID_SATANG_AMOUNT', `${key} ต้องเป็นจำนวนสตางค์จำนวนเต็ม${allowZero ? 'ที่ไม่ติดลบ' : 'ที่มากกว่า 0'}`);
  return value;
}
function bps(value, key) {
  required(value, key);
  if (!Number.isInteger(value) || value < 0 || value > 1_000_000) throw new PayoffEngineError('INVALID_APR_BPS', `${key} ต้องเป็น basis points จำนวนเต็มที่ไม่ติดลบ`);
  return value;
}
function ceilDiv(top, bottom) { return (top + bottom - 1n) / bottom; }
function monthlyInterest(balance, aprBps) { return aprBps === 0 ? 0n : ceilDiv(balance * BigInt(aprBps), 120_000n); }

function normalizedDebts(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.debts) || input.debts.length === 0) throw new PayoffEngineError('REQUIRED_FIELD_MISSING', 'debts ต้องมีอย่างน้อยหนึ่งรายการ');
  const ids = new Set();
  return input.debts.map((debt) => {
    if (!debt || typeof debt.id !== 'string' || debt.id.length === 0 || ids.has(debt.id)) throw new PayoffEngineError('INVALID_DEBT_ID', 'debt id ต้องไม่ว่างและไม่ซ้ำ');
    ids.add(debt.id);
    return { id: debt.id, balance_satang: amount(debt.balance_satang, `${debt.id}.balance_satang`), apr_bps: bps(debt.apr_bps, `${debt.id}.apr_bps`), minimum_satang: amount(debt.minimum_satang, `${debt.id}.minimum_satang`, false) };
  });
}
function planInput(input) {
  const debts = normalizedDebts(input);
  const extra = amount(input.extra_payment_satang ?? 0n, 'extra_payment_satang');
  const activeMinimumBudget = debts.filter((debt) => debt.balance_satang > 0n).reduce((sum, debt) => sum + debt.minimum_satang, 0n);
  const monthlyBudget = input.monthly_budget_satang == null
    ? activeMinimumBudget + extra
    : amount(input.monthly_budget_satang, 'monthly_budget_satang');
  const maxMonths = input.max_months ?? DEFAULT_MAX_MONTHS;
  if (!Number.isInteger(maxMonths) || maxMonths < 1 || maxMonths > DEFAULT_MAX_MONTHS) throw new PayoffEngineError('INVALID_MAX_MONTHS', `max_months ต้องอยู่ระหว่าง 1 ถึง ${DEFAULT_MAX_MONTHS}`);
  return { debts, extra, monthlyBudget, activeMinimumBudget, maxMonths };
}
function cloneDebts(debts) { return debts.map((debt, order) => ({ ...debt, order, interest_satang: 0n, paid_satang: 0n, finished_month: null })); }
function selectTarget(active, strategy) {
  const ranked = [...active];
  if (strategy === 'avalanche') ranked.sort((a, b) => b.apr_bps - a.apr_bps || a.order - b.order);
  else if (strategy === 'snowball') ranked.sort((a, b) => a.balance_satang < b.balance_satang ? -1 : a.balance_satang > b.balance_satang ? 1 : a.order - b.order);
  else ranked.sort((a, b) => a.order - b.order);
  return ranked[0];
}

export function simulatePayoff(input, strategy = 'baseline') {
  if (!['baseline', 'avalanche', 'snowball'].includes(strategy)) throw new PayoffEngineError('INVALID_STRATEGY', 'strategy ไม่ถูกต้อง');
  const { debts: sourceDebts, monthlyBudget: totalMonthlyBudget, activeMinimumBudget, maxMonths } = planInput(input);
  const debts = cloneDebts(sourceDebts).filter((debt) => debt.balance_satang > 0n);
  if (debts.length === 0) return finishedResult(debts, strategy, 0, 0n, 0n, totalMonthlyBudget, maxMonths);
  if (totalMonthlyBudget === 0n) return unresolvedResult('insolvent_payment_zero', debts, strategy, totalMonthlyBudget, maxMonths);
  if (totalMonthlyBudget < activeMinimumBudget) return unresolvedResult('monthly_budget_below_declared_minimums', debts, strategy, totalMonthlyBudget, maxMonths);

  for (let month = 1; month <= maxMonths; month += 1) {
    const active = debts.filter((debt) => debt.balance_satang > 0n);
    let monthlyInterestTotal = 0n;
    for (const debt of active) {
      const interest = monthlyInterest(debt.balance_satang, debt.apr_bps);
      debt.balance_satang += interest;
      debt.interest_satang += interest;
      monthlyInterestTotal += interest;
    }
    if (totalMonthlyBudget <= monthlyInterestTotal) return unresolvedResult('non_amortizing_payment', debts, strategy, totalMonthlyBudget, maxMonths, month);

    let remaining = totalMonthlyBudget;
    // Pay each declared minimum first, then distribute any remaining payment by
    // the selected method. A capped payment immediately rolls to the target.
    for (const debt of active) {
      const payment = debt.minimum_satang < debt.balance_satang ? debt.minimum_satang : debt.balance_satang;
      debt.balance_satang -= payment; debt.paid_satang += payment; remaining -= payment;
      if (debt.balance_satang === 0n && debt.finished_month === null) debt.finished_month = month;
    }
    while (remaining > 0n) {
      const target = selectTarget(debts.filter((debt) => debt.balance_satang > 0n), strategy);
      if (!target) break;
      const payment = remaining < target.balance_satang ? remaining : target.balance_satang;
      target.balance_satang -= payment; target.paid_satang += payment; remaining -= payment;
      if (target.balance_satang === 0n && target.finished_month === null) target.finished_month = month;
    }
    if (debts.every((debt) => debt.balance_satang === 0n)) return finishedResult(debts, strategy, month, debts.reduce((sum, debt) => sum + debt.interest_satang, 0n), debts.reduce((sum, debt) => sum + debt.paid_satang, 0n), totalMonthlyBudget, maxMonths);
  }
  return unresolvedResult('max_month_guard_reached', debts, strategy, totalMonthlyBudget, maxMonths, maxMonths);
}

function finishedResult(debts, strategy, monthCount, totalInterest, totalPaid, monthlyBudget, maxMonths) {
  return Object.freeze({ status: 'paid_off', strategy, payoff_month_count: monthCount, total_interest_satang: totalInterest, total_paid_satang: totalPaid, finish_order: Object.freeze([...debts].sort((a, b) => a.finished_month - b.finished_month || a.order - b.order).map(({ id, finished_month }) => ({ id, month: finished_month }))), assumptions: Object.freeze({ monthly_interest_rounding: 'ceiling_satang', monthly_budget_satang: monthlyBudget, extra_payment_satang: null, max_months: maxMonths, minimums_roll_to_selected_debt: true }), engine_version: PAYOFF_ENGINE_VERSION });
}
function unresolvedResult(reason, debts, strategy, monthlyBudget, maxMonths, evaluatedMonths = 0) {
  return Object.freeze({ status: 'not_simulated_to_payoff', reason, strategy, payoff_month_count: null, total_interest_satang: null, total_paid_satang: null, finish_order: Object.freeze([]), remaining_balances_satang: Object.freeze(debts.map(({ id, balance_satang }) => ({ id, balance_satang })),), assumptions: Object.freeze({ monthly_interest_rounding: 'ceiling_satang', monthly_budget_satang: monthlyBudget, max_months: maxMonths, evaluated_months: evaluatedMonths, minimums_roll_to_selected_debt: true }), engine_version: PAYOFF_ENGINE_VERSION });
}

function restructureInput(input, debts, monthlyBudget) {
  const offer = required(input.restructure_offer, 'restructure_offer');
  if (!offer || typeof offer !== 'object') throw new PayoffEngineError('INVALID_RESTRUCTURE_OFFER', 'restructure_offer ไม่ถูกต้อง');
  const target = debts.find((debt) => debt.id === offer.debt_id);
  if (!target) throw new PayoffEngineError('INVALID_RESTRUCTURE_OFFER', 'restructure_offer.debt_id ไม่พบใน debts');
  const offeredApr = bps(offer.apr_bps, 'restructure_offer.apr_bps');
  const offeredPayment = amount(offer.monthly_payment_satang, 'restructure_offer.monthly_payment_satang', false);
  return {
    ...input,
    debts: debts.map((debt) => debt.id === target.id ? { ...debt, apr_bps: offeredApr, minimum_satang: offeredPayment } : debt),
    monthly_budget_satang: monthlyBudget
  };
}

export function comparePayoffScenarios(input) {
  const planned = planInput(input); // validates all required debt data before any scenario runs
  const baseInput = { ...input, debts: planned.debts, extra_payment_satang: planned.extra, monthly_budget_satang: planned.monthlyBudget, max_months: planned.maxMonths };
  const result = {
    engine_version: PAYOFF_ENGINE_VERSION,
    baseline: simulatePayoff(baseInput, 'baseline'),
    avalanche: simulatePayoff(baseInput, 'avalanche'),
    snowball: simulatePayoff(baseInput, 'snowball'),
    restructure_offer: null
  };
  if (input.restructure_offer !== undefined && input.restructure_offer !== null) result.restructure_offer = simulatePayoff(restructureInput(baseInput, planned.debts, planned.monthlyBudget), 'baseline');
  return Object.freeze(result);
}
