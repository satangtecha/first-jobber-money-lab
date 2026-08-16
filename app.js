import { parseBaht, formatBaht, RulesError } from './rules.js';
import { routeDebt, cashBeforeDebt, ROUTES, DEBT_ENGINE_VERSION } from './debt-engine.js';
import { comparePayoffScenarios, PayoffEngineError } from './payoff-engine.js';
import { LEARNING_UNITS, unitsForRoute } from './learning-content.js';
import { createDebtAction, createDebtAssessment, deleteDebtAssessment, getSessionUser, listDebtAssessments, requestMagicLink } from './api-client.js';

const STORE_KEY = 'first-jobber-debt-navigator-v1';
const APP_SCHEMA_VERSION = 4;
const SENSITIVE_SCREENS = new Set(['intake-money', 'intake-status', 'intake-details', 'diagnosis', 'action-plan', 'portfolio', 'debt-editor', 'payoff', 'reminders', 'learn', 'lesson', 'history']);
const app = document.querySelector('#app');
const today = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const emptyDebtDraft = () => ({ creditorName: '', debtType: 'credit_card', balance: '', aprPercent: '', minimum: '', dueDay: '', status: 'current' });
const emptyReminderDraft = () => ({ title: '', dueDate: '' });

const initialState = () => ({
  schemaVersion: APP_SCHEMA_VERSION,
  screen: 'home',
  consent: false,
  notice: '',
  assessmentSaved: null,
  remoteAssessmentId: null,
  clientAssessmentId: null,
  deleteScope: 'local',
  actionStatus: 'not_started',
  actionEvidence: '',
  checkin: null,
  currentLesson: 0,
  lessonAnswerRevealed: false,
  lessonEvidence: '',
  debts: [],
  intakeDebtId: null,
  debtDraft: emptyDebtDraft(),
  editingDebtId: null,
  pendingDeleteDebtId: null,
  extraPayment: '',
  restructureEnabled: false,
  restructureDebtId: '',
  restructureApr: '',
  restructurePayment: '',
  snapshots: [],
  reminders: [],
  reminderDraft: emptyReminderDraft(),
  mastery: {},
  pilotEvents: [],
  lastVisitDate: '',
  input: {
    monthlyTakeHome: '',
    essentialLivingCosts: '',
    totalDebt: '',
    availableCash: '',
    payday: '',
    overdueBand: '',
    legalStage: '',
    legalStages: [],
    debtTypes: [],
    debtTypesComplete: null,
    unableToPay: false,
    creditDataDisputed: false,
    identityMisuseSuspected: false,
    creditorName: '',
    creditorChoice: '',
    accountBalance: '',
    currentMonthlyPayment: '',
    nextDueDate: '',
    proposedPayment: '',
    aprPercent: '',
    ageYears: '',
    bankrupt: null,
    nplOnCutoff: null,
    totalNcbNpl: '',
    amlSanctioned: null,
    clearDebtCreditorInScope: null,
    caseReference: '',
    legalDocumentDate: '',
    hearingDate: '',
    disputedAccountReference: '',
    evidenceAvailable: null
  },
  history: []
});

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    const fresh = initialState();
    if (!saved) return fresh;
    const loaded = { ...fresh, ...saved, input: { ...fresh.input, ...(saved.input || {}) } };
    const priorVersion = Number(saved.schemaVersion || 1);
    if (priorVersion < 2) {
      loaded.input.debtTypes = Array.isArray(saved.input?.debtTypes)
        ? saved.input.debtTypes
        : saved.input?.debtType ? [saved.input.debtType] : [];
      loaded.input.debtTypesComplete = null;
      loaded.input.overdueBand = '';
      loaded.input.legalStage = '';
      loaded.assessmentSaved = null;
      loaded.notice = 'อัปเดตความปลอดภัยแล้ว กรุณายืนยันสถานะหนี้และขั้นกฎหมายอีกครั้ง';
    }
    if (priorVersion < 4 || !Array.isArray(loaded.input.legalStages)) {
      loaded.input.legalStages = loaded.input.legalStage ? [loaded.input.legalStage] : [];
    }
    loaded.input.legalStage = effectiveLegalStage(loaded.input.legalStages);
    if (!loaded.input.creditorChoice && loaded.input.creditorName) {
      loaded.input.creditorChoice = 'other';
    }
    loaded.schemaVersion = APP_SCHEMA_VERSION;
    loaded.debtDraft = { ...emptyDebtDraft(), ...(loaded.debtDraft || {}) };
    loaded.reminderDraft = { ...emptyReminderDraft(), ...(loaded.reminderDraft || {}) };
    loaded.mastery = Object.fromEntries(Object.entries(loaded.mastery || {}).map(([id,value])=>[id,['mastered','verified'].includes(value)?'evidence_recorded':value]));
    if (!loaded.consent && SENSITIVE_SCREENS.has(loaded.screen)) loaded.screen = 'consent';
    return loaded;
  } catch {
    return initialState();
  }
};

let state = load();
let currentUser = null;
let sessionChecked = false;
let authEmailDraft = '';
let pendingFocusTarget = null;
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));
const PILOT_EVENTS = new Set(['route_completed','action_pack_opened','outcome_recorded','payoff_compared','snapshot_recorded','lesson_evidence_recorded','reminder_completed','next_cycle_return']);
function trackPilot(name, properties = {}) {
  if (!PILOT_EVENTS.has(name)) return;
  const safe = {};
  for (const key of ['route','status','unit_id']) if (typeof properties[key] === 'string') safe[key] = properties[key].slice(0,120);
  state.pilotEvents = [...(state.pilotEvents || []), { name, at: new Date().toISOString(), ...safe }].slice(-500);
}
if (state.lastVisitDate && state.lastVisitDate !== today()) trackPilot('next_cycle_return');
state.lastVisitDate = today();
save();
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const ROUTE_META = {
  [ROUTES.ENFORCEMENT_MEDIATION]: {
    tone: 'danger',
    label: 'คำพิพากษา/บังคับคดี',
    title: 'เก็บ deadline ก่อน แล้วขอไกล่เกลี่ยกับกรมบังคับคดี',
    metric: 'มีเลขคำร้อง วันนัด หรือข้อตกลงเป็นลายลักษณ์อักษร',
    source: 'https://www.led.go.th/news/view/19540',
    sourceLabel: 'กรมบังคับคดี',
    script: 'ต้องการขอไกล่เกลี่ยหลังคำพิพากษา เลขคดี ___ ปัจจุบันมีรายรับสุทธิ ___ บาท ค่าอยู่รอดจำเป็น ___ บาท และขอเสนอชำระ ___ บาทต่อเดือน กรุณาแจ้งขั้นตอน เอกสาร และวันนัดเป็นลายลักษณ์อักษร',
    checklist: ['ถ่ายหน้าเอกสารที่มีเลขคดีและ deadline', 'ติดต่อกรมบังคับคดี/สำนักงานจังหวัดจากช่องทางทางการ', 'เตรียมรายรับ ค่าอยู่รอด และข้อเสนอที่ทำได้จริง', 'อย่าเพิกเฉยต่อหมายหรือโอนเงินให้คนกลาง']
  },
  [ROUTES.SUMMONS_MEDIATION]: {
    tone: 'danger',
    label: 'มีหมายศาล',
    title: 'ตอบกระบวนการศาลก่อน deadline',
    metric: 'มีวันนัดและผลการเจรจาที่บันทึกไว้',
    source: 'https://www.led.go.th/news/view/19540',
    sourceLabel: 'ช่องทางไกล่เกลี่ยทางการ',
    script: 'ประสงค์เจรจาชำระหนี้ตามความสามารถ เลขคดี ___ ขอเสนอชำระ ___ บาทต่อเดือน และขอให้ระบุผลต่อดอกเบี้ย ค่าใช้จ่าย และคดีเป็นลายลักษณ์อักษร',
    checklist: ['บันทึกเลขคดี ศาล วันนัด และ deadline', 'อย่ารอให้แอปตัดสินแทนเอกสารศาล', 'เตรียม statement รายได้และค่าอยู่รอด', 'ขอคำแนะนำทางกฎหมายเมื่อมีทรัพย์ ผู้ค้ำ หรือข้อพิพาท']
  },
  [ROUTES.CREDIT_DATA_DISPUTE]: {
    tone: 'warning',
    label: 'ข้อมูลเครดิตมีข้อพิพาท',
    title: 'ขอเลขรับเรื่องและแก้ข้อมูลที่ต้นทาง',
    metric: 'ได้หนังสือตอบกลับ รายงานที่แก้ไข หรือบันทึกข้อโต้แย้ง',
    source: 'https://www.bot.or.th/th/satang-story/managing-debt/creditbureau.html',
    sourceLabel: 'สิทธิข้อมูลเครดิต — ธปท.',
    script: 'ขอให้ตรวจสอบและแก้ไขข้อมูลเครดิตบัญชี ___ เนื่องจาก ___ แนบหลักฐาน ___ ขอเลขรับเรื่องและผลตรวจสอบเป็นลายลักษณ์อักษร',
    checklist: ['ระบุรายการที่ผิดให้ชัดเจน', 'รวบรวมใบเสร็จ/หนังสือปิดบัญชี', 'แจ้งเจ้าหนี้ผู้ส่งข้อมูลก่อน', 'ยื่นตรวจสอบกับ NCB และเก็บ deadline อุทธรณ์']
  },
  [ROUTES.DEBT_CLINIC_CHECK]: {
    tone: 'warning',
    label: 'ตรวจสิทธิ์ Debt Clinic',
    title: 'เช็กบัญชีที่รวมได้ก่อนสมัครผ่าน SAM',
    metric: 'ได้ผลสิทธิ์ รายการบัญชีที่รวมได้ และค่างวดจริง',
    source: 'https://www.bot.or.th/th/debtsolution/debtsolution-measure.html',
    sourceLabel: 'Debt Clinic — ธปท./SAM',
    script: 'ขอตรวจสิทธิ์คลินิกแก้หนี้ บัญชีของฉันค้างเกิน 120 วัน ยอดรวม ___ บาท ขอทราบว่าบัญชีใดรวมได้ ค่างวด ดอกเบี้ย ระยะเวลา และยอดรวมที่ต้องจ่ายเท่าไร',
    checklist: ['ยืนยันวันค้างและประเภทหนี้ทุกบัญชี', 'เช็กเจ้าหนี้ที่เข้าร่วมจากช่องทางทางการ', 'ถามบัญชีที่รวมได้/ไม่ได้แยกกัน', 'รับแผนเมื่อค่างวดยังเหลือค่าอยู่รอด']
  },
  [ROUTES.CLEAR_DEBT_CHECK]: {
    tone: 'warning',
    label: 'ตรวจสิทธิ์ปิดหนี้ไว ไปต่อได้',
    title: 'ตรวจสิทธิ์กับ BOT/SAM ก่อนเลือกแผน',
    metric: 'ได้ผลตรวจสิทธิ์และ e-contract ที่ตรวจสอบได้',
    source: 'https://www.bot.or.th/th/cleardebt.html',
    sourceLabel: 'ปิดหนี้ไว ไปต่อได้ — ธปท.',
    script: 'ขอตรวจสิทธิ์โครงการปิดหนี้ไว ไปต่อได้ ยอด NPL ที่รายงาน ___ บาท กรุณายืนยันบัญชีที่เข้าโครงการ ทางเลือกปิดจบ/ผ่อน และช่องทางเซ็นสัญญาทางการ',
    checklist: ['ตรวจเกณฑ์วันที่ 30 ก.ย. 2568', 'ยืนยันยอด NPL รวมไม่เกิน 100,000 บาท', 'ใช้ LINE OA/ช่องทางที่ BOT หรือ SAM ระบุเท่านั้น', 'บันทึกผลสิทธิ์และ e-contract']
  },
  [ROUTES.DIRECT_RESTRUCTURING]: {
    tone: 'warning',
    label: 'ขอปรับโครงสร้างกับเจ้าหนี้',
    title: 'โทรหาเจ้าหนี้พร้อมตัวเลขที่ใช้เจรจา',
    metric: 'ได้ข้อเสนอที่มีค่างวด ดอกเบี้ย ระยะเวลา และยอดรวม',
    source: 'https://www.bot.or.th/th/satang-story/managing-debt/consumer-loan-restructuring.html',
    sourceLabel: 'การปรับโครงสร้างหนี้ — ธปท.',
    script: 'ขอปรับโครงสร้างหนี้เนื่องจากสภาพคล่องเปลี่ยน ปัจจุบันมีรายรับสุทธิ ___ บาท ค่าอยู่รอดจำเป็น ___ บาท และเสนอชำระ ___ บาทต่อเดือน ขอทางเลือกที่ระบุค่างวด ดอกเบี้ย ระยะเวลา ยอดรวม และวันครบกำหนดแรกเป็นลายลักษณ์อักษร',
    checklist: ['ตรวจยอดคงเหลือและวันครบกำหนดจาก statement', 'โทรจากเบอร์/แอปของเจ้าหนี้โดยตรง', 'บอกจำนวนที่จ่ายไหวหลังค่าอยู่รอด', 'อย่าตกลงจากค่างวดอย่างเดียว—ขอยอดรวมด้วย']
  },
  [ROUTES.PREVENTION]: {
    tone: 'safe',
    label: 'ยังไม่ค้าง',
    title: 'ยืนยันยอดและกันเงินก่อนวันครบกำหนด',
    metric: 'จ่ายตรงเวลาและไม่สร้างยอดหมุนเวียนเพิ่ม',
    source: 'https://www.bot.or.th/th/faqs/faqs-02.html',
    sourceLabel: 'คำถามเรื่องหนี้ — ธปท.',
    script: 'ขอยืนยันยอดคงเหลือ ยอดขั้นต่ำ วันครบกำหนด และอัตราดอกเบี้ยของบัญชี ___ เพื่อวางแผนจ่ายก่อนครบกำหนด',
    checklist: ['บันทึกยอด minimum และ due date', 'ตั้งเตือนก่อนครบกำหนด 3 วัน', 'กันค่าอยู่รอดก่อนเลือกเงินจ่ายเพิ่ม', 'เก็บใบเสร็จและเช็กยอดหลังจ่าย']
  }
};

const FIELD_LABELS = {
  overdue_band: 'จำนวนวันที่ค้าง',
  legal_stage: 'ขั้นกฎหมาย',
  debt_types: 'ประเภทหนี้',
  total_debt_satang: 'ยอดหนี้รวม',
  monthly_take_home_satang: 'รายรับสุทธิ',
  essential_living_costs_satang: 'ค่าอยู่รอดจำเป็น',
  creditor_name: 'ชื่อเจ้าหนี้',
  account_balance_satang: 'ยอดคงเหลือบัญชี',
  current_monthly_payment_satang: 'ค่างวด/ยอดขั้นต่ำ',
  next_due_date: 'วันครบกำหนดถัดไป',
  proposed_affordable_payment_satang: 'จำนวนที่คิดว่าจ่ายไหว',
  age_years: 'อายุ',
  bankrupt: 'สถานะล้มละลาย',
  case_reference: 'เลขคดี/เลขเอกสาร',
  legal_document_date: 'วันที่เอกสารกฎหมาย',
  hearing_date: 'วันนัด',
  disputed_account_reference: 'บัญชีที่มีข้อพิพาท',
  evidence_available: 'หลักฐานที่มี',
  clear_debt_creditor_in_scope: 'เจ้าหนี้อยู่ในขอบเขตโครงการ',
  aml_sanctioned: 'สถานะ AML',
  npl_on_2025_09_30: 'สถานะ NPL ณ 30 ก.ย. 2568',
  total_ncb_npl_satang: 'ยอด NPL ตาม NCB'
  ,debt_types_complete: 'ยืนยันว่าเลือกประเภทหนี้ครบทุกบัญชี'
};

const MISSING_TARGETS = Object.freeze({
  overdue_band: ['intake-status', 'overdueBand'], legal_stage: ['intake-status', 'legalStages'],
  debt_types: ['intake-details', 'debtTypes'], debt_types_complete: ['intake-details', 'debtTypesComplete'],
  total_debt_satang: ['intake-money', 'totalDebt'], monthly_take_home_satang: ['intake-money', 'monthlyTakeHome'],
  essential_living_costs_satang: ['intake-money', 'essentialLivingCosts'], creditor_name: ['intake-details', 'creditorName'],
  account_balance_satang: ['intake-details', 'accountBalance'], current_monthly_payment_satang: ['intake-details', 'currentMonthlyPayment'],
  next_due_date: ['intake-details', 'nextDueDate'], proposed_affordable_payment_satang: ['intake-details', 'proposedPayment'],
  age_years: ['intake-details', 'ageYears'], bankrupt: ['intake-details', 'bankrupt'],
  legal_document_date: ['intake-details', 'legalDocumentDate'], hearing_date: ['intake-details', 'hearingDate'],
  disputed_account_reference: ['intake-details', 'disputedAccountReference'], evidence_available: ['intake-details', 'evidenceAvailable'],
  clear_debt_creditor_in_scope: ['intake-details', 'clearDebtCreditorInScope'], aml_sanctioned: ['intake-details', 'amlSanctioned'],
  npl_on_2025_09_30: ['intake-details', 'nplOnCutoff'], total_ncb_npl_satang: ['intake-details', 'totalNcbNpl']
});

const DEBT_TYPE_LABELS = Object.freeze({
  credit_card: 'บัตรเครดิต', cash_card: 'บัตรกดเงินสด', unsecured_personal_loan: 'สินเชื่อส่วนบุคคล',
  vehicle_loan: 'รถ/จำนำทะเบียน', home_loan: 'บ้าน', student_loan: 'กยศ.', bnpl: 'BNPL/App loan', other: 'อื่น ๆ'
});

function effectiveLegalStage(values = []) {
  const selected = new Set(Array.isArray(values) ? values : []);
  return ['enforcement', 'judgment', 'summons', 'collection_only', 'none', 'unknown'].find((value) => selected.has(value)) || '';
}

const CREDITOR_OPTIONS = Object.freeze([
  { name: 'ธนาคารกสิกรไทย', short: 'K', color: '#168246' },
  { name: 'ธนาคารไทยพาณิชย์', short: 'S', color: '#5d2d91' },
  { name: 'ธนาคารกรุงไทย', short: 'K', color: '#179bd7' },
  { name: 'ธนาคารกรุงเทพ', short: 'B', color: '#244aa5' },
  { name: 'ธนาคารกรุงศรีอยุธยา', short: 'A', color: '#f3b500' },
  { name: 'ธนาคารทหารไทยธนชาต (ttb)', short: 't', color: '#f36b21' },
  { name: 'ธนาคารออมสิน', short: 'G', color: '#e65a9e' },
  { name: 'ยูโอบี', short: 'U', color: '#1d4e9c' },
  { name: 'เคทีซี', short: 'K', color: '#d71920' },
  { name: 'อิออน', short: 'A', color: '#6b2f91' }
]);

const MONEY_INPUT_FIELDS = new Set([
  'monthlyTakeHome', 'essentialLivingCosts', 'totalDebt', 'availableCash',
  'accountBalance', 'aprPercent', 'currentMonthlyPayment', 'proposedPayment', 'totalNcbNpl'
]);
const FIELD_TONES = Object.freeze({
  monthlyTakeHome: 'income', essentialLivingCosts: 'essential', totalDebt: 'debt',
  availableCash: 'cash', payday: 'date'
});

function moneyOrNull(value) {
  if (String(value ?? '').trim() === '') return null;
  return parseBaht(value);
}

function assessmentInput() {
  const i = state.input;
  const input = {
    overdue_band: i.overdueBand,
    legal_stage: effectiveLegalStage(i.legalStages),
    total_debt_satang: moneyOrNull(i.totalDebt),
    monthly_take_home_satang: moneyOrNull(i.monthlyTakeHome),
    essential_living_costs_satang: moneyOrNull(i.essentialLivingCosts),
    self_reported_unable_to_pay: Boolean(i.unableToPay),
    credit_data_disputed: Boolean(i.creditDataDisputed),
    identity_misuse_suspected: Boolean(i.identityMisuseSuspected)
  };
  if (Array.isArray(i.debtTypes) && i.debtTypes.length) input.debt_types = [...new Set(i.debtTypes)];
  if (i.debtTypesComplete !== null) input.debt_types_complete = i.debtTypesComplete;
  if (i.creditorName) input.creditor_name = i.creditorName;
  if (i.accountBalance) input.account_balance_satang = moneyOrNull(i.accountBalance);
  if (i.currentMonthlyPayment) input.current_monthly_payment_satang = moneyOrNull(i.currentMonthlyPayment);
  if (i.nextDueDate) input.next_due_date = i.nextDueDate;
  if (i.proposedPayment) input.proposed_affordable_payment_satang = moneyOrNull(i.proposedPayment);
  if (i.ageYears) input.age_years = Number(i.ageYears);
  if (i.bankrupt !== null) input.bankrupt = i.bankrupt;
  if (i.nplOnCutoff !== null) input.npl_on_2025_09_30 = i.nplOnCutoff;
  if (i.totalNcbNpl) input.total_ncb_npl_satang = moneyOrNull(i.totalNcbNpl);
  if (i.amlSanctioned !== null) input.aml_sanctioned = i.amlSanctioned;
  if (i.clearDebtCreditorInScope !== null) input.clear_debt_creditor_in_scope = i.clearDebtCreditorInScope;
  if (i.caseReference) input.case_reference = i.caseReference;
  if (i.legalDocumentDate) input.legal_document_date = i.legalDocumentDate;
  if (i.hearingDate) input.hearing_date = i.hearingDate;
  if (i.disputedAccountReference) input.disputed_account_reference = i.disputedAccountReference;
  if (i.evidenceAvailable !== null) input.evidence_available = i.evidenceAvailable;
  return input;
}

function currentAssessment() {
  try {
    const input = assessmentInput();
    return { input, result: routeDebt(input), cash: cashBeforeDebt(input) };
  } catch (error) {
    return { error };
  }
}

function parseAprBps(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new RulesError('INVALID_APR', 'ดอกเบี้ยต้องเป็นเปอร์เซ็นต์ เช่น 18 หรือ 18.25');
  const [whole, fraction = ''] = raw.split('.');
  const bps = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(bps) || bps < 0 || bps > 1_000_000) throw new RulesError('INVALID_APR', 'ดอกเบี้ยอยู่นอกช่วงที่รองรับ');
  return bps;
}

function reportedDebtTotal() {
  return (state.debts || []).reduce((sum, debt) => {
    try { return sum + parseBaht(debt.balance); } catch { return sum; }
  }, 0n);
}

function syncDebtFromIntake() {
  const i = state.input;
  if (!i.creditorName || !i.accountBalance || !(i.debtTypes || []).length) return;
  const id = state.intakeDebtId || crypto.randomUUID();
  const existing = (state.debts || []).find((debt) => debt.id === id);
  const dueDay = i.nextDueDate ? String(Number(i.nextDueDate.split('-')[2])) : (existing?.dueDay || '');
  const debt = {
    id,
    creditorName: i.creditorName,
    debtType: i.debtTypes[0],
    balance: i.accountBalance,
    aprPercent: i.aprPercent || existing?.aprPercent || '',
    minimum: i.currentMonthlyPayment || existing?.minimum || '',
    dueDay,
    status: i.overdueBand === '0' ? 'current' : 'overdue',
    source: 'route-check'
  };
  state.intakeDebtId = id;
  state.debts = existing ? state.debts.map((item) => item.id === id ? debt : item) : [...state.debts, debt];
}

function payoffInput() {
  const debts = (state.debts || []).map((debt) => ({
    id: debt.id,
    balance_satang: moneyOrNull(debt.balance),
    apr_bps: parseAprBps(debt.aprPercent),
    minimum_satang: moneyOrNull(debt.minimum)
  }));
  const input = { debts, extra_payment_satang: moneyOrNull(state.extraPayment) || 0n, max_months: 1_200 };
  if (state.restructureEnabled) {
    input.restructure_offer = {
      debt_id: state.restructureDebtId,
      apr_bps: parseAprBps(state.restructureApr),
      monthly_payment_satang: moneyOrNull(state.restructurePayment)
    };
  }
  return input;
}

function inputField(name, label, options = {}) {
  const type = options.type || 'text';
  const value = state.input[name] ?? '';
  const tone = options.tone || FIELD_TONES[name] || '';
  const inputMode = options.inputMode || (MONEY_INPUT_FIELDS.has(name) ? 'decimal' : 'text');
  return `<label class="input-card ${tone ? `tone-${tone}` : ''}" for="${name}" data-field-anchor="${name}">
    <span>${escapeHtml(label)}</span>
    ${options.hint ? `<small>${escapeHtml(options.hint)}</small>` : ''}
    <input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}"
      ${type === 'text' ? `inputmode="${inputMode}"` : ''}
      ${options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ''}>
  </label>`;
}

function radioCard(name, value, title, note, selected) {
  return `<label class="route-choice ${selected ? 'selected' : ''}">
    <input type="radio" name="${name}" value="${value}" ${selected ? 'checked' : ''}>
    <span class="route-check" aria-hidden="true">${selected ? '✓' : ''}</span>
    <span><b>${escapeHtml(title)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ''}</span>
  </label>`;
}

function checkboxCard(name, value, title, selected) {
  return `<label class="route-choice ${selected ? 'selected' : ''}">
    <input type="checkbox" name="${name}" value="${value}" ${selected ? 'checked' : ''}>
    <span class="route-check" aria-hidden="true">${selected ? '✓' : ''}</span>
    <span><b>${escapeHtml(title)}</b></span>
  </label>`;
}

function creditorPicker() {
  const i = state.input;
  const known = CREDITOR_OPTIONS.find((item) => item.name === i.creditorName);
  const selected = i.creditorChoice || known?.name || (i.creditorName ? 'other' : '');
  return `<section class="question-block creditor-block" data-field-anchor="creditorName">
    <h2>เจ้าหนี้หลักของบัญชีนี้</h2>
    <p class="muted">เลือกเพื่อกรอกเร็วขึ้น ถ้ามีหลายเจ้าหนี้ให้เริ่มจากบัญชีที่ต้องจัดการก่อน แล้วเพิ่มบัญชีอื่นใน Debt Map ได้</p>
    <div class="creditor-grid">${CREDITOR_OPTIONS.map((item) => `<button type="button" class="creditor-option ${selected===item.name?'selected':''}" data-action="select-creditor" data-creditor="${escapeHtml(item.name)}" aria-pressed="${selected===item.name}" style="--creditor:${item.color}"><span aria-hidden="true">${item.short}</span><b>${escapeHtml(item.name)}</b></button>`).join('')}
      <button type="button" class="creditor-option ${selected==='other'?'selected':''}" data-action="select-creditor" data-creditor="other" aria-pressed="${selected==='other'}" style="--creditor:#67737c"><span aria-hidden="true">＋</span><b>เจ้าหนี้อื่น</b></button>
    </div>
    ${selected === 'other' ? inputField('creditorName','พิมพ์ชื่อเจ้าหนี้',{placeholder:'เช่น บริษัทสินเชื่อ A',inputMode:'text'}) : ''}
  </section>`;
}

function progressHeader(step, title, note) {
  return `<section class="wizard-heading">
    <span class="eyebrow">ROUTE CHECK · ${step}/3</span>
    <div class="step-track" aria-label="ขั้นที่ ${step} จาก 3"><i style="width:${step * 33.34}%"></i></div>
    <h1>${escapeHtml(title)}</h1><p>${escapeHtml(note)}</p>
  </section>`;
}

function cockpitIllustration() {
  return `<svg class="hero-illustration" viewBox="0 0 420 280" role="img" aria-label="ภาพแผนที่หนี้และเส้นทางแก้ไข">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#61c8aa"/><stop offset="1" stop-color="#8ea8ff"/></linearGradient></defs>
    <rect x="38" y="30" width="344" height="210" rx="38" fill="#102d3e"/>
    <path d="M76 182 C128 122 164 214 214 145 S305 73 349 104" fill="none" stroke="url(#g)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="77" cy="182" r="19" fill="#fff"/><circle cx="214" cy="145" r="19" fill="#fff"/><circle cx="349" cy="104" r="19" fill="#fff"/>
    <rect x="82" y="55" width="105" height="17" rx="8" fill="#ffffff35"/><rect x="82" y="82" width="70" height="10" rx="5" fill="#ffffff22"/>
    <rect x="270" y="170" width="70" height="45" rx="14" fill="#fff"/><path d="M286 193l11 10 24-28" fill="none" stroke="#147a69" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

function topBar() {
  return `<header class="top">
    <button class="icon-button" data-action="back" aria-label="ย้อนกลับ" ${state.screen === 'home' ? 'disabled' : ''}>‹</button>
    <button class="brand" data-screen="home"><span class="brand-mark">F</span> First Jobber</button>
    <button class="icon-button" data-screen="data" aria-label="ข้อมูลและความเป็นส่วนตัว">⋯</button>
  </header>`;
}

function bottomNav() {
  const items = [
    ['home', 'home', '⌂', 'วันนี้'],
    ['portfolio', state.consent ? 'portfolio' : 'consent', '◇', 'แผนหนี้'],
    ['learn', state.consent ? 'learn' : 'consent', '▤', 'เรียน'],
    ['history', state.consent ? 'history' : 'consent', '↗', 'ประวัติ']
  ];
  return `<nav class="bottom-nav" aria-label="เมนูหลัก">${items.map(([key, screen, icon, label]) =>
    `<button class="nav-item ${state.screen === key ? 'active' : ''}" data-screen="${screen}"><span>${icon}</span>${label}</button>`
  ).join('')}</nav>`;
}

function homeView() {
  const assessment = currentAssessment();
  const ready = !assessment.error && state.input.totalDebt && state.input.monthlyTakeHome;
  const meta = ready ? ROUTE_META[assessment.result.route] : null;
  const portfolioTotal = reportedDebtTotal();
  const total = portfolioTotal > 0n ? formatBaht(portfolioTotal) : state.input.totalDebt ? formatBaht(parseBaht(state.input.totalDebt)) : '—';
  return `<section class="new-hero">
    <div><span class="eyebrow">FIRST JOBBER DEBT NAVIGATOR</span>
      <h1>รู้ว่าเคสคุณต้องทำอะไรต่อ</h1>
      <p>เช็กเส้นทาง เตรียมคำพูด และเก็บหลักฐานให้จบในที่เดียว</p>
      <button class="primary hero-cta" data-screen="consent">${ready ? 'อัปเดตข้อมูลเคส' : 'เช็กเคสของฉัน'} <span>→</span></button>
    </div>${cockpitIllustration()}
  </section>
  <section class="dashboard-grid">
    <article class="debt-total-card"><span class="eyebrow">ยอดที่คุณรายงาน</span><strong>${total}</strong>
      <div class="mini-debt-map" aria-label="ภาพรวมยอดหนี้"><i></i><i></i><i></i><i></i></div>
      <small>${state.debts.length ? `${state.debts.length} บัญชี · ` : ''}แก้ไขได้ตลอด · ไม่ใช่ข้อมูลเครดิตบูโร</small>
    </article>
    <article class="next-action-card ${meta?.tone || ''}">
      <span class="eyebrow">ทำต่อวันนี้</span>
      <h2>${meta ? escapeHtml(meta.title) : 'เริ่ม Route Check 7 ข้อ'}</h2>
      <p>${meta ? escapeHtml(meta.metric) : 'ใช้เวลาประมาณ 5–8 นาที'}</p>
      <button class="text-action" data-screen="${meta ? 'diagnosis' : 'consent'}">${meta ? 'ดู Action Pack' : 'เริ่มเลย'} →</button>
    </article>
  </section>
  <section class="feature-ribbon">
    <div><span>01</span><b>รู้ route</b><small>ก่อนค้าง / NPL / ศาล / dispute</small></div>
    <div><span>02</span><b>มี script</b><small>ตัวเลขพร้อมใช้คุยเจ้าหนี้</small></div>
    <div><span>03</span><b>เก็บผล</b><small>เลขรับเรื่อง ข้อเสนอ และวันนัด</small></div>
  </section>`;
}

function consentView() {
  return `<section class="consent-panel">
    <span class="eyebrow">ก่อนเริ่ม · 30 วินาที</span><h1>ข้อมูลนี้ใช้คัดเส้นทาง ไม่ได้ตัดสินแทนเจ้าหนี้</h1>
    <div class="privacy-visual" aria-hidden="true"><span>●</span><i></i><span>✓</span></div>
    <ul class="plain-list">
      <li>กรอกเท่าที่รู้ เลือก “ไม่แน่ใจ” ได้</li>
      <li>ไม่ต้องใส่ OTP รหัสผ่าน หรือเลขบัตรเต็ม</li>
      <li>ผลเป็นการคัดกรอง ไม่ใช่คำรับรองสิทธิ์หรือคำแนะนำกฎหมาย</li>
    </ul>
    <label class="consent-check"><input id="consent" type="checkbox" ${state.consent ? 'checked' : ''}> ฉันเข้าใจและต้องการเริ่ม</label>
    <button class="primary" data-screen="intake-money" ${state.consent ? '' : 'disabled'}>เริ่ม Route Check <span>→</span></button>
  </section>`;
}

function moneyIntakeView() {
  return `${progressHeader(1, 'เงินเดือนหนึ่งเดือนเหลือเท่าไรจริง', 'เริ่มจากค่าอยู่รอดก่อนหนี้ เพื่อไม่สร้างแผนที่จ่ายแล้วอยู่ไม่ได้')}
  <div class="form-grid">
    ${inputField('monthlyTakeHome', 'รายรับสุทธิต่อเดือน', { placeholder: '25,000' })}
    ${inputField('essentialLivingCosts', 'ค่าอยู่รอดจำเป็นต่อเดือน', { placeholder: '14,000', hint: 'บ้าน อาหาร เดินทาง ค่าน้ำไฟ และการรักษา' })}
    ${inputField('totalDebt', 'ยอดหนี้รวมโดยประมาณ', { placeholder: '80,000' })}
    ${inputField('availableCash', 'เงินที่ใช้ได้ตอนนี้', { placeholder: '5,000', hint: 'เงินสด/เงินในบัญชีที่ใช้จ่ายได้จริง หลังหักเงินที่กันไว้แล้ว' })}
    ${inputField('payday', 'วันเงินเดือนออกครั้งถัดไป', { type: 'date' })}
  </div>
  <section class="runway-explainer"><span aria-hidden="true">↗</span><div><b>Payday runway คืออะไร?</b><p>จำนวนวันที่เงินที่มีตอนนี้ต้องพอใช้ไปจนถึงวันเงินเดือนออก ระบบหารเป็น “เพดานใช้ต่อวัน” เบื้องต้นให้ แต่ยังไม่หักบิลหรือหนี้ที่จะครบกำหนด</p><div class="runway-preview-host">${paydayRunwayPreview()}</div></div></section>
  <aside class="live-balance" aria-live="polite">${liveBalance()}</aside>
  <button class="primary" data-action="money-next">ต่อไป: สถานะหนี้ <span>→</span></button>`;
}

function paydayRunwayPreview() {
  try {
    const cash = moneyOrNull(state.input.availableCash);
    if (cash === null || !state.input.payday) return '<small>กรอกเงินที่ใช้ได้และวันเงินออก แล้วจะเห็นจำนวนวันกับเพดานใช้ต่อวัน</small>';
    const start = new Date(`${today()}T00:00:00+07:00`);
    const end = new Date(`${state.input.payday}T00:00:00+07:00`);
    const days = Math.ceil((end - start) / 86_400_000);
    if (!Number.isFinite(days) || days < 0) return '<small class="runway-warning">วันเงินออกต้องเป็นวันนี้หรือวันข้างหน้า</small>';
    if (days === 0) return `<small>วันนี้เป็นวันเงินออก · เงินที่ใช้ได้ตอนนี้ ${formatBaht(cash)}</small>`;
    return `<div class="runway-preview"><strong>${days} วัน</strong><span>เพดานเบื้องต้น ${formatBaht(cash / BigInt(days))}/วัน</span></div>`;
  } catch {
    return '<small class="runway-warning">ตรวจรูปแบบเงินที่ใช้ได้</small>';
  }
}

function liveBalance() {
  try {
    const income = moneyOrNull(state.input.monthlyTakeHome);
    const essentials = moneyOrNull(state.input.essentialLivingCosts);
    if (income === null || essentials === null) return '<b>กรอกสองช่องแรก</b><span>แล้วจะเห็นเงินก่อนจ่ายหนี้</span>';
    const remaining = income - essentials;
    return `<b>${formatBaht(remaining)}</b><span>เงินก่อนจ่ายหนี้ · จากข้อมูลที่กรอก</span><div class="balance-bar"><i style="width:${income > 0n ? Math.max(0, Math.min(100, Number(remaining * 100n / income))) : 0}%"></i></div>`;
  } catch {
    return '<b>ตรวจรูปแบบตัวเลข</b><span>ใช้เลขจำนวนเงิน เช่น 25000</span>';
  }
}

function statusIntakeView() {
  const i = state.input;
  const overdue = [
    ['0', 'ยังไม่ค้าง', 'จ่ายปกติ'],
    ['1_89', 'ค้าง 1–89 วัน', 'หรือรู้ว่างวดหน้าจ่ายไม่ไหว'],
    ['90_119', 'ค้าง 90–119 วัน', 'เริ่มเป็น NPL'],
    ['120_plus', 'ค้าง 120+ วัน', 'อาจตรวจสิทธิ์ Debt Clinic'],
    ['unknown', 'ไม่แน่ใจ', 'ระบบจะบอกวิธีหาข้อมูล']
  ];
  const legal = [
    ['none', 'ยังไม่มีเอกสารกฎหมาย'],
    ['collection_only', 'มีการทวงถาม'],
    ['summons', 'ได้รับหมายศาล'],
    ['judgment', 'มีคำพิพากษา'],
    ['enforcement', 'มีหนังสือบังคับคดี/อายัด'],
    ['unknown', 'ไม่แน่ใจ']
  ];
  return `${progressHeader(2, 'ตอนนี้เคสอยู่จุดไหน', 'คำตอบนี้สำคัญกว่า “เป็นหนี้ดีหรือหนี้เสีย” เพราะกำหนด deadline และช่องทางช่วยเหลือ')}
  <section class="question-block" data-field-anchor="overdueBand"><h2>บัญชีที่ค้างนานที่สุด</h2><div class="choice-grid">${overdue.map(([v,t,n]) => radioCard('overdueBand',v,t,n,i.overdueBand===v)).join('')}</div></section>
  <section class="question-block" data-field-anchor="legalStages"><h2>มีเอกสารหรือขั้นกฎหมายอะไรบ้าง</h2><p class="muted">เลือกได้หลายข้อเมื่อคนละบัญชีหรือมีเอกสารมากกว่าหนึ่งขั้น ระบบจะใช้ขั้นที่เร่งด่วนที่สุดเพื่อไม่ให้พลาด deadline</p><div class="choice-grid compact">${legal.map(([v,t]) => checkboxCard('legalStages',v,t,(i.legalStages || []).includes(v))).join('')}</div></section>
  <button class="primary" data-action="status-next">ต่อไป: รายละเอียดบัญชี <span>→</span></button>`;
}

function detailsIntakeView() {
  const i = state.input;
  const debtTypes = Object.entries(DEBT_TYPE_LABELS);
  const legal = (i.legalStages || []).some((value) => ['summons','judgment','enforcement'].includes(value));
  const hasSummons = (i.legalStages || []).includes('summons');
  const hasEnforcement = (i.legalStages || []).some((value) => ['judgment','enforcement'].includes(value));
  const clinic = i.overdueBand === '120_plus';
  const clearDebt = i.overdueBand === '90_119' || i.overdueBand === '120_plus';
  return `${progressHeader(3, 'เติมเฉพาะข้อมูลที่เปลี่ยนทางแก้', 'ไม่รู้ช่องไหนให้เว้นไว้ ระบบจะแสดง checklist แทนการเดา')}
  <section class="question-block" data-field-anchor="debtTypes"><h2>ประเภทหนี้ที่คุณมีทั้งหมด</h2><p class="muted">เลือกได้หลายข้อ เพราะสิทธิ์บางโครงการใช้ “ทุกบัญชี” ไม่ใช่เฉพาะบัญชีหลัก</p><div class="choice-grid compact">${debtTypes.map(([v,t]) => checkboxCard('debtTypes',v,t,(i.debtTypes || []).includes(v))).join('')}</div></section>
  ${yesNoBlock('debtTypesComplete','เลือกประเภทหนี้ครบทุกบัญชีแล้วหรือยัง',i.debtTypesComplete)}
  ${creditorPicker()}
  <div class="form-grid">
    ${inputField('accountBalance','ยอดคงเหลือบัญชีนี้',{placeholder:'80,000'})}
    ${inputField('aprPercent','ดอกเบี้ยต่อปี (APR/EIR %)',{placeholder:'18',hint:'ไม่รู้ให้เว้นไว้ ระบบจะไม่จำลอง'})}
    ${inputField('currentMonthlyPayment','ค่างวด/ยอดขั้นต่ำปัจจุบัน',{placeholder:'3,500'})}
    ${inputField('nextDueDate','วันครบกำหนดถัดไป',{type:'date'})}
    ${inputField('proposedPayment','จำนวนที่คุณคิดว่าจ่ายไหว',{placeholder:'2,500',hint:'ระบบไม่ส่งจำนวนนี้ให้เจ้าหนี้อัตโนมัติ'})}
    ${clinic ? inputField('ageYears','อายุ',{type:'number',placeholder:'24'}) : ''}
    ${legal ? inputField('caseReference','เลขอ้างอิงคดี/เอกสาร (ไม่บังคับ)',{placeholder:'ชื่อเล่นหรือ 4 ตัวท้ายก็พอ',hint:'ไม่ใช้ตัดสิน route เก็บไว้ช่วยจำเท่านั้น ไม่ต้องใส่เลขเต็ม'}) : ''}
    ${hasEnforcement ? inputField('legalDocumentDate','วันที่บนเอกสารกฎหมาย',{type:'date',hint:'ใช้เตือน deadline ไม่ใช้ยืนยันตัวตน'}) : ''}
    ${hasSummons ? inputField('hearingDate','วันนัด/deadline',{type:'date'}) : ''}
    ${(i.creditDataDisputed || i.identityMisuseSuspected) ? inputField('disputedAccountReference','บัญชีที่ต้องการให้ตรวจสอบ (ไม่บังคับ)',{placeholder:'ชื่อเล่นหรือ 4 ตัวท้าย',hint:'ไม่ต้องใส่เลขบัญชีเต็ม'}) : ''}
    ${clearDebt ? inputField('totalNcbNpl','ยอด NPL รวมตามที่ทราบ',{placeholder:'95,000'}) : ''}
  </div>
  <div class="toggle-grid">
    <label><input type="checkbox" id="unableToPay" ${i.unableToPay?'checked':''}> งวดหน้าจ่ายไม่ไหว</label>
    <label><input type="checkbox" id="creditDataDisputed" ${i.creditDataDisputed?'checked':''}> ข้อมูลยอด/ประวัติไม่ถูกต้อง</label>
    <label><input type="checkbox" id="identityMisuseSuspected" ${i.identityMisuseSuspected?'checked':''}> สงสัยถูกสวมสิทธิ์</label>
  </div>
  ${clinic ? yesNoBlock('bankrupt','อยู่ระหว่างล้มละลายหรือไม่',i.bankrupt) : ''}
  ${clearDebt ? yesNoBlock('nplOnCutoff','เป็น NPL ณ 30 ก.ย. 2568 หรือไม่',i.nplOnCutoff) : ''}
  ${clearDebt ? yesNoBlock('clearDebtCreditorInScope','เจ้าหนี้อยู่ในขอบเขตโครงการหรือไม่',i.clearDebtCreditorInScope) : ''}
  ${clearDebt ? yesNoBlock('amlSanctioned','อยู่ในรายชื่อ AML sanction หรือไม่',i.amlSanctioned) : ''}
  <button class="primary" data-action="diagnose">สร้างแผนแก้หนี้ของฉัน <span>→</span></button>`;
}

function yesNoBlock(name, label, value) {
  return `<section class="binary-block" data-field-anchor="${name}"><h2>${escapeHtml(label)}</h2>
    ${radioCard(name,'yes','ใช่','',value===true)}${radioCard(name,'no','ไม่ใช่','',value===false)}
    ${radioCard(name,'unknown','ไม่แน่ใจ','ระบบจะไม่ถือว่าเข้าเกณฑ์',value===null)}
  </section>`;
}

function debtValue(value) {
  try { return formatBaht(parseBaht(value)); } catch { return 'ข้อมูลไม่ครบ'; }
}

function snapshotChart() {
  const points = (state.snapshots || []).slice(-8);
  if (points.length < 2) return '<p class="muted">บันทึกยอดอย่างน้อย 2 ครั้ง แล้วจะเห็นแนวโน้มที่รายงาน</p>';
  const values = points.map((item) => BigInt(item.total_satang));
  const max = values.reduce((current, value) => value > current ? value : current, 1n);
  const coordinates = values.map((value, index) => {
    const x = points.length === 1 ? 0 : Math.round(index * 280 / (points.length - 1));
    const y = 78 - Number(value * 68n / max);
    return `${x},${y}`;
  }).join(' ');
  const change = values.at(-1) - values.at(-2);
  return `<svg class="snapshot-chart" viewBox="0 0 280 84" role="img" aria-label="ยอดหนี้ที่ผู้ใช้รายงาน ${points.length} ครั้ง"><polyline points="${coordinates}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <p><b>${change === 0n ? 'ยอดล่าสุดเท่าเดิม' : `${change < 0n ? 'ลดลง' : 'เพิ่มขึ้น'} ${formatBaht(change < 0n ? -change : change)}`}</b> จากครั้งก่อน · เป็นยอดที่ผู้ใช้รายงาน</p>`;
}

function portfolioView() {
  const debts = state.debts || [];
  const total = reportedDebtTotal();
  return `<section class="portfolio-hero"><div><span class="eyebrow">DEBT MAP</span><h1>เห็นทุกก้อน ก่อนเลือกว่าจะจ่ายแบบไหน</h1><p>APR, minimum และวันครบกำหนดคือข้อมูลที่ทำให้แผนต่างจากการเดา</p></div><button class="secondary" data-action="add-debt">+ เพิ่มบัญชี</button></section>
  <section class="portfolio-summary"><div><span>ยอดที่รายงาน</span><strong>${formatBaht(total)}</strong><small>${debts.length} บัญชี</small></div><div class="snapshot-panel"><span class="eyebrow">PROGRESS</span>${snapshotChart()}<button class="text-action" data-action="save-snapshot" ${debts.length?'':'disabled'}>บันทึกยอดวันนี้ →</button></div></section>
  ${debts.length ? `<div class="debt-card-grid">${debts.map((debt) => {
    const missing = [!debt.aprPercent && 'APR', !debt.minimum && 'ยอดขั้นต่ำ', !debt.dueDay && 'วันครบกำหนด'].filter(Boolean);
    return `<article class="debt-card"><div class="debt-card-top"><span class="debt-type">${escapeHtml(DEBT_TYPE_LABELS[debt.debtType] || debt.debtType)}</span><span class="status-dot">${debt.status === 'overdue' ? 'ค้าง/เสี่ยงค้าง' : 'ปกติ'}</span></div>
      <h2>${escapeHtml(debt.creditorName)}</h2><strong>${debtValue(debt.balance)}</strong>
      <div class="debt-facts"><span>ดอกเบี้ย<b>${debt.aprPercent ? `${escapeHtml(debt.aprPercent)}%` : 'ยังไม่รู้'}</b></span><span>ขั้นต่ำ<b>${debt.minimum ? debtValue(debt.minimum) : 'ยังไม่รู้'}</b></span><span>ครบกำหนด<b>${debt.dueDay ? `วันที่ ${escapeHtml(debt.dueDay)}` : 'ยังไม่รู้'}</b></span></div>
      ${missing.length ? `<div class="missing-inline">ขาด: ${missing.join(' · ')}</div>` : '<div class="ready-inline">พร้อมจำลอง</div>'}
      ${state.pendingDeleteDebtId === debt.id ? `<div class="inline-confirm"><b>ลบบัญชีนี้จากอุปกรณ์?</b><button data-action="confirm-delete-debt" data-id="${debt.id}">ลบ</button><button data-action="cancel-delete-debt">ยกเลิก</button></div>` : `<div class="card-actions"><button data-action="edit-debt" data-id="${debt.id}">แก้ไข</button><button data-action="delete-debt" data-id="${debt.id}">ลบ</button></div>`}
    </article>`;
  }).join('')}</div>
  <div class="portfolio-actions"><button class="primary" data-screen="payoff">เปิด Payoff Lab <span>→</span></button><button class="secondary" data-screen="reminders">งานติดตามและวันนัด</button></div>` : `<section class="empty-history"><div>◇</div><h2>ยังไม่มีบัญชีใน Debt Map</h2><p>เพิ่มยอดคงเหลือ APR ยอดขั้นต่ำ และวันครบกำหนดทีละบัญชี</p><button class="primary" data-action="add-debt">เพิ่มบัญชีแรก <span>→</span></button><button class="text-action" data-screen="intake-money">หรือเริ่ม Route Check</button></section>`}`;
}

function debtEditorView() {
  const debt = state.debtDraft || emptyDebtDraft();
  return `<section class="editor-hero"><span class="eyebrow">${state.editingDebtId ? 'EDIT DEBT' : 'ADD DEBT'}</span><h1>${state.editingDebtId ? 'แก้ข้อมูลบัญชี' : 'เพิ่มบัญชีใน Debt Map'}</h1><p>ไม่รู้ APR หรือ minimum ให้เว้นได้ แต่ Payoff Lab จะยังไม่คำนวณ</p></section>
  <div class="form-grid debt-editor-form">
    <label class="input-card" for="debtDraft_creditorName"><span>ชื่อเจ้าหนี้</span><input id="debtDraft_creditorName" value="${escapeHtml(debt.creditorName)}" placeholder="เช่น ธนาคาร A"></label>
    <label class="input-card" for="debtDraft_debtType"><span>ประเภทหนี้</span><select id="debtDraft_debtType">${Object.entries(DEBT_TYPE_LABELS).map(([value,label])=>`<option value="${value}" ${debt.debtType===value?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label>
    <label class="input-card" for="debtDraft_balance"><span>ยอดคงเหลือ</span><input id="debtDraft_balance" inputmode="decimal" value="${escapeHtml(debt.balance)}" placeholder="80000"></label>
    <label class="input-card" for="debtDraft_aprPercent"><span>APR/EIR ต่อปี (%)</span><input id="debtDraft_aprPercent" inputmode="decimal" value="${escapeHtml(debt.aprPercent)}" placeholder="18"></label>
    <label class="input-card" for="debtDraft_minimum"><span>ยอดขั้นต่ำ/ค่างวด</span><input id="debtDraft_minimum" inputmode="decimal" value="${escapeHtml(debt.minimum)}" placeholder="3500"></label>
    <label class="input-card" for="debtDraft_dueDay"><span>ครบกำหนดวันที่</span><input id="debtDraft_dueDay" type="number" min="1" max="31" value="${escapeHtml(debt.dueDay)}" placeholder="25"></label>
    <label class="input-card" for="debtDraft_status"><span>สถานะ</span><select id="debtDraft_status"><option value="current" ${debt.status==='current'?'selected':''}>จ่ายปกติ</option><option value="overdue" ${debt.status==='overdue'?'selected':''}>ค้าง/เสี่ยงค้าง</option></select></label>
  </div>
  <div class="button-row"><button class="secondary" data-screen="portfolio">ยกเลิก</button><button class="primary" data-action="save-debt">บันทึกบัญชี <span>→</span></button></div>`;
}

function remindersView() {
  const reminders = state.reminders || [];
  return `<section class="editor-hero"><span class="eyebrow">FOLLOW-UP</span><h1>งานที่ต้องทำและวันนัด</h1><p>เป็นรายการติดตามในแอป ยังไม่ใช่การแจ้งเตือนจากระบบโทรศัพท์</p></section>
  <div class="reminder-create"><label class="input-card" for="reminderDraft_title"><span>งานที่ต้องทำ</span><input id="reminderDraft_title" value="${escapeHtml(state.reminderDraft.title)}" placeholder="โทรขอเลขรับเรื่อง"></label><label class="input-card" for="reminderDraft_dueDate"><span>วันที่</span><input id="reminderDraft_dueDate" type="date" value="${escapeHtml(state.reminderDraft.dueDate)}"></label><button class="secondary" data-action="save-reminder">เพิ่มงาน</button></div>
  ${reminders.length ? `<div class="reminder-list">${reminders.slice().sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map((item)=>`<article class="${item.done?'done':''}"><button data-action="toggle-reminder" data-id="${item.id}" aria-label="${item.done?'ทำเครื่องหมายว่ายังไม่เสร็จ':'ทำเครื่องหมายว่าเสร็จ'}">${item.done?'✓':'○'}</button><div><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.dueDate)}</span></div></article>`).join('')}</div>` : '<section class="empty-history"><h2>ยังไม่มีงานติดตาม</h2><p>เพิ่มวันโทรกลับ วันส่งเอกสาร หรือวันนัดจากข้อเสนอจริง</p></section>'}`;
}

function payoffView() {
  const debts = state.debts || [];
  if (!debts.length) return `<section class="empty-history"><div>↔</div><h1>ยังไม่มีหนี้ให้จำลอง</h1><p>เพิ่มบัญชีพร้อมยอดคงเหลือ APR และยอดขั้นต่ำก่อน</p><button class="primary" data-action="add-debt">เพิ่มบัญชี <span>→</span></button></section>`;
  const missing = debts.flatMap((debt) => [
    !debt.balance && `${debt.creditorName}: ยอดคงเหลือ`,
    !debt.aprPercent && `${debt.creditorName}: APR/EIR`,
    !debt.minimum && `${debt.creditorName}: ยอดขั้นต่ำ`
  ].filter(Boolean));
  let comparison = null;
  let calculationError = '';
  if (!missing.length) {
    try { comparison = comparePayoffScenarios(payoffInput()); }
    catch (error) { calculationError = error instanceof PayoffEngineError || error instanceof RulesError ? error.message : 'คำนวณไม่ได้ กรุณาตรวจข้อมูล'; }
  }
  const scenarios = comparison ? [
    ['baseline','แผนปัจจุบัน','จ่ายขั้นต่ำ แล้วส่งเงินที่เหลือเข้าบัญชีตามลำดับ'],
    ['avalanche','Avalanche','ส่งเงินเพิ่มไป APR สูงสุดก่อน'],
    ['snowball','Snowball','ส่งเงินเพิ่มไปยอดเล็กสุดก่อน'],
    ...(comparison.restructure_offer ? [['restructure_offer','ข้อเสนอเจ้าหนี้','ใช้ APR และค่างวดจากข้อเสนอที่คุณกรอก']] : [])
  ] : [];
  const paidMonths = scenarios.map(([key])=>comparison[key].payoff_month_count || 0);
  const maxMonths = Math.max(1,...paidMonths);
  return `<section class="payoff-hero"><div><span class="eyebrow">PAYOFF LAB</span><h1>เทียบทางเลือกด้วยงบต่อเดือนเท่าเดิม</h1><p>เป็นประมาณการเพื่อถามคำถามให้ถูก ไม่ใช่คำรับรองยอดจริงหรือข้อเสนอจากเจ้าหนี้</p></div><div class="lab-orb">↔</div></section>
  <section class="lab-controls card"><label class="input-card" for="extraPayment"><span>เงินเพิ่มต่อเดือน</span><small>นอกเหนือจากยอดขั้นต่ำทุกบัญชี</small><input id="extraPayment" inputmode="decimal" value="${escapeHtml(state.extraPayment)}" placeholder="500"></label>
    <label class="toggle-control"><input id="restructureEnabled" type="checkbox" ${state.restructureEnabled?'checked':''}> มีข้อเสนอปรับโครงสร้างจริงให้เทียบ</label>
    ${state.restructureEnabled ? `<div class="restructure-grid"><label>บัญชี<select id="restructureDebtId"><option value="">เลือกบัญชี</option>${debts.map(debt=>`<option value="${debt.id}" ${state.restructureDebtId===debt.id?'selected':''}>${escapeHtml(debt.creditorName)}</option>`).join('')}</select></label><label>APR ใหม่ (%)<input id="restructureApr" inputmode="decimal" value="${escapeHtml(state.restructureApr)}"></label><label>ค่างวดใหม่<input id="restructurePayment" inputmode="decimal" value="${escapeHtml(state.restructurePayment)}"></label></div>` : ''}
    <button class="secondary" data-action="recalculate-payoff">คำนวณใหม่</button>
  </section>
  ${missing.length ? `<section class="missing-card"><span class="eyebrow">ยังไม่จำลอง</span><h2>เติมข้อมูลที่มีผลต่อดอกเบี้ยก่อน</h2><div class="missing-chips">${missing.map(item=>`<span>${escapeHtml(item)}</span>`).join('')}</div><button class="text-action" data-screen="portfolio">กลับไป Debt Map →</button></section>` : calculationError ? `<section class="error-panel" role="alert"><h2>ยังคำนวณไม่ได้</h2><p>${escapeHtml(calculationError)}</p></section>` : `<section class="scenario-grid">${scenarios.map(([key,label,note]) => {
    const result = comparison[key];
    const paid = result.status === 'paid_off';
    const width = paid ? Math.max(8,Math.round(result.payoff_month_count * 100 / maxMonths)) : 100;
    const reason = ({non_amortizing_payment:'ยอดจ่ายไม่ครอบคลุมดอกเบี้ย',max_month_guard_reached:'เกินขอบเขต 1,200 เดือน',insolvent_payment_zero:'ไม่มีงบชำระ',monthly_budget_below_declared_minimums:'ค่างวดข้อเสนอสูงกว่างบเดิม'})[result.reason] || 'ยังไม่เห็นวันปิด';
    const baselineInterest = comparison.baseline.total_interest_satang;
    const saving = paid && baselineInterest !== null ? baselineInterest - result.total_interest_satang : 0n;
    return `<article class="scenario-card ${key}"><span class="eyebrow">${escapeHtml(label)}</span><h2>${paid ? `${result.payoff_month_count} เดือน` : escapeHtml(reason)}</h2><p>${escapeHtml(note)}</p><div class="scenario-bar" aria-label="ระยะเวลาประมาณ ${paid?result.payoff_month_count:'ไม่ทราบ'} เดือน"><i style="width:${width}%"></i></div><div class="scenario-metrics"><span>ดอกเบี้ยรวม<b>${paid?formatBaht(result.total_interest_satang):'—'}</b></span><span>จ่ายรวม<b>${paid?formatBaht(result.total_paid_satang):'—'}</b></span></div>${saving>0n?`<small>ดอกเบี้ยน้อยกว่าแผนปัจจุบัน ${formatBaht(saving)}</small>`:''}</article>`;
  }).join('')}</section><button class="primary" data-action="save-simulation">บันทึกผลเทียบครั้งนี้ <span>→</span></button>`}
  <details class="assumption-box"><summary>สมมติฐานที่ใช้</summary><ul><li>คิดดอกเบี้ยรายเดือนจาก APR/EIR และปัดขึ้นเป็นสตางค์</li><li>จ่ายยอดขั้นต่ำทุกบัญชีก่อน แล้วโยกเงินที่ว่างไปตาม strategy</li><li>ไม่รวมค่าธรรมเนียม ดอกเบี้ยผิดนัด หรือสูตรเฉพาะสัญญา</li><li>ถ้าข้อเสนอจริงไม่ครบ APR ค่างวด และบัญชี ระบบจะไม่จำลอง</li></ul></details>`;
}

function cashWaterfall(cash) {
  const income = moneyOrNull(state.input.monthlyTakeHome) || 0n;
  const essentials = moneyOrNull(state.input.essentialLivingCosts) || 0n;
  const payment = moneyOrNull(state.input.currentMonthlyPayment) || 0n;
  const max = income > 0n ? income : 1n;
  const rows = [['รายรับสุทธิ',income,'income'],['ค่าอยู่รอด',essentials,'essential'],['ค่างวดปัจจุบัน',payment,'debt'],['เหลือก่อนหนี้',cash ?? 0n,'remaining']];
  return `<section class="waterfall card"><span class="eyebrow">MONEY MAP</span><h2>ตัวเลขที่ใช้ตัดสินใจ</h2>
    ${rows.map(([label,value,kind]) => `<div class="water-row ${kind}"><span>${label}</span><div class="bar"><i style="width:${Math.max(2,Math.min(100,Number((value<0n?-value:value)*100n/max)))}%"></i></div><b>${formatBaht(value)}</b></div>`).join('')}
  </section>`;
}

function dueTimeline(meta) {
  const due = state.input.nextDueDate || 'ยังไม่กรอก';
  return `<section class="case-timeline card"><span class="eyebrow">CASE TIMELINE</span><h2>สิ่งที่ต้องเก็บให้ครบ</h2>
    <div class="timeline-item active"><i>1</i><div><b>วันนี้</b><span>${escapeHtml(meta.checklist[0])}</span></div></div>
    <div class="timeline-item"><i>2</i><div><b>ครบกำหนด: ${escapeHtml(due)}</b><span>${escapeHtml(meta.checklist[1])}</span></div></div>
    <div class="timeline-item"><i>3</i><div><b>หลักฐานจบขั้น</b><span>${escapeHtml(meta.metric)}</span></div></div>
  </section>`;
}

function diagnosisView() {
  const assessment = currentAssessment();
  if (assessment.error) return errorPanel(assessment.error);
  const { result, cash } = assessment;
  const meta = ROUTE_META[result.route];
  const missing = result.missing_fields.map((field) => ({ field, label: FIELD_LABELS[field] || field }));
  const negative = result.safety_flags.includes('negative_cash_before_debt');
  if (currentUser && state.assessmentSaved === null) persistAssessment(assessment);
  return `<section class="diagnosis-hero ${meta.tone}">
    <div><span class="route-pill">${escapeHtml(meta.label)}</span><h1>${escapeHtml(meta.title)}</h1>
      <p>ระบบเลือก route จากวันค้าง ขั้นกฎหมาย ประเภทหนี้ และเงินก่อนจ่ายหนี้</p></div>
    <div class="route-gauge" aria-label="สถานะ ${escapeHtml(meta.label)}"><span>${negative?'!':'✓'}</span><small>${negative?'ต้องขอความช่วยเหลือก่อน':'มีทางทำต่อ'}</small></div>
  </section>
  <div class="diagnosis-layout">
    <main>
      ${cashWaterfall(cash)}
      <section class="action-pack card"><div class="section-heading"><div><span class="eyebrow">ACTION PACK</span><h2>ใช้พูดกับหน่วยงานได้เลย</h2></div><button class="copy-button" data-action="copy-script">คัดลอก</button></div>
        <blockquote>${escapeHtml(fillScript(meta.script))}</blockquote>
        <div class="artifact-target"><span>ผลที่ต้องได้กลับมา</span><b>${escapeHtml(meta.metric)}</b></div>
      </section>
      ${missing.length ? `<section class="missing-card"><span class="eyebrow">ยังขาด ${missing.length} รายการ</span><h2>หาเพิ่มก่อนยืนยันสิทธิ์</h2><div class="missing-chips">${missing.map(item=>`<button data-action="fill-missing" data-field="${item.field}">${escapeHtml(item.label)}</button>`).join('')}</div><button class="text-action" data-action="fill-missing" data-field="${missing[0].field}">กลับไปเติม: ${escapeHtml(missing[0].label)} →</button></section>` : ''}
    </main>
    <aside>${dueTimeline(meta)}
      <section class="source-card"><span class="eyebrow">OFFICIAL SOURCE</span><h2>${escapeHtml(meta.sourceLabel)}</h2><a href="${meta.source}" target="_blank" rel="noreferrer">เปิดแหล่งข้อมูลทางการ ↗</a><small>ตรวจล่าสุด 16 ส.ค. 2569</small></section>
    </aside>
  </div>
  <button class="primary" data-screen="action-plan">เปิด checklist ทำทีละข้อ <span>→</span></button>
  <p class="disclaimer">${escapeHtml(result.disclaimer)}</p>`;
}

function fillScript(script) {
  return script
    .replace('รายรับสุทธิ ___', `รายรับสุทธิ ${state.input.monthlyTakeHome || '___'}`)
    .replace('ค่าอยู่รอดจำเป็น ___', `ค่าอยู่รอดจำเป็น ${state.input.essentialLivingCosts || '___'}`)
    .replace('ชำระ ___', `ชำระ ${state.input.proposedPayment || '___'}`)
    .replace('ยอดรวม ___', `ยอดรวม ${state.input.totalDebt || '___'}`)
    .replace('ยอด NPL ที่รายงาน ___', `ยอด NPL ที่รายงาน ${state.input.totalNcbNpl || state.input.totalDebt || '___'}`)
    .replace('เลขคดี ___', `เลขคดี ${state.input.caseReference || '___'}`)
    .replace('บัญชี ___', `บัญชี ${state.input.creditorName || '___'}`);
}

function actionPlanView() {
  const assessment = currentAssessment();
  if (assessment.error) return errorPanel(assessment.error);
  const meta = ROUTE_META[assessment.result.route];
  const statuses = [['not_started','ยังไม่เริ่ม'],['contacted','ติดต่อแล้ว'],['submitted','ส่งเอกสารแล้ว'],['documented','ได้หลักฐานแล้ว']];
  return `<section class="action-plan-hero"><span class="eyebrow">ACTION PLAN</span><h1>${escapeHtml(meta.title)}</h1><p>ทำตามลำดับ แล้วบันทึกสิ่งที่เกิดขึ้นจริง</p></section>
  <section class="action-checklist">${meta.checklist.map((item,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><div><b>${escapeHtml(item)}</b><small>${index===0?'เริ่มข้อนี้ก่อน':'ทำเมื่อข้อก่อนหน้าพร้อม'}</small></div></article>`).join('')}</section>
  <section class="outcome-recorder card"><span class="eyebrow">บันทึกผลจริง</span><h2>ตอนนี้ไปถึงขั้นไหนแล้ว</h2>
    <div class="status-grid">${statuses.map(([value,label])=>radioCard('actionStatus',value,label,'',state.actionStatus===value)).join('')}</div>
    <label class="input-card" for="actionEvidence"><span>เลขรับเรื่อง / สิ่งที่ได้รับ</span><small>อย่าใส่ OTP หรือข้อมูลบัตรเต็ม</small><textarea id="actionEvidence" placeholder="เช่น เลขรับเรื่อง ABC123 นัดโทรกลับ 20 ส.ค.">${escapeHtml(state.actionEvidence)}</textarea></label>
    <button class="primary" data-action="save-outcome">บันทึกความคืบหน้า <span>→</span></button>
  </section>`;
}

function learnView() {
  const assessment = currentAssessment();
  const route = assessment.error ? ROUTES.PREVENTION : assessment.result.route;
  const contextual = unitsForRoute(route);
  const units = [...contextual, ...LEARNING_UNITS.filter((unit)=>!contextual.includes(unit))];
  const mastered = Object.values(state.mastery || {}).filter((value)=>value==='evidence_recorded').length;
  const label = (value) => ({not_started:'ยังไม่เริ่ม',understood:'เข้าใจแล้ว',action_taken:'ลงมือแล้ว',evidence_recorded:'บันทึกหลักฐานแล้ว · ผู้ใช้รายงาน'})[value || 'not_started'];
  return `<section class="learn-hero"><div><span class="eyebrow">MASTERY PATH</span><h1>เรียนเฉพาะเรื่องที่ใช้ตัดสินใจ</h1><p>6 บทสั้น แต่ละบทจบด้วยงานที่ทำได้จริงและแหล่งข้อมูลทางการ</p></div><div class="mastery-ring" style="--mastery:${Math.round(mastered*100/LEARNING_UNITS.length)}%"><strong>${mastered}/6</strong><span>มีหลักฐานที่รายงาน</span></div></section>
  <div class="lesson-path">${units.map((unit,index)=>{const progress=state.mastery?.[unit.id]||'not_started'; return `<article class="${index===0?'current':''}"><div class="lesson-icon">${progress==='evidence_recorded'?'✓':'▥'}</div><div><span class="eyebrow">${contextual.includes(unit)?'ตรงกับเคสนี้':'เรียนเพิ่ม'} · ${unit.duration_minutes} นาที · ${label(progress)}</span><h2>${escapeHtml(unit.decision)}</h2><p>${escapeHtml(unit.action.label)}</p></div><button data-action="open-lesson" data-lesson="${unit.id}" aria-label="เปิดบท ${escapeHtml(unit.decision)}">→</button></article>`;}).join('')}</div>
  <section class="lesson-callout"><b>บทเรียนไม่ใช่เส้นชัย</b><p>เครื่องหมายนี้หมายถึงผู้ใช้บันทึกหลักฐานเอง เช่น เลขรับเรื่อง ข้อเสนอ หรือวันนัด ระบบยังไม่ได้ตรวจสอบกับหน่วยงานภายนอก</p></section>`;
}

function lessonView() {
  const unit = LEARNING_UNITS.find((item)=>item.id===state.currentLesson) || LEARNING_UNITS[0];
  const progress = state.mastery?.[unit.id] || 'not_started';
  const progressLabel = ({not_started:'ยังไม่เริ่ม',understood:'เข้าใจแล้ว',action_taken:'ลงมือแล้ว',evidence_recorded:'บันทึกหลักฐานแล้ว · ผู้ใช้รายงาน'})[progress];
  return `<article class="lesson-detail"><span class="eyebrow">บทเรียน · ${unit.duration_minutes} นาที · ${progressLabel}</span><h1>${escapeHtml(unit.decision)}</h1>
    <section class="decision-card"><span class="eyebrow">การตัดสินใจ</span><p>${escapeHtml(unit.decision)}</p></section>
    <section class="knowledge-check"><span class="eyebrow">เช็กความเข้าใจ 1 ข้อ</span><h2>${escapeHtml(unit.question)}</h2>${state.lessonAnswerRevealed?`<div class="answer-box"><b>คำตอบ</b><p>${escapeHtml(unit.answer)}</p></div>`:`<button class="secondary" data-action="reveal-answer">ดูคำตอบ</button>`}</section>
    <section><span class="eyebrow">ทำตอนนี้</span><h2>${escapeHtml(unit.action.label)}</h2><button class="secondary" data-action="start-lesson-action">ฉันเริ่มทำงานนี้แล้ว</button><label class="input-card" for="lessonEvidence"><span>หลักฐานผลลัพธ์</span><small>เช่น เลขรับเรื่อง วันที่นัด หรือชื่อเอกสาร—ห้ามใส่ OTP</small><input id="lessonEvidence" value="${escapeHtml(state.lessonEvidence)}" placeholder="เลขรับเรื่อง / วันนัด / เอกสารที่ได้รับ"></label></section>
    <div class="lesson-source"><span>แหล่งข้อมูล</span><a href="${unit.source.url}" target="_blank" rel="noreferrer">${escapeHtml(unit.source.owner)} ↗</a><small>ทบทวน ${escapeHtml(unit.source.reviewed_date)}</small></div>
    <button class="primary" data-action="complete-lesson" ${state.lessonEvidence.trim()?'':'disabled'}>${progress==='evidence_recorded'?'บันทึกหลักฐานแล้ว ✓':'บันทึกหลักฐานที่รายงาน'} <span>→</span></button>
    <p class="disclaimer">เนื้อหานี้ช่วยเตรียมข้อมูลและคำถาม ไม่รับรองสิทธิ์ ผลการเจรจา หรือผลคดี</p>
  </article>`;
}

function historyView() {
  const items = state.history || [];
  return `<section class="history-hero"><span class="eyebrow">CASE HISTORY</span><h1>สิ่งที่เกิดขึ้นจริง</h1><p>ใช้ timeline นี้ต่อบทสนทนากับเจ้าหนี้หรือผู้เชี่ยวชาญ</p></section>
  ${items.length ? `<div class="history-timeline">${items.slice().reverse().map(item=>`<article><i></i><div><span>${escapeHtml(item.date)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.note || '')}</p></div></article>`).join('')}</div>` : `<section class="empty-history"><div>↗</div><h2>ยังไม่มีความคืบหน้าที่บันทึก</h2><p>เมื่อคุณติดต่อเจ้าหนี้ ส่งเอกสาร หรือได้เลขรับเรื่อง รายการจะอยู่ที่นี่</p><button class="primary" data-screen="intake-money">เริ่ม Route Check <span>→</span></button></section>`}`;
}

function dataView() {
  return `<section class="data-panel"><span class="eyebrow">DATA & PRIVACY</span><h1>ข้อมูลของคุณควบคุมได้</h1>
    <div class="data-row"><div><b>ร่างในอุปกรณ์</b><span>เปิดอยู่ · บันทึกอัตโนมัติ</span></div><span class="status-dot">พร้อม</span></div>
    <div class="data-row"><div><b>Sync ข้ามอุปกรณ์</b><span>${currentUser ? (state.assessmentSaved===true?'เชื่อมแล้ว':'พร้อมเมื่อบันทึกแผน') : (sessionChecked?'ต้องยืนยันอีเมล':'กำลังตรวจ session')}</span></div><span class="status-dot">${currentUser && state.assessmentSaved===true?'บันทึกแล้ว':'Local'}</span></div>
    <div class="data-row"><div><b>ข้อมูลที่ไม่เก็บใน Route Check</b><span>OTP · รหัสผ่าน · เลขบัตรเต็ม</span></div></div>
    <div class="data-row"><div><b>Pilot metrics ในอุปกรณ์</b><span>${state.pilotEvents.length} events · ไม่มีจำนวนเงินดิบ</span></div><span class="status-dot">Local</span></div>
    ${currentUser
      ? `<div class="session-card"><span class="eyebrow">SIGNED IN</span><b>${escapeHtml(currentUser.email || 'บัญชีที่ยืนยันแล้ว')}</b><small>แผนใหม่จึงจะส่งไปบันทึกบน server</small></div>`
      : `<div class="session-card"><span class="eyebrow">SYNC เมื่อคุณต้องการ</span><h2>ส่ง Magic Link เพื่อบันทึกข้ามอุปกรณ์</h2><label class="input-card" for="authEmail"><span>อีเมล</span><input id="authEmail" type="email" autocomplete="email" value="${escapeHtml(authEmailDraft)}" placeholder="name@example.com"></label><button class="secondary" data-action="request-link">ส่ง Magic Link</button></div>`}
    <div class="data-actions"><button class="secondary" data-action="export-data">ดาวน์โหลดสำเนา JSON</button><button class="danger-button" data-action="prepare-delete-local">ลบข้อมูลในอุปกรณ์นี้</button>${currentUser?'<button class="danger-button outline" data-action="prepare-delete-server">ลบ assessment/action ที่ sync และข้อมูลในอุปกรณ์</button>':''}</div>
  </section>`;
}

function deleteConfirmView() {
  const server = state.deleteScope === 'all';
  return `<section class="delete-panel"><span class="eyebrow">ยืนยันการลบ</span><h1>${server?'ลบ assessment/action ที่ sync และข้อมูลในอุปกรณ์?':'ลบร่างและประวัติในอุปกรณ์นี้?'}</h1><p>${server?'ระบบจะลบ assessment และ action ที่ sync บน server ส่วน Debt Map งานเตือน และความคืบหน้าบทเรียนรุ่นนี้เก็บในอุปกรณ์และจะถูกลบจากอุปกรณ์ด้วย การกระทำนี้ย้อนกลับไม่ได้':'ลบเฉพาะอุปกรณ์นี้ ไม่กระทบข้อมูลที่ sync บน server'}</p><div class="button-row"><button class="secondary" data-screen="data">ยกเลิก</button><button class="danger-button" data-action="confirm-delete">${server?'ลบตามรายการนี้':'ลบในอุปกรณ์'}</button></div></section>`;
}

function errorPanel(error) {
  const message = error instanceof RulesError ? error.message : 'ยังสร้างแผนไม่ได้ กรุณาตรวจข้อมูลจำนวนเงิน';
  return `<section class="error-panel" role="alert"><span>!</span><h1>ข้อมูลยังไม่พร้อม</h1><p>${escapeHtml(message)}</p><button class="primary" data-screen="intake-money">กลับไปตรวจข้อมูล <span>→</span></button></section>`;
}

function persistAssessment(assessment) {
  if (!currentUser) return;
  state.assessmentSaved = 'pending';
  state.clientAssessmentId ||= crypto.randomUUID();
  save();
  createDebtAssessment({
    client_assessment_id: state.clientAssessmentId,
    engine_version: DEBT_ENGINE_VERSION,
    overdue_band: assessment.input.overdue_band,
    legal_stage: assessment.input.legal_stage,
    debt_types: assessment.input.debt_types || [],
    debt_types_complete: assessment.input.debt_types_complete ?? null,
    total_debt_satang: assessment.input.total_debt_satang,
    monthly_take_home_satang: assessment.input.monthly_take_home_satang,
    essential_living_costs_satang: assessment.input.essential_living_costs_satang,
    proposed_affordable_payment_satang: assessment.input.proposed_affordable_payment_satang ?? null,
    input_payload: assessment.input,
    result_payload: assessment.result
  }).then((response) => {
    state.remoteAssessmentId = response.assessment?.id || null;
    state.assessmentSaved = true;
    save();
    if (state.screen === 'diagnosis') render();
  }).catch(() => {
    state.assessmentSaved = false;
    save();
    if (state.screen === 'diagnosis') render();
  });
}

function render() {
  const views = {
    home: homeView,
    consent: consentView,
    'intake-money': moneyIntakeView,
    'intake-status': statusIntakeView,
    'intake-details': detailsIntakeView,
    diagnosis: diagnosisView,
    'action-plan': actionPlanView,
    portfolio: portfolioView,
    'debt-editor': debtEditorView,
    payoff: payoffView,
    reminders: remindersView,
    learn: learnView,
    lesson: lessonView,
    history: historyView,
    data: dataView,
    'delete-confirm': deleteConfirmView
  };
  const view = views[state.screen] || homeView;
  app.innerHTML = `<div class="shell">${topBar()}<main id="main" class="content" tabindex="-1">
    ${state.notice ? `<div class="notice" role="alert">${escapeHtml(state.notice)}</div>` : ''}
    ${view()}</main>${bottomNav()}</div>`;
  document.querySelector('#main')?.focus();
  if (pendingFocusTarget) {
    const target = document.querySelector(`[data-field-anchor="${pendingFocusTarget}"]`) || document.querySelector(`#${pendingFocusTarget}`) || document.querySelector(`[name="${pendingFocusTarget}"]`);
    pendingFocusTarget = null;
    if (target) requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const control = target.matches('input,select,textarea,button') ? target : target.querySelector('input,select,textarea,button');
      control?.focus({ preventScroll: true });
      target.classList.add('focus-pulse');
      setTimeout(() => target.classList.remove('focus-pulse'), 900);
    });
  }
}

async function consumeAuthCallback() {
  const params = new URLSearchParams(location.hash.startsWith('#') ? location.hash.slice(1) : '');
  const accessToken = params.get('access_token');
  if (!accessToken) return;
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ access_token: accessToken })
    });
    if (!response.ok) throw new Error('AUTH_CALLBACK_FAILED');
    currentUser = (await response.json()).user || null;
    sessionChecked = true;
    history.replaceState({}, document.title, location.pathname);
    state.notice = 'ยืนยันอีเมลแล้ว แผนถัดไปจะ sync ข้ามอุปกรณ์';
  } catch {
    state.notice = 'ยืนยันอีเมลไม่สำเร็จ กรุณาขอลิงก์ใหม่';
  }
  save();
  render();
}

async function refreshSessionUser() {
  try { currentUser = await getSessionUser(); }
  catch { currentUser = null; }
  sessionChecked = true;
  if (state.screen === 'data' || state.screen === 'diagnosis') render();
}

app.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'consent') state.consent = target.checked;
  else if (target.id === 'unableToPay' || target.id === 'creditDataDisputed' || target.id === 'identityMisuseSuspected') {
    state.input[target.id] = target.checked;
  } else if (target.id === 'actionEvidence') state.actionEvidence = target.value;
  else if (target.id === 'lessonEvidence') {
    state.lessonEvidence = target.value;
    const completeButton = document.querySelector('[data-action="complete-lesson"]');
    if (completeButton) completeButton.disabled = !target.value.trim();
  }
  else if (target.id === 'authEmail') { authEmailDraft = target.value; return; }
  else if (target.id.startsWith('debtDraft_')) state.debtDraft[target.id.replace('debtDraft_','')] = target.value;
  else if (target.id.startsWith('reminderDraft_')) state.reminderDraft[target.id.replace('reminderDraft_','')] = target.value;
  else if (target.id === 'extraPayment' || target.id === 'restructureDebtId' || target.id === 'restructureApr' || target.id === 'restructurePayment') state[target.id] = target.value;
  else if (target.id === 'restructureEnabled') { state.restructureEnabled = target.checked; render(); }
  else if (target.id in state.input) state.input[target.id] = target.value;
  save();
  if (target.id === 'consent') render();
  if (target.id === 'creditDataDisputed' || target.id === 'identityMisuseSuspected') render();
  if (target.id === 'monthlyTakeHome' || target.id === 'essentialLivingCosts') {
    const live = document.querySelector('.live-balance');
    if (live) live.innerHTML = liveBalance();
  }
  if (target.id === 'availableCash' || target.id === 'payday') {
    const runway = document.querySelector('.runway-preview-host');
    if (runway) runway.innerHTML = paydayRunwayPreview();
  }
});

app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.type === 'checkbox' && target.name === 'debtTypes') {
    const selected = new Set(state.input.debtTypes || []);
    if (target.checked) selected.add(target.value); else selected.delete(target.value);
    state.input.debtTypes = [...selected];
    state.input.debtTypesComplete = null;
    save();
    render();
    return;
  }
  if (target.type === 'checkbox' && target.name === 'legalStages') {
    const exclusive = new Set(['none', 'unknown']);
    const selected = new Set(state.input.legalStages || []);
    if (target.checked) {
      if (exclusive.has(target.value)) {
        selected.clear();
        selected.add(target.value);
      } else {
        selected.delete('none');
        selected.delete('unknown');
        selected.add(target.value);
      }
    } else selected.delete(target.value);
    state.input.legalStages = [...selected];
    state.input.legalStage = effectiveLegalStage(state.input.legalStages);
    save();
    render();
    return;
  }
  if (['extraPayment','restructureDebtId','restructureApr','restructurePayment'].includes(target.id)) {
    save();
    render();
    return;
  }
  if (target.type !== 'radio') return;
  const booleanNames = ['bankrupt','nplOnCutoff','clearDebtCreditorInScope','amlSanctioned','evidenceAvailable','debtTypesComplete'];
  if (booleanNames.includes(target.name)) {
    state.input[target.name] = target.value === 'unknown' ? null : target.value === 'yes';
  } else if (target.name === 'actionStatus') state.actionStatus = target.value;
  else if (target.name in state.input) state.input[target.name] = target.value;
  save();
  render();
});

app.addEventListener('click', async (event) => {
  const button = event.target.closest('button,[data-screen]');
  if (!button || button.disabled) return;
  if (button.dataset.screen) {
    state.notice = '';
    if (button.dataset.screen === 'action-plan') {
      const assessment = currentAssessment();
      trackPilot('action_pack_opened', assessment.error ? {} : { route: assessment.result.route });
    }
    state.screen = !state.consent && SENSITIVE_SCREENS.has(button.dataset.screen) ? 'consent' : button.dataset.screen;
    save();
    render();
    return;
  }
  const action = button.dataset.action;
  if (action === 'select-creditor') {
    const choice = button.dataset.creditor;
    state.input.creditorChoice = choice;
    if (choice === 'other') {
      if (CREDITOR_OPTIONS.some((item) => item.name === state.input.creditorName)) state.input.creditorName = '';
    } else state.input.creditorName = choice;
    state.notice = '';
  }
  if (action === 'fill-missing') {
    const [screen, target] = MISSING_TARGETS[button.dataset.field] || ['intake-details', 'creditorName'];
    state.screen = screen;
    pendingFocusTarget = target;
    state.notice = `เติม “${FIELD_LABELS[button.dataset.field] || button.dataset.field}” แล้วกลับมาสร้างแผนอีกครั้ง`;
  }
  if (action === 'back') {
    const back = {
      consent:'home','intake-money':'consent','intake-status':'intake-money',
      'intake-details':'intake-status',diagnosis:'intake-details','action-plan':'diagnosis',
      portfolio:'home','debt-editor':'portfolio',payoff:'portfolio',reminders:'portfolio',
      learn:'home',lesson:'learn',history:'home',data:'home','delete-confirm':'data'
    };
    state.screen = back[state.screen] || 'home';
  }
  if (action === 'money-next') {
    try {
      if (!state.input.monthlyTakeHome || !state.input.essentialLivingCosts || !state.input.totalDebt) throw new RulesError('MISSING','กรอกสามยอดหลักก่อน');
      parseBaht(state.input.monthlyTakeHome); parseBaht(state.input.essentialLivingCosts); parseBaht(state.input.totalDebt);
      state.screen = 'intake-status'; state.notice = '';
    } catch (error) {
      state.notice = error.message || 'ตรวจข้อมูลจำนวนเงิน';
    }
  }
  if (action === 'status-next') {
    if (!state.input.overdueBand || !(state.input.legalStages || []).length) {
      state.notice = 'เลือกทั้งจำนวนวันที่ค้างและขั้นกฎหมายก่อน หรือเลือก “ไม่แน่ใจ”';
    } else {
      state.screen = 'intake-details';
      state.notice = '';
    }
  }
  if (action === 'diagnose') {
    const assessment = currentAssessment();
    if (!state.input.overdueBand || !(state.input.legalStages || []).length || !(state.input.debtTypes || []).length) {
      state.notice = 'กรุณายืนยันสถานะหนี้ ขั้นกฎหมาย และเลือกประเภทหนี้อย่างน้อยหนึ่งข้อ';
    } else if (assessment.error) state.notice = assessment.error.message;
    else { syncDebtFromIntake(); state.assessmentSaved = null; state.clientAssessmentId = crypto.randomUUID(); state.remoteAssessmentId = null; state.screen = 'diagnosis'; state.notice = ''; trackPilot('route_completed',{route:assessment.result.route}); }
  }
  if (action === 'open-lesson') {
    state.currentLesson = button.dataset.lesson || LEARNING_UNITS[0].id;
    state.lessonAnswerRevealed = false;
    state.lessonEvidence = '';
    state.screen = 'lesson';
  }
  if (action === 'request-link') {
    try {
      if (!/^\S+@\S+\.\S+$/.test(authEmailDraft)) throw new Error('กรอกอีเมลให้ถูกต้อง');
      await requestMagicLink(authEmailDraft);
      state.notice = 'ส่ง Magic Link แล้ว เปิดอีเมลบนอุปกรณ์นี้เพื่อเชื่อมบัญชี';
    } catch (error) {
      state.notice = error.message || 'ส่ง Magic Link ไม่สำเร็จ';
    }
  }
  if (action === 'add-debt') {
    state.editingDebtId = null;
    state.debtDraft = emptyDebtDraft();
    state.screen = 'debt-editor';
  }
  if (action === 'edit-debt') {
    const debt = state.debts.find((item)=>item.id===button.dataset.id);
    if (debt) {
      state.editingDebtId = debt.id;
      state.debtDraft = { ...emptyDebtDraft(), ...debt };
      state.screen = 'debt-editor';
    }
  }
  if (action === 'save-debt') {
    try {
      const draft = state.debtDraft;
      if (!draft.creditorName.trim()) throw new RulesError('MISSING','กรอกชื่อเจ้าหนี้');
      parseBaht(draft.balance);
      if (draft.aprPercent) parseAprBps(draft.aprPercent);
      if (draft.minimum) parseBaht(draft.minimum);
      if (draft.dueDay && (!Number.isInteger(Number(draft.dueDay)) || Number(draft.dueDay)<1 || Number(draft.dueDay)>31)) throw new RulesError('INVALID_DUE_DAY','วันครบกำหนดต้องอยู่ระหว่าง 1–31');
      const record = { ...draft, id: state.editingDebtId || crypto.randomUUID(), creditorName: draft.creditorName.trim() };
      state.debts = state.editingDebtId ? state.debts.map((item)=>item.id===state.editingDebtId?record:item) : [...state.debts,record];
      state.debtDraft = emptyDebtDraft();
      state.editingDebtId = null;
      state.screen = 'portfolio';
      state.notice = 'บันทึกบัญชีแล้ว';
    } catch (error) { state.notice = error.message || 'ตรวจข้อมูลบัญชี'; }
  }
  if (action === 'delete-debt') state.pendingDeleteDebtId = button.dataset.id;
  if (action === 'cancel-delete-debt') state.pendingDeleteDebtId = null;
  if (action === 'confirm-delete-debt') {
    state.debts = state.debts.filter((item)=>item.id!==button.dataset.id);
    if (state.intakeDebtId === button.dataset.id) state.intakeDebtId = null;
    state.pendingDeleteDebtId = null;
    state.notice = 'ลบบัญชีจากอุปกรณ์แล้ว';
  }
  if (action === 'save-snapshot') {
    const total = reportedDebtTotal();
    state.snapshots.push({ id: crypto.randomUUID(), date: today(), total_satang: total.toString() });
    state.history.push({ date: today(), title: 'บันทึกยอดหนี้', note: `ยอดที่รายงาน ${formatBaht(total)}` });
    state.notice = 'บันทึกยอดวันนี้แล้ว';
    trackPilot('snapshot_recorded');
  }
  if (action === 'save-simulation') {
    try {
      const comparison = comparePayoffScenarios(payoffInput());
      const best = [comparison.baseline,comparison.avalanche,comparison.snowball].filter((item)=>item.status==='paid_off').sort((a,b)=>a.payoff_month_count-b.payoff_month_count||(a.total_interest_satang<b.total_interest_satang?-1:a.total_interest_satang>b.total_interest_satang?1:0))[0];
      state.history.push({ date: today(), title: 'บันทึกผล Payoff Lab', note: best ? `ทางเลือกที่สั้นสุดในข้อมูลชุดนี้ ${best.strategy}: ${best.payoff_month_count} เดือน` : 'ข้อมูลชุดนี้ยังไม่เห็นวันปิดหนี้' });
      state.notice = 'บันทึกผลเทียบแล้ว';
      trackPilot('payoff_compared');
    } catch (error) { state.notice = error.message || 'ยังบันทึกผลเทียบไม่ได้'; }
  }
  if (action === 'save-reminder') {
    if (!state.reminderDraft.title.trim() || !state.reminderDraft.dueDate) state.notice = 'กรอกงานและวันที่ก่อน';
    else {
      state.reminders.push({ id: crypto.randomUUID(), title: state.reminderDraft.title.trim(), dueDate: state.reminderDraft.dueDate, done: false });
      state.reminderDraft = emptyReminderDraft();
      state.notice = 'เพิ่มงานติดตามแล้ว';
    }
  }
  if (action === 'toggle-reminder') {
    state.reminders = state.reminders.map((item)=>item.id===button.dataset.id?{...item,done:!item.done}:item);
    const changed = state.reminders.find((item)=>item.id===button.dataset.id);
    if (changed?.done) trackPilot('reminder_completed');
  }
  if (action === 'reveal-answer') {
    state.lessonAnswerRevealed = true;
    state.mastery[state.currentLesson] = state.mastery[state.currentLesson] === 'evidence_recorded' ? 'evidence_recorded' : 'understood';
  }
  if (action === 'start-lesson-action') {
    const unit = LEARNING_UNITS.find((item)=>item.id===state.currentLesson) || LEARNING_UNITS[0];
    state.mastery[unit.id] = state.mastery[unit.id] === 'evidence_recorded' ? 'evidence_recorded' : 'action_taken';
    state.history.push({ date: today(), title: 'งานจากบทเรียน', note: unit.action.label });
    state.notice = 'บันทึกงานจากบทเรียนในประวัติแล้ว';
  }
  if (action === 'complete-lesson') {
    const unit = LEARNING_UNITS.find((item)=>item.id===state.currentLesson) || LEARNING_UNITS[0];
    if (!state.lessonEvidence.trim()) { state.notice = 'ใส่เลขรับเรื่อง วันนัด หรือหลักฐานผลลัพธ์ก่อน'; }
    else {
      state.mastery[unit.id] = 'evidence_recorded';
      state.history.push({ date: today(), title: 'ผู้ใช้บันทึกหลักฐานจากบทเรียน', note: `${unit.decision} · ${state.lessonEvidence.trim()}` });
      state.lessonEvidence = '';
      state.screen = 'learn';
      state.notice = 'บันทึกหลักฐานที่คุณรายงานแล้ว';
      trackPilot('lesson_evidence_recorded',{unit_id:unit.id});
    }
  }
  if (action === 'copy-script') {
    const assessment = currentAssessment();
    if (!assessment.error) {
      const text = fillScript(ROUTE_META[assessment.result.route].script);
      try { await navigator.clipboard.writeText(text); state.notice = 'คัดลอกสคริปต์แล้ว'; }
      catch { state.notice = 'คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความด้วยตนเอง'; }
    }
  }
  if (action === 'save-outcome') {
    const assessment = currentAssessment();
    const meta = assessment.error ? ROUTE_META[ROUTES.PREVENTION] : ROUTE_META[assessment.result.route];
    state.history.push({
      date: today(),
      title: state.actionStatus === 'documented' ? 'ได้หลักฐานแล้ว' : 'อัปเดต Action Plan',
      note: state.actionEvidence || meta.metric
    });
    trackPilot('outcome_recorded',{status:state.actionStatus});
    if (currentUser && state.remoteAssessmentId) {
      try {
        await createDebtAction({
          assessment_id: state.remoteAssessmentId,
          action_pack_id: assessment.error ? 'manual_follow_up' : assessment.result.action_pack_id,
          outcome: state.actionStatus,
          ...(state.actionEvidence ? { evidence_reference: state.actionEvidence } : {}),
          ...(state.input.nextDueDate ? { due_at: `${state.input.nextDueDate}T00:00:00+07:00` } : {})
        });
        state.notice = 'บันทึกความคืบหน้าในบัญชีแล้ว';
      } catch { state.notice = 'บันทึกในอุปกรณ์แล้ว แต่ sync server ไม่สำเร็จ'; }
    }
    state.screen = 'history';
  }
  if (action === 'export-data') {
    const exportValue = { exported_at: new Date().toISOString(), schema_version: state.schemaVersion, input: state.input, debts: state.debts, history: state.history, snapshots: state.snapshots, reminders: state.reminders, mastery: state.mastery, pilot_events: state.pilotEvents };
    const blob = new Blob([JSON.stringify(exportValue,null,2)],{type:'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `first-jobber-debt-data-${today()}.json`; link.click();
    setTimeout(()=>URL.revokeObjectURL(link.href),0);
    state.notice = 'ดาวน์โหลดสำเนาข้อมูลแล้ว';
  }
  if (action === 'prepare-delete-local') { state.deleteScope = 'local'; state.screen = 'delete-confirm'; }
  if (action === 'prepare-delete-server') { state.deleteScope = 'all'; state.screen = 'delete-confirm'; }
  if (action === 'confirm-delete') {
    if (state.deleteScope === 'all' && currentUser) {
      try {
        const response = await listDebtAssessments();
        for (const assessment of response.assessments || []) await deleteDebtAssessment(assessment.id);
      } catch { state.notice = 'ลบจาก server ไม่ครบ กรุณาลองใหม่ก่อนลบในอุปกรณ์'; save(); render(); return; }
    }
    localStorage.removeItem(STORE_KEY);
    state = initialState();
  }
  save();
  render();
});

render();
(async () => {
  await consumeAuthCallback();
  await refreshSessionUser();
})();
