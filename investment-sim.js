export const INVESTMENT_SIM_VERSION = 'first-jobber-investment-committee/2.0.0';

export const ASSET_CATALOG = Object.freeze({
  cash: Object.freeze({ label: 'เงินสด/ตลาดเงิน', short: 'เงินสด', role: 'สภาพคล่องและกระสุนสำรอง', primary_risk: 'ผลตอบแทนอาจแพ้เงินเฟ้อ', liquidity: 'สูง', expense_bps: 15, volatility_bps: 80, fx_exposure_bps: 0 }),
  thai_bond: Object.freeze({ label: 'พันธบัตรรัฐบาลไทย', short: 'พันธบัตร', role: 'รายได้และลดความผันผวน', primary_risk: 'ราคาอ่อนไหวต่อดอกเบี้ยและ duration', liquidity: 'กลาง–สูง', expense_bps: 35, volatility_bps: 550, fx_exposure_bps: 0 }),
  thai_equity: Object.freeze({ label: 'หุ้นไทยแบบกระจาย', short: 'หุ้นไทย', role: 'การเติบโตจากธุรกิจในประเทศ', primary_risk: 'เศรษฐกิจ กำไร และ valuation ไทย', liquidity: 'สูง', expense_bps: 70, volatility_bps: 2200, fx_exposure_bps: 0 }),
  global_equity: Object.freeze({ label: 'หุ้นโลกแบบกระจาย', short: 'หุ้นโลก', role: 'กระจายประเทศและแหล่งรายได้', primary_risk: 'ตลาดหุ้นโลกและค่าเงินบาท', liquidity: 'สูง', expense_bps: 85, volatility_bps: 1900, fx_exposure_bps: 10000 }),
  gold: Object.freeze({ label: 'ทองคำ', short: 'ทองคำ', role: 'กระจายความเสี่ยงและรับบาง inflation shock', primary_risk: 'ไม่มี cash flow และราคาผันผวน', liquidity: 'กลาง–สูง', expense_bps: 60, volatility_bps: 1800, fx_exposure_bps: 8500 }),
  reit: Object.freeze({ label: 'กอง REIT/โครงสร้างพื้นฐาน', short: 'REIT', role: 'รายได้จากสินทรัพย์จริง', primary_risk: 'ดอกเบี้ย ผู้เช่า และราคาอสังหาฯ', liquidity: 'กลาง', expense_bps: 90, volatility_bps: 1700, fx_exposure_bps: 0 })
});

export const ASSETS = Object.freeze(Object.keys(ASSET_CATALOG));
export const ALLOCATION_PRESETS = Object.freeze({
  capital_preservation: Object.freeze({ cash: 45, thai_bond: 35, thai_equity: 5, global_equity: 5, gold: 5, reit: 5 }),
  core_balanced: Object.freeze({ cash: 15, thai_bond: 25, thai_equity: 15, global_equity: 30, gold: 10, reit: 5 }),
  long_horizon: Object.freeze({ cash: 5, thai_bond: 10, thai_equity: 20, global_equity: 45, gold: 10, reit: 10 }),
  thailand_income: Object.freeze({ cash: 15, thai_bond: 30, thai_equity: 20, global_equity: 10, gold: 10, reit: 15 })
});

export const DECISION_MODES = Object.freeze({
  rebalance: Object.freeze({ label: 'ปรับทั้งพอร์ต', note: 'ขายและซื้อกลับสู่สัดส่วนเป้าหมาย มี turnover และต้นทุนซื้อขาย' }),
  contribution_only: Object.freeze({ label: 'ใช้เงินใหม่ปรับพอร์ต', note: 'ไม่ขายของเดิม จัดเงินเติมเข้าสินทรัพย์เป้าหมาย' }),
  hold_cash: Object.freeze({ label: 'พักเงินใหม่ไว้ในเงินสด', note: 'ถือสินทรัพย์เดิมและเก็บเงินเติมเป็นสภาพคล่อง' })
});

const q = (id, title, signal, macro, returns_bps, lesson, reference = '') => Object.freeze({
  id, title, signal, macro: Object.freeze(macro), returns_bps: Object.freeze(returns_bps), lesson, reference
});

const BASE_ROUNDS = Object.freeze([
  q('fragile-recovery', 'การฟื้นตัวยังไม่ทั่วถึง', 'GDP โตต่ำ สินเชื่อเปราะบาง แต่ดอกเบี้ยอยู่ในระดับผ่อนคลาย', { growth: 'ต่ำ', inflation: '2.8%', policy_rate: '1.00%', usdthb: 'อ่อนค่า', valuation: 'SET Fwd P/E 13.9x' }, { cash: 25, thai_bond: 120, thai_equity: 180, global_equity: 260, gold: 150, reit: 100 }, 'ข้อมูลมหภาคที่ดีขึ้นไม่ได้แปลว่าสินทรัพย์ทุกประเภทจะให้ผลตอบแทนเท่ากัน', 'BOT 24 มิ.ย. 2569 · SET สิ้นปี 2568'),
  q('foreign-outflow', 'เงินทุนต่างชาติไหลออก', 'เงินบาทอ่อนและหุ้นไทยถูกลดน้ำหนัก ขณะที่สินทรัพย์ต่างประเทศได้แรงช่วยจาก FX', { growth: 'ต่ำ', inflation: '3.1%', policy_rate: '1.00%', usdthb: '+4.0%', valuation: 'ถูกลง' }, { cash: 25, thai_bond: -80, thai_equity: -650, global_equity: 620, gold: 480, reit: -300 }, 'การลงทุนต่างประเทศมีทั้งความเสี่ยงและประโยชน์จากค่าเงิน', 'เส้นทางจำลองจากกลไก FX; ไม่ใช่พยากรณ์'),
  q('energy-shock', 'ต้นทุนพลังงานเร่งเงินเฟ้อ', 'ตลาดคาดว่าดอกเบี้ยอาจลดได้ช้าลง ตราสาร duration ยาวถูกกดดัน', { growth: 'ชะลอ', inflation: '4.1%', policy_rate: '1.00%', usdthb: 'ทรงตัว', valuation: 'ลดลง' }, { cash: 25, thai_bond: -300, thai_equity: -500, global_equity: -420, gold: 650, reit: -580 }, 'ทองคำอาจช่วยในบาง inflation shock แต่ไม่ได้ป้องกันได้ทุกช่วง', 'BOT ระบุความเสี่ยงเงินเฟ้อด้านอุปทาน 24 มิ.ย. 2569'),
  q('earnings-reset', 'กำไรบริษัทต่ำกว่าคาด', 'ตลาดปรับประมาณการกำไรลง โดยหุ้นในประเทศรับแรงกดดันมากกว่า', { growth: 'ต่ำ', inflation: '3.4%', policy_rate: '1.00%', usdthb: 'อ่อนเล็กน้อย', valuation: 'de-rate' }, { cash: 25, thai_bond: 180, thai_equity: -900, global_equity: -250, gold: 120, reit: -500 }, 'การกระจายประเทศลดการพึ่งพากำไรจากระบบเศรษฐกิจเดียว', 'เส้นทางจำลอง concentration risk'),
  q('policy-cut', 'ตลาดเริ่มคาดดอกเบี้ยลด', 'Bond yield ลด สินทรัพย์ที่ไวต่อดอกเบี้ยฟื้นก่อนข้อมูลเศรษฐกิจชัด', { growth: 'ต่ำ', inflation: '2.2%', policy_rate: '0.75%', usdthb: 'อ่อนเล็กน้อย', valuation: 'ฟื้น' }, { cash: 20, thai_bond: 520, thai_equity: 430, global_equity: 500, gold: 280, reit: 700 }, 'Duration สร้างกำไรได้เมื่อ yield ลด แต่ขาดทุนได้เมื่อ yield ขึ้น', 'กลไกจำลองจาก bond duration'),
  q('global-recession', 'เศรษฐกิจโลกถดถอย', 'กำไรและความเชื่อมั่นลดพร้อมกัน นักลงทุนต้องการสภาพคล่อง', { growth: 'หดตัว', inflation: '1.5%', policy_rate: '0.75%', usdthb: 'ผันผวน', valuation: 'risk-off' }, { cash: 20, thai_bond: 480, thai_equity: -1550, global_equity: -1850, gold: 520, reit: -1300 }, 'เงินสำรองสำคัญที่สุดเมื่อช่วยให้ไม่ต้องขายสินทรัพย์เสี่ยงเพื่อใช้จ่าย', 'Stress case; ไม่ใช่การคาดการณ์'),
  q('liquidity-response', 'ธนาคารกลางเพิ่มสภาพคล่อง', 'ตลาดตราสารหนี้ฟื้น แต่กำไรบริษัทจริงยังอ่อนแอ', { growth: 'หดตัว', inflation: '1.2%', policy_rate: '0.50%', usdthb: 'แข็งเล็กน้อย', valuation: 'ทรงตัว' }, { cash: 15, thai_bond: 650, thai_equity: 350, global_equity: 500, gold: 380, reit: 420 }, 'ตลาดมักเคลื่อนไหวก่อนข้อมูลเศรษฐกิจจริง', 'เส้นทางจำลองวงจรนโยบาย'),
  q('early-rebound', 'ตลาดฟื้นก่อนเศรษฐกิจ', 'หุ้นและ REIT ฟื้นแรง ขณะที่ผู้ลงทุนส่วนใหญ่ยังระมัดระวัง', { growth: 'เริ่มฟื้น', inflation: '1.4%', policy_rate: '0.50%', usdthb: 'แข็ง', valuation: 'สูงขึ้นเร็ว' }, { cash: 15, thai_bond: 120, thai_equity: 1250, global_equity: 1050, gold: -180, reit: 950 }, 'นโยบายพอร์ตช่วยให้มีส่วนร่วมกับการฟื้นตัวโดยไม่ต้องทายวันกลับตัว', 'เส้นทางจำลอง recovery'),
  q('baht-rally', 'เงินบาทแข็งเร็ว', 'ผลตอบแทนสินทรัพย์ต่างประเทศเมื่อแปลงเป็นบาทถูกหักล้างบางส่วน', { growth: 'ฟื้น', inflation: '1.6%', policy_rate: '0.75%', usdthb: '−6.0%', valuation: 'กลาง' }, { cash: 20, thai_bond: 150, thai_equity: 600, global_equity: -250, gold: -420, reit: 380 }, 'สินทรัพย์ต่างประเทศไม่ได้กระจายความเสี่ยงด้านค่าเงินเสมอไป', 'BOT เผยแพร่อัตราแลกเปลี่ยนถัวเฉลี่ยรายวัน'),
  q('capex-cycle', 'การลงทุนภาคธุรกิจกลับมา', 'กำไรและความต้องการสินเชื่อดีขึ้น หุ้นนำตราสารหนี้', { growth: 'ดีขึ้น', inflation: '2.0%', policy_rate: '0.75%', usdthb: 'ทรงตัว', valuation: 'สูงขึ้น' }, { cash: 20, thai_bond: -100, thai_equity: 900, global_equity: 650, gold: -120, reit: 520 }, 'พอร์ตที่ฟื้นแรงอาจมีหุ้นเกิน risk budget โดยไม่รู้ตัว', 'เส้นทางจำลอง expansion'),
  q('rate-normalization', 'ดอกเบี้ยกลับสู่ภาวะปกติ', 'Yield ขึ้นเพราะเศรษฐกิจดีขึ้น แต่สินทรัพย์ duration ยาวถูกกดดัน', { growth: 'ดี', inflation: '2.3%', policy_rate: '1.25%', usdthb: 'ทรงตัว', valuation: 'ปรับฐาน' }, { cash: 30, thai_bond: -420, thai_equity: -200, global_equity: -150, gold: -300, reit: -620 }, 'ข่าวเศรษฐกิจดีอาจเป็นข่าวร้ายต่อราคาพันธบัตร', 'กลไกจำลอง rate sensitivity'),
  q('late-cycle', 'ปลายวัฏจักรและ valuation ตึงตัว', 'ผลตอบแทนกระจายกว้าง ตลาดผันผวนแม้เศรษฐกิจยังโต', { growth: 'ชะลอ', inflation: '2.4%', policy_rate: '1.25%', usdthb: 'ผันผวน', valuation: 'สูง' }, { cash: 30, thai_bond: 100, thai_equity: -520, global_equity: 180, gold: 350, reit: -250 }, 'เป้าหมายไม่ใช่ชนะทุกไตรมาส แต่คือทำตามแผนได้ตลอดวัฏจักร', 'เส้นทางจำลอง late-cycle')
]);

const shiftedTape = (prefix, adjustments) => Object.freeze(BASE_ROUNDS.map((round, index) => Object.freeze({
  ...round,
  id: `${prefix}-${index + 1}`,
  returns_bps: Object.freeze(Object.fromEntries(ASSETS.map((asset) => [asset, round.returns_bps[asset] + (adjustments[asset] || 0)]))),
  reference: `Stress path: ${prefix}; ปรับจากฐานเดียวกัน ไม่ใช่ข้อมูลคาดการณ์`
})));

const crisisRounds = BASE_ROUNDS.map((round, index) => {
  if (index !== 1) return round;
  return q('liquidity-crisis', 'วิกฤตสภาพคล่อง', 'สินทรัพย์เสี่ยงถูกขายพร้อมกันและ bid–ask spread กว้าง', { growth: 'หดตัวเร็ว', inflation: 'ต่ำ', policy_rate: 'ฉุกเฉิน', usdthb: '+8.0%', valuation: 'panic' }, { cash: 15, thai_bond: 250, thai_equity: -2400, global_equity: -2100, gold: 250, reit: -2000 }, 'Correlation อาจสูงขึ้นในวิกฤต การกระจายไม่ได้แปลว่าจะไม่ขาดทุน', 'Stress case เทียบกลไกช่วงวิกฤต');
});

export const MARKET_TAPES = Object.freeze({
  'thai-policy-cycle': Object.freeze({ id: 'thai-policy-cycle', title: 'Thai policy cycle', note: 'ฐานเศรษฐกิจไทย 2568–2569 แล้วเดินผ่าน 12 ไตรมาสจำลอง', rounds: BASE_ROUNDS }),
  'inflation-stress': Object.freeze({ id: 'inflation-stress', title: 'Inflation & rate stress', note: 'เพิ่มแรงกดดันต่อ bond, equity และ REIT พร้อมเพิ่มบทบาททองคำ', rounds: shiftedTape('inflation', { thai_bond: -220, thai_equity: -180, global_equity: -120, gold: 240, reit: -200 }) }),
  'crisis-recovery': Object.freeze({ id: 'crisis-recovery', title: 'Liquidity crisis & recovery', note: 'ทดสอบ forced selling, policy response และการฟื้นก่อนข่าวดี', rounds: Object.freeze(crisisRounds) })
});

export const MARKET_SCENARIOS = MARKET_TAPES['thai-policy-cycle'].rounds;
export const MARKET_DATA_SNAPSHOT = Object.freeze([
  Object.freeze({ label: 'ดอกเบี้ยนโยบาย', value: '1.00%', as_of: '24 มิ.ย. 2569', source: 'ธนาคารแห่งประเทศไทย', url: 'https://www.bot.or.th/th/news-and-media/news/mpc/news-20260624-NVHKxr00.html' }),
  Object.freeze({ label: 'คาดการณ์ GDP ไทย 2569', value: '2.3%', as_of: '24 มิ.ย. 2569', source: 'ธนาคารแห่งประเทศไทย', url: 'https://www.bot.or.th/th/news-and-media/news/mpc/news-20260624-NVHKxr00.html' }),
  Object.freeze({ label: 'คาดการณ์เงินเฟ้อทั่วไป', value: '2.8%', as_of: 'ปี 2569', source: 'ธนาคารแห่งประเทศไทย', url: 'https://www.bot.or.th/th/news-and-media/news/mpc/news-20260624-NVHKxr00.html' }),
  Object.freeze({ label: 'SET สิ้นปี 2568', value: '1,259.67', as_of: '30 ธ.ค. 2568', source: 'ตลาดหลักทรัพย์ฯ', url: 'https://media.set.or.th/set/Documents/2026/May/SET_56-1_OneReport_2025_EN.pdf' }),
  Object.freeze({ label: 'SET Forward P/E', value: '13.90x', as_of: 'สิ้นปี 2568', source: 'ตลาดหลักทรัพย์ฯ', url: 'https://media.set.or.th/set/Documents/2026/May/SET_56-1_OneReport_2025_EN.pdf' }),
  Object.freeze({ label: 'SET Dividend yield', value: '4.04%', as_of: 'สิ้นปี 2568', source: 'ตลาดหลักทรัพย์ฯ', url: 'https://media.set.or.th/set/Documents/2026/May/SET_56-1_OneReport_2025_EN.pdf' })
]);

export const STRESS_TESTS = Object.freeze([
  Object.freeze({ id: 'equity-crash', label: 'หุ้นโลกลดแรง', returns_bps: Object.freeze({ cash: 20, thai_bond: 350, thai_equity: -3500, global_equity: -2800, gold: 700, reit: -2200 }) }),
  Object.freeze({ id: 'rate-spike', label: 'Yield เพิ่ม 2%', returns_bps: Object.freeze({ cash: 40, thai_bond: -900, thai_equity: -1200, global_equity: -1000, gold: -700, reit: -1500 }) }),
  Object.freeze({ id: 'baht-weakness', label: 'บาทอ่อน 12%', returns_bps: Object.freeze({ cash: 20, thai_bond: -120, thai_equity: -500, global_equity: 1200, gold: 1000, reit: -300 }) }),
  Object.freeze({ id: 'inflation-shock', label: 'เงินเฟ้อด้านอุปทาน', returns_bps: Object.freeze({ cash: 25, thai_bond: -650, thai_equity: -900, global_equity: -700, gold: 900, reit: -1000 }) })
]);

const MAX_MONEY_SATANG = 999_999_999_999n;
export class InvestmentSimError extends Error {
  constructor(code, message) { super(message); this.name = 'InvestmentSimError'; this.code = code; }
}

function moneyString(value, field) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new InvestmentSimError('INVALID_MONEY', `${field} ต้องเป็นจำนวนสตางค์แบบจำนวนเต็ม`);
  const parsed = BigInt(value);
  if (parsed < 0n || parsed > MAX_MONEY_SATANG) throw new InvestmentSimError('INVALID_MONEY', `${field} อยู่นอกช่วงที่รองรับ`);
  return parsed;
}
function boundedInteger(value, min, max, field) {
  if (!Number.isInteger(value) || value < min || value > max) throw new InvestmentSimError('INVALID_PARAMETER', `${field} ต้องอยู่ระหว่าง ${min}–${max}`);
  return value;
}
function checkedMoney(value, field) {
  if (value < 0n || value > MAX_MONEY_SATANG) throw new InvestmentSimError('MONEY_OVERFLOW', `${field} เกินช่วงที่ระบบรองรับ`);
  return value;
}
export function validateAllocation(allocation) {
  if (!allocation || ASSETS.some((asset) => !Number.isInteger(allocation[asset]) || allocation[asset] < 0 || allocation[asset] > 100)) throw new InvestmentSimError('INVALID_ALLOCATION', 'สัดส่วนทุกสินทรัพย์ต้องเป็นจำนวนเต็ม 0–100');
  if (ASSETS.reduce((sum, asset) => sum + allocation[asset], 0) !== 100) throw new InvestmentSimError('INVALID_ALLOCATION_TOTAL', 'สัดส่วนรวมต้องเท่ากับ 100%');
  return Object.fromEntries(ASSETS.map((asset) => [asset, allocation[asset]]));
}
function allocate(total, allocation) {
  let assigned = 0n;
  const holdings = {};
  ASSETS.forEach((asset, index) => {
    const amount = index === ASSETS.length - 1 ? total - assigned : total * BigInt(allocation[asset]) / 100n;
    holdings[asset] = amount; assigned += amount;
  });
  return holdings;
}
function parseHoldings(holdings) { return Object.fromEntries(ASSETS.map((asset) => [asset, moneyString(holdings?.[asset], ASSET_CATALOG[asset].label)])); }
function totalHoldings(holdings) { return ASSETS.reduce((sum, asset) => sum + holdings[asset], 0n); }
function applyBps(amount, bps) { return checkedMoney(amount * BigInt(10_000 + bps) / 10_000n, 'มูลค่าหลังผลตอบแทน'); }
const absolute = (value) => value < 0n ? -value : value;

export function portfolioWeights(holdings) {
  const parsed = parseHoldings(holdings); const total = totalHoldings(parsed);
  return Object.fromEntries(ASSETS.map((asset) => [asset, total > 0n ? Number(parsed[asset] * 10_000n / total) : 0]));
}
export function portfolioDiagnostics(allocation) {
  const safe = validateAllocation(allocation);
  const largestAsset = ASSETS.reduce((best, asset) => safe[asset] > safe[best] ? asset : best, ASSETS[0]);
  return Object.freeze({
    weighted_volatility_bps: Math.round(ASSETS.reduce((sum, asset) => sum + safe[asset] * ASSET_CATALOG[asset].volatility_bps, 0) / 100),
    fx_exposure_bps: Math.round(ASSETS.reduce((sum, asset) => sum + safe[asset] * ASSET_CATALOG[asset].fx_exposure_bps, 0) / 100),
    growth_assets_percent: safe.thai_equity + safe.global_equity + safe.reit,
    liquid_assets_percent: safe.cash + safe.thai_bond,
    largest_asset: largestAsset,
    largest_asset_percent: safe[largestAsset],
    weighted_expense_bps: Math.round(ASSETS.reduce((sum, asset) => sum + safe[asset] * ASSET_CATALOG[asset].expense_bps, 0) / 100)
  });
}
export function runStressTests(allocation) {
  const safe = validateAllocation(allocation);
  return STRESS_TESTS.map((stress) => {
    const impact = Math.round(ASSETS.reduce((sum, asset) => sum + safe[asset] * stress.returns_bps[asset], 0) / 100);
    const rows = ASSETS.map((asset) => ({ asset, bps: Math.round(safe[asset] * stress.returns_bps[asset] / 100) }));
    const largest = rows.reduce((worst, row) => row.bps < worst.bps ? row : worst, rows[0]);
    return Object.freeze({ id: stress.id, label: stress.label, impact_bps: impact, largest_loss_asset: largest.asset, largest_loss_bps: largest.bps });
  });
}

export function startInvestmentSimulation({ starting_satang, goal_satang, monthly_contribution_satang = '0', goal_horizon_years = 5, emergency_months = 0, high_interest_debt_apr_bps = 0, max_drawdown_bps = 2000, platform_fee_bps = 0, transaction_cost_bps = 15, scenario_id = 'thai-policy-cycle', allocation }) {
  const starting = moneyString(starting_satang, 'เงินเริ่มต้น'); const goal = moneyString(goal_satang, 'เป้าหมาย'); const monthly = moneyString(monthly_contribution_satang, 'เงินลงทุนต่อเดือน');
  if (starting <= 0n) throw new InvestmentSimError('ZERO_START', 'เงินเริ่มต้นต้องมากกว่า 0');
  const safe = validateAllocation(allocation);
  const horizon = boundedInteger(goal_horizon_years, 1, 30, 'ระยะเวลาเป้าหมาย');
  const emergency = boundedInteger(emergency_months, 0, 24, 'เงินสำรองฉุกเฉิน');
  const debtApr = boundedInteger(high_interest_debt_apr_bps, 0, 10_000, 'APR หนี้ดอกเบี้ยสูง');
  const riskLimit = boundedInteger(max_drawdown_bps, 100, 8000, 'กรอบ drawdown');
  const platformFee = boundedInteger(platform_fee_bps, 0, 500, 'ค่าธรรมเนียมแพลตฟอร์ม');
  const tradingCost = boundedInteger(transaction_cost_bps, 0, 500, 'ต้นทุนซื้อขาย');
  if (!MARKET_TAPES[scenario_id]) throw new InvestmentSimError('INVALID_SCENARIO', 'ไม่พบเส้นทางตลาดที่เลือก');
  const holdings = allocate(starting, safe);
  return Object.freeze({ engine_version: INVESTMENT_SIM_VERSION, scenario_id, round: 0, starting_satang: starting.toString(), goal_satang: goal.toString(), monthly_contribution_satang: monthly.toString(), goal_horizon_years: horizon, emergency_months: emergency, high_interest_debt_apr_bps: debtApr, max_drawdown_limit_bps: riskLimit, platform_fee_bps: platformFee, transaction_cost_bps: tradingCost, holdings: Object.fromEntries(ASSETS.map((asset) => [asset, holdings[asset].toString()])), initial_allocation: safe, target_allocation: safe, peak_satang: starting.toString(), nav_index_bps: '10000', peak_nav_index_bps: '10000', inflation_index_bps: '10000', max_drawdown_bps: 0, total_contributions_satang: '0', total_fees_satang: '0', total_transaction_cost_satang: '0', history: Object.freeze([]), completed: false });
}

function executeDecision(holdings, contribution, allocation, mode, costBps) {
  const working = { ...holdings };
  if (mode === 'hold_cash') { working.cash = checkedMoney(working.cash + contribution, 'เงินสดหลังเติมเงิน'); return { holdings: working, transaction_cost: 0n, turnover: 0n }; }
  if (mode === 'contribution_only') {
    const cost = contribution * BigInt(costBps) / 10_000n; const additions = allocate(contribution - cost, allocation);
    ASSETS.forEach((asset) => { working[asset] = checkedMoney(working[asset] + additions[asset], 'พอร์ตหลังเติมเงิน'); });
    return { holdings: working, transaction_cost: cost, turnover: contribution - cost };
  }
  const withContribution = { ...working, cash: checkedMoney(working.cash + contribution, 'เงินสดหลังเติมเงิน') };
  const grossTotal = totalHoldings(withContribution); const preliminary = allocate(grossTotal, allocation);
  const turnover = ASSETS.reduce((sum, asset) => sum + absolute(preliminary[asset] - withContribution[asset]), 0n) / 2n;
  const cost = turnover * BigInt(costBps) / 10_000n;
  return { holdings: allocate(grossTotal - cost, allocation), transaction_cost: cost, turnover };
}
function applyMarketAndFees(holdings, scenario, platformFeeBps) {
  const end = {}; const attribution = {}; let totalFee = 0n;
  ASSETS.forEach((asset) => {
    const before = holdings[asset]; const gross = applyBps(before, scenario.returns_bps[asset]);
    const fee = gross * BigInt(ASSET_CATALOG[asset].expense_bps + platformFeeBps) / 40_000n;
    end[asset] = gross - fee; totalFee += fee;
    attribution[asset] = Object.freeze({ before_satang: before.toString(), return_bps: scenario.returns_bps[asset], gross_pnl_satang: (gross - before).toString(), fee_satang: fee.toString(), after_satang: end[asset].toString() });
  });
  return { holdings: end, total_fee: totalFee, attribution };
}

export function advanceInvestmentSimulation(game, decision) {
  if (!game || game.engine_version !== INVESTMENT_SIM_VERSION) throw new InvestmentSimError('INVALID_GAME', 'ข้อมูลเกมไม่ตรงกับ engine รุ่นนี้ กรุณาเริ่มภารกิจใหม่');
  const tape = MARKET_TAPES[game.scenario_id];
  if (game.completed || game.round >= tape.rounds.length) throw new InvestmentSimError('GAME_COMPLETE', 'สถานการณ์จำลองจบแล้ว');
  const allocation = validateAllocation(decision?.allocation); const mode = decision?.mode;
  if (!DECISION_MODES[mode]) throw new InvestmentSimError('INVALID_DECISION', 'เลือกวิธีปรับพอร์ตก่อนยืนยัน');
  const holdings = parseHoldings(game.holdings); const before = totalHoldings(holdings);
  const contribution = moneyString(game.monthly_contribution_satang, 'เงินลงทุนต่อเดือน') * 3n;
  const scenario = tape.rounds[game.round];
  const execution = executeDecision(holdings, contribution, allocation, mode, Number(game.transaction_cost_bps));
  const applied = applyMarketAndFees(execution.holdings, scenario, Number(game.platform_fee_bps));
  const after = totalHoldings(applied.holdings);
  const hold = applyMarketAndFees(executeDecision(holdings, contribution, allocation, 'hold_cash', Number(game.transaction_cost_bps)).holdings, scenario, Number(game.platform_fee_bps));
  const holdAfter = totalHoldings(hold.holdings);
  const previousPeak = moneyString(game.peak_satang, 'ยอดสูงสุด'); const peak = after > previousPeak ? after : previousPeak;
  const contributionAdjustedBase = before + contribution;
  const previousNav = BigInt(game.nav_index_bps || '10000');
  const navIndex = contributionAdjustedBase > 0n ? previousNav * after / contributionAdjustedBase : previousNav;
  const previousPeakNav = BigInt(game.peak_nav_index_bps || '10000');
  const peakNav = navIndex > previousPeakNav ? navIndex : previousPeakNav;
  const drawdownBps = peakNav > 0n ? Number((peakNav - navIndex) * 10_000n / peakNav) : 0;
  const inflationAnnual = Number.parseFloat(scenario.macro.inflation) || 0;
  const inflationIndex = BigInt(game.inflation_index_bps || '10000') * BigInt(10_000 + Math.round(inflationAnnual * 25)) / 10_000n;
  const realAfter = inflationIndex > 0n ? after * 10_000n / inflationIndex : after;
  const round = game.round + 1;
  const historyItem = Object.freeze({ round, scenario_id: scenario.id, title: scenario.title, signal: scenario.signal, reference: scenario.reference, macro: scenario.macro, decision_mode: mode, target_allocation: allocation, ending_weights_bps: portfolioWeights(Object.fromEntries(ASSETS.map((asset) => [asset, applied.holdings[asset].toString()]))), before_satang: before.toString(), contribution_satang: contribution.toString(), turnover_satang: execution.turnover.toString(), transaction_cost_satang: execution.transaction_cost.toString(), fee_satang: applied.total_fee.toString(), after_satang: after.toString(), real_after_satang: realAfter.toString(), nav_index_bps: navIndex.toString(), counterfactual_hold_satang: holdAfter.toString(), decision_delta_satang: (after - holdAfter).toString(), change_bps: contributionAdjustedBase > 0n ? Number((after - contributionAdjustedBase) * 10_000n / contributionAdjustedBase) : 0, drawdown_bps: drawdownBps, returns_bps: scenario.returns_bps, attribution: Object.freeze(applied.attribution), lesson: scenario.lesson });
  return Object.freeze({ ...game, round, target_allocation: allocation, holdings: Object.fromEntries(ASSETS.map((asset) => [asset, applied.holdings[asset].toString()])), peak_satang: peak.toString(), nav_index_bps: navIndex.toString(), peak_nav_index_bps: peakNav.toString(), inflation_index_bps: inflationIndex.toString(), max_drawdown_bps: Math.max(Number(game.max_drawdown_bps || 0), drawdownBps), total_contributions_satang: (BigInt(game.total_contributions_satang || '0') + contribution).toString(), total_fees_satang: (BigInt(game.total_fees_satang || '0') + applied.total_fee).toString(), total_transaction_cost_satang: (BigInt(game.total_transaction_cost_satang || '0') + execution.transaction_cost).toString(), history: Object.freeze([...(game.history || []), historyItem]), completed: round === tape.rounds.length });
}

export function summarizeInvestmentSimulation(game) {
  if (!game || game.engine_version !== INVESTMENT_SIM_VERSION) throw new InvestmentSimError('INVALID_GAME', 'ข้อมูลเกมไม่ตรงกับ engine รุ่นนี้');
  const finalValue = totalHoldings(parseHoldings(game.holdings)); const starting = moneyString(game.starting_satang, 'เงินเริ่มต้น'); const goal = moneyString(game.goal_satang, 'เป้าหมาย');
  const contributions = BigInt(game.total_contributions_satang || '0'); const fees = BigInt(game.total_fees_satang || '0'); const trading = BigInt(game.total_transaction_cost_satang || '0');
  const capital = starting + contributions; const pnl = finalValue - capital; const inflationIndex = BigInt(game.inflation_index_bps || '10000');
  const realValue = inflationIndex > 0n ? finalValue * 10_000n / inflationIndex : finalValue;
  const allocationChanges = (game.history || []).reduce((sum, item, index, history) => {
    const prior = index === 0 ? validateAllocation(game.initial_allocation) : history[index - 1].target_allocation;
    return sum + ASSETS.reduce((inner, asset) => inner + Math.abs(item.target_allocation[asset] - prior[asset]), 0) / 2;
  }, 0);
  return Object.freeze({ final_value_satang: finalValue, real_value_satang: realValue, invested_capital_satang: capital, total_contributions_satang: contributions, gross_market_pnl_satang: pnl + fees + trading, investment_pnl_satang: pnl, total_fees_satang: fees, total_transaction_cost_satang: trading, total_return_bps: capital > 0n ? Number(pnl * 10_000n / capital) : 0, max_drawdown_bps: Number(game.max_drawdown_bps || 0), risk_limit_bps: Number(game.max_drawdown_limit_bps || 0), risk_breach_rounds: (game.history || []).filter((item) => item.drawdown_bps > Number(game.max_drawdown_limit_bps)).length, goal_progress_bps: goal > 0n ? Math.min(99_999, Number(finalValue * 10_000n / goal)) : 0, allocation_turnover_points: allocationChanges, decision_delta_satang: (game.history || []).reduce((sum, item) => sum + BigInt(item.decision_delta_satang || '0'), 0n), rounds_completed: game.round, completed: game.completed, scenario_title: MARKET_TAPES[game.scenario_id].title, ending_weights_bps: portfolioWeights(game.holdings) });
}
