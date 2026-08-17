export const INVESTMENT_SIM_VERSION = 'first-jobber-market-lab/1.0.0';
export const ASSETS = Object.freeze(['cash', 'bonds', 'stocks']);
export const ALLOCATION_PRESETS = Object.freeze({
  defensive: Object.freeze({ cash: 35, bonds: 50, stocks: 15 }),
  balanced: Object.freeze({ cash: 10, bonds: 40, stocks: 50 }),
  growth: Object.freeze({ cash: 5, bonds: 15, stocks: 80 })
});

export const MARKET_SCENARIOS = Object.freeze([
  { id: 'steady', title: 'เศรษฐกิจโตแบบค่อยเป็นค่อยไป', signal: 'กำไรบริษัทดีขึ้น แต่ตลาดยังไม่ร้อนแรง', returns_bps: { cash: 10, bonds: 40, stocks: 200 }, lesson: 'พอร์ตที่กระจายยังเดินหน้าได้โดยไม่ต้องทายสินทรัพย์ชนะเพียงตัวเดียว' },
  { id: 'inflation', title: 'เงินเฟ้อสูงกว่าคาด', signal: 'ตลาดกังวลว่าดอกเบี้ยจะอยู่สูงนานขึ้น', returns_bps: { cash: 10, bonds: -150, stocks: -250 }, lesson: 'เงินเฟ้อและดอกเบี้ยกระทบทั้งตราสารหนี้และหุ้นในเวลาเดียวกันได้' },
  { id: 'rate-hike', title: 'ธนาคารกลางขึ้นดอกเบี้ย', signal: 'ต้นทุนเงินเพิ่มและราคาสินทรัพย์ถูกปรับใหม่', returns_bps: { cash: 15, bonds: -250, stocks: -350 }, lesson: 'Duration และ valuation ทำให้สินทรัพย์ตอบสนองต่อดอกเบี้ยไม่เท่ากัน' },
  { id: 'rally', title: 'ตลาดรับข่าวดีเร็ว', signal: 'นักลงทุนเพิ่มความเสี่ยงหลังข้อมูลเศรษฐกิจดี', returns_bps: { cash: 10, bonds: 50, stocks: 500 }, lesson: 'การถือสินทรัพย์เติบโตช่วยรับ upside แต่ไม่ควรไล่ซื้อหลังเห็นผลแล้วโดยไม่มีแผน' },
  { id: 'recession', title: 'เศรษฐกิจเข้าสู่ภาวะถดถอย', signal: 'กำไรลด การว่างงานเพิ่ม และความกลัวสูง', returns_bps: { cash: 10, bonds: 200, stocks: -1200 }, lesson: 'Drawdown คือราคาที่ต้องจ่ายเพื่อผลตอบแทนระยะยาว และเงินฉุกเฉินช่วยไม่ให้ถูกบังคับขาย' },
  { id: 'rebound', title: 'ตลาดฟื้นก่อนข่าวดีชัดเจน', signal: 'ราคาปรับขึ้นขณะที่เศรษฐกิจจริงยังอ่อนแอ', returns_bps: { cash: 10, bonds: 40, stocks: 800 }, lesson: 'ตลาดอาจฟื้นก่อนความรู้สึกของคน การรอให้ทุกอย่างชัดอาจพลาดช่วงสำคัญ' },
  { id: 'supply-shock', title: 'ต้นทุนพลังงานพุ่ง', signal: 'เงินเฟ้อกลับมาและกำไรบางอุตสาหกรรมถูกกดดัน', returns_bps: { cash: 10, bonds: -100, stocks: -400 }, lesson: 'ความเสี่ยงไม่ได้มาจากกราฟอย่างเดียว แต่รวมถึงเงินเฟ้อและต้นทุนธุรกิจ' },
  { id: 'disinflation', title: 'เงินเฟ้อลดเร็วกว่าคาด', signal: 'ตลาดคาดดอกเบี้ยขาลงและสภาพคล่องดีขึ้น', returns_bps: { cash: 10, bonds: 300, stocks: 400 }, lesson: 'สินทรัพย์หลายประเภทอาจขึ้นพร้อมกัน จึงควร rebalance ตามกฎแทนการเพิ่มความเสี่ยงไม่จำกัด' },
  { id: 'sideways', title: 'ตลาดไร้ทิศทาง', signal: 'ข่าวดีและข่าวร้ายหักล้างกัน', returns_bps: { cash: 10, bonds: 50, stocks: 0 }, lesson: 'เดือนที่น่าเบื่อเป็นส่วนปกติของการลงทุน ระบบเงินเติมสำคัญกว่าความตื่นเต้น' },
  { id: 'earnings', title: 'กำไรบริษัทเหนือคาด', signal: 'หุ้นเติบโตนำตลาด แต่ valuation สูงขึ้น', returns_bps: { cash: 10, bonds: -50, stocks: 600 }, lesson: 'ผลตอบแทนดีทำให้สัดส่วนหุ้นสูงขึ้นโดยอัตโนมัติ การ rebalance คุมความเสี่ยงที่เปลี่ยนไป' },
  { id: 'volatility', title: 'ข่าวการเงินสร้างความผันผวน', signal: 'ตลาดขายสินทรัพย์เสี่ยงเพื่อถือของที่มั่นคงกว่า', returns_bps: { cash: 10, bonds: 120, stocks: -700 }, lesson: 'การเปลี่ยนแผนเพราะกลัวหลังตลาดลงอาจล็อกขาดทุน ต้องกลับไปดู horizon และ risk budget' },
  { id: 'recovery', title: 'เศรษฐกิจกลับสู่การฟื้นตัว', signal: 'ความเชื่อมั่นดีขึ้นอย่างไม่สม่ำเสมอ', returns_bps: { cash: 10, bonds: 80, stocks: 500 }, lesson: 'เป้าหมายไม่ใช่ชนะทุกเดือน แต่คือรอดครบวงจรและยังทำตามแผนได้' }
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

export function validateAllocation(allocation) {
  if (!allocation || ASSETS.some((asset) => !Number.isInteger(allocation[asset]) || allocation[asset] < 0 || allocation[asset] > 100)) {
    throw new InvestmentSimError('INVALID_ALLOCATION', 'สัดส่วนทุกสินทรัพย์ต้องเป็นจำนวนเต็ม 0–100');
  }
  if (ASSETS.reduce((sum, asset) => sum + allocation[asset], 0) !== 100) throw new InvestmentSimError('INVALID_ALLOCATION_TOTAL', 'สัดส่วนรวมต้องเท่ากับ 100%');
  return { cash: allocation.cash, bonds: allocation.bonds, stocks: allocation.stocks };
}

function allocate(total, allocation) {
  const cash = total * BigInt(allocation.cash) / 100n;
  const bonds = total * BigInt(allocation.bonds) / 100n;
  return { cash, bonds, stocks: total - cash - bonds };
}

function totalHoldings(holdings) { return ASSETS.reduce((sum, asset) => sum + moneyString(holdings[asset], asset), 0n); }
function applyBps(amount, bps) { return amount * BigInt(10_000 + bps) / 10_000n; }

export function startInvestmentSimulation({ starting_satang, goal_satang, allocation }) {
  const starting = moneyString(starting_satang, 'เงินเริ่มต้น');
  const goal = moneyString(goal_satang, 'เป้าหมาย');
  if (starting <= 0n) throw new InvestmentSimError('ZERO_START', 'เงินเริ่มต้นต้องมากกว่า 0');
  const safeAllocation = validateAllocation(allocation);
  const holdings = allocate(starting, safeAllocation);
  return Object.freeze({
    engine_version: INVESTMENT_SIM_VERSION,
    round: 0,
    starting_satang: starting.toString(),
    goal_satang: goal.toString(),
    holdings: Object.fromEntries(ASSETS.map((asset) => [asset, holdings[asset].toString()])),
    initial_allocation: safeAllocation,
    allocation: safeAllocation,
    peak_satang: starting.toString(),
    max_drawdown_bps: 0,
    history: Object.freeze([]),
    completed: false
  });
}

export function advanceInvestmentSimulation(game, targetAllocation) {
  if (!game || game.engine_version !== INVESTMENT_SIM_VERSION) throw new InvestmentSimError('INVALID_GAME', 'ข้อมูลเกมไม่ตรงกับ engine รุ่นนี้');
  if (game.completed || game.round >= MARKET_SCENARIOS.length) throw new InvestmentSimError('GAME_COMPLETE', 'สถานการณ์จำลองจบแล้ว');
  const allocation = validateAllocation(targetAllocation);
  const before = totalHoldings(game.holdings);
  const rebalanced = allocate(before, allocation);
  const scenario = MARKET_SCENARIOS[game.round];
  const afterHoldings = Object.fromEntries(ASSETS.map((asset) => [asset, applyBps(rebalanced[asset], scenario.returns_bps[asset])]));
  const after = ASSETS.reduce((sum, asset) => sum + afterHoldings[asset], 0n);
  const previousPeak = moneyString(game.peak_satang, 'ยอดสูงสุด');
  const peak = after > previousPeak ? after : previousPeak;
  const drawdownBps = peak > 0n ? Number((peak - after) * 10_000n / peak) : 0;
  const maxDrawdownBps = Math.max(Number(game.max_drawdown_bps || 0), drawdownBps);
  const round = game.round + 1;
  const completed = round === MARKET_SCENARIOS.length;
  const historyItem = Object.freeze({
    round,
    scenario_id: scenario.id,
    title: scenario.title,
    allocation,
    before_satang: before.toString(),
    after_satang: after.toString(),
    change_bps: before > 0n ? Number((after - before) * 10_000n / before) : 0,
    drawdown_bps: drawdownBps,
    returns_bps: scenario.returns_bps,
    lesson: scenario.lesson
  });
  return Object.freeze({
    ...game,
    round,
    holdings: Object.fromEntries(ASSETS.map((asset) => [asset, afterHoldings[asset].toString()])),
    allocation,
    peak_satang: peak.toString(),
    max_drawdown_bps: maxDrawdownBps,
    history: Object.freeze([...(game.history || []), historyItem]),
    completed
  });
}

export function summarizeInvestmentSimulation(game) {
  const finalValue = totalHoldings(game.holdings);
  const starting = moneyString(game.starting_satang, 'เงินเริ่มต้น');
  const goal = moneyString(game.goal_satang, 'เป้าหมาย');
  const totalReturnBps = starting > 0n ? Number((finalValue - starting) * 10_000n / starting) : 0;
  const allocationChanges = (game.history || []).reduce((sum, item, index, history) => {
    const prior = index === 0 ? validateAllocation(game.initial_allocation) : history[index - 1].allocation;
    return sum + ASSETS.reduce((inner, asset) => inner + Math.abs(item.allocation[asset] - prior[asset]), 0) / 2;
  }, 0);
  return Object.freeze({
    final_value_satang: finalValue,
    total_return_bps: totalReturnBps,
    max_drawdown_bps: Number(game.max_drawdown_bps || 0),
    goal_met: finalValue >= goal,
    allocation_turnover_points: allocationChanges,
    rounds_completed: game.round,
    completed: game.completed
  });
}
