export const TAX_ENGINE_VERSION = 'thai-pit-first-jobber/2026.1';
export const TAX_YEAR = 2026;
export const PERSONAL_ALLOWANCE_SATANG = 6_000_000n;
export const EMPLOYMENT_EXPENSE_CAP_SATANG = 10_000_000n;

const MAX_MONEY_SATANG = 999_999_999_999n;
const BRACKETS = Object.freeze([
  { from_satang: 0n, to_satang: 15_000_000n, rate_bps: 0 },
  { from_satang: 15_000_000n, to_satang: 30_000_000n, rate_bps: 500 },
  { from_satang: 30_000_000n, to_satang: 50_000_000n, rate_bps: 1_000 },
  { from_satang: 50_000_000n, to_satang: 75_000_000n, rate_bps: 1_500 },
  { from_satang: 75_000_000n, to_satang: 100_000_000n, rate_bps: 2_000 },
  { from_satang: 100_000_000n, to_satang: 200_000_000n, rate_bps: 2_500 },
  { from_satang: 200_000_000n, to_satang: 500_000_000n, rate_bps: 3_000 },
  { from_satang: 500_000_000n, to_satang: null, rate_bps: 3_500 }
]);

export class TaxLabError extends Error {
  constructor(code, message) { super(message); this.name = 'TaxLabError'; this.code = code; }
}

function money(value, field) {
  if (typeof value !== 'bigint' || value < 0n || value > MAX_MONEY_SATANG) {
    throw new TaxLabError('INVALID_MONEY', `${field} ต้องเป็นจำนวนเงินไม่ติดลบในช่วงที่รองรับ`);
  }
  return value;
}

function integer(value, field, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new TaxLabError('INVALID_INTEGER', `${field} ต้องอยู่ระหว่าง ${min}–${max}`);
  return value;
}

const minimum = (a, b) => a < b ? a : b;
const maximum = (a, b) => a > b ? a : b;
const ceilDivide = (amount, divisor) => amount === 0n ? 0n : (amount + divisor - 1n) / divisor;

export function calculateThaiPIT2026(input) {
  const monthlySalary = money(input.monthly_salary_satang, 'เงินเดือน');
  const salaryMonths = integer(input.salary_months, 'จำนวนเดือนที่ได้รับเงินเดือน', 0, 12);
  const monthsRemaining = integer(input.months_remaining, 'จำนวนเดือนที่เหลือในปี', 1, 12);
  const bonus = money(input.bonus_satang, 'โบนัส');
  const otherNetIncome = money(input.other_net_income_satang, 'รายได้อื่นสุทธิ');
  const withholding = money(input.withholding_satang, 'ภาษีหัก ณ ที่จ่าย');
  const socialSecurity = money(input.social_security_satang, 'ประกันสังคมที่จ่ายจริง');
  const providentFund = money(input.provident_fund_satang, 'เงินสะสมกองทุนสำรองเลี้ยงชีพ');
  const otherAllowances = money(input.other_allowances_satang, 'ค่าลดหย่อนอื่นที่ตรวจสิทธิ์แล้ว');

  const employmentIncome = monthlySalary * BigInt(salaryMonths) + bonus;
  const employmentExpense = minimum(employmentIncome / 2n, EMPLOYMENT_EXPENSE_CAP_SATANG);
  const incomeAfterExpense = maximum(0n, employmentIncome - employmentExpense) + otherNetIncome;
  const totalAllowances = PERSONAL_ALLOWANCE_SATANG + socialSecurity + providentFund + otherAllowances;
  const taxableIncome = maximum(0n, incomeAfterExpense - totalAllowances);

  let tax = 0n;
  const bracket_breakdown = BRACKETS.map((bracket) => {
    const upper = bracket.to_satang === null ? taxableIncome : minimum(taxableIncome, bracket.to_satang);
    const portion = maximum(0n, upper - bracket.from_satang);
    const bracketTax = portion * BigInt(bracket.rate_bps) / 10_000n;
    tax += bracketTax;
    return { ...bracket, taxable_portion_satang: portion, tax_satang: bracketTax };
  }).filter((row) => row.taxable_portion_satang > 0n || row.from_satang === 0n);

  const reconciliation = tax - withholding;
  const amountToReserve = maximum(0n, reconciliation);
  const reservePerMonth = ceilDivide(amountToReserve, BigInt(monthsRemaining));
  const marginal = BRACKETS.find((bracket) => taxableIncome > bracket.from_satang && (bracket.to_satang === null || taxableIncome <= bracket.to_satang))?.rate_bps || 0;
  const totalIncome = employmentIncome + otherNetIncome;
  const effectiveRateBps = totalIncome > 0n ? Number(tax * 10_000n / totalIncome) : 0;

  return Object.freeze({
    engine_version: TAX_ENGINE_VERSION,
    tax_year: TAX_YEAR,
    employment_income_satang: employmentIncome,
    other_net_income_satang: otherNetIncome,
    total_income_satang: totalIncome,
    employment_expense_satang: employmentExpense,
    income_after_expense_satang: incomeAfterExpense,
    personal_allowance_satang: PERSONAL_ALLOWANCE_SATANG,
    total_allowances_satang: totalAllowances,
    taxable_income_satang: taxableIncome,
    bracket_breakdown,
    estimated_tax_satang: tax,
    withholding_satang: withholding,
    reconciliation_satang: reconciliation,
    reserve_per_month_satang: reservePerMonth,
    marginal_rate_bps: marginal,
    effective_rate_bps: effectiveRateBps,
    likely_form: otherNetIncome > 0n ? 'ภ.ง.ด.90 (ให้ตรวจประเภทเงินได้อีกครั้ง)' : 'ภ.ง.ด.91 หากมีเฉพาะเงินเดือน ม.40(1)',
    warnings: Object.freeze([
      'เป็นประมาณการเพื่อการเรียนรู้ ไม่ใช่แบบยื่นภาษีหรือคำวินิจฉัยทางภาษี',
      ...(otherNetIncome > 0n ? ['รายได้อื่นต้องจำแนกประเภทและค่าใช้จ่ายตามข้อเท็จจริงก่อนยื่นจริง'] : []),
      'ค่าลดหย่อนที่กรอกต้องเป็นยอดที่จ่ายจริง มีสิทธิ และอยู่ภายในเงื่อนไขของปีภาษี'
    ])
  });
}

export const TAX_BRACKETS = BRACKETS;

