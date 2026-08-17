export const LEARNING_CONTENT_VERSION = 'first-jobber-money-lab/2.0.0';
export const MASTERY_STATES = Object.freeze(['not_started', 'understood', 'action_taken', 'evidence_recorded']);

const bot = 'ธนาคารแห่งประเทศไทย (ธปท.)';
export const MONEY_LAB_UNITS = Object.freeze([
  {
    id: 'money-lab-tax', duration_minutes: 8, route_tags: ['money_lab'],
    title: 'ภาษีเงินเดือนแรก: รู้ยอดก่อนซื้อของลดหย่อน',
    decision: 'คำนวณจากรายได้ทุกแหล่ง ค่าใช้จ่าย ค่าลดหย่อน และภาษีที่ถูกหักไว้ ก่อนตัดสินใจซื้อผลิตภัณฑ์ลดหย่อน',
    summary: 'ภาษีไม่ได้เริ่มจากการซื้อกองทุน แต่เริ่มจากการเห็นเงินได้ทั้งปีและเก็บหลักฐานให้ครบ',
    sections: [
      { title: '1. วาดแผนที่ภาษี', body: 'รวมเงินเดือน โบนัส งานเสริม ดอกเบี้ย และรายได้อื่น แล้วหักค่าใช้จ่ายตามประเภทเงินได้กับค่าลดหย่อนที่มีสิทธิจริง จึงได้เงินได้สุทธิสำหรับคำนวณแบบขั้นบันได' },
      { title: '2. กระทบยอดสิ่งที่ถูกหักไว้', body: 'ภาษีหัก ณ ที่จ่ายเป็นเครดิตล่วงหน้า ไม่ใช่ภาษีสุดท้ายเสมอไป เปรียบเทียบภาษีที่คำนวณได้กับ 50 ทวิและเครดิตทั้งหมด เพื่อรู้ว่าต้องจ่ายเพิ่มหรือขอคืน' },
      { title: '3. ตัดสินใจลดหย่อนด้วยต้นทุนจริง', body: 'ค่าลดหย่อน 10,000 บาทไม่ได้แปลว่าได้เงินคืน 10,000 บาท เงินที่ประหยัดได้โดยประมาณคือค่าลดหย่อนคูณอัตราภาษีส่วนเพิ่ม จึงไม่ควรซื้อของที่ไม่จำเป็นเพียงเพื่อภาษี' }
    ],
    infographics: [
      { src: './assets/lessons/tax-map.png', alt: 'แผนภาพลำดับคำนวณภาษีจากรายได้ถึงภาษีสุทธิ', caption: 'แผนที่ภาษี: เริ่มจากรายได้ทุกแหล่ง ไม่ใช่เริ่มจากคำว่าลดหย่อน' },
      { src: './assets/lessons/tax-brackets.png', alt: 'กราฟอัตราภาษีเงินได้บุคคลธรรมดาแบบขั้นบันได', caption: 'อัตราที่สูงขึ้นใช้เฉพาะเงินส่วนที่อยู่ในช่วงนั้น ไม่ได้ใช้กับรายได้ทั้งหมด' },
      { src: './assets/lessons/tax-control-room.png', alt: 'แผนภาพระบบวางแผนภาษีเจ็ดขั้น', caption: 'วงจรทำงาน: ข้อเท็จจริง → แผนที่รายได้ → กระทบยอด → จำลอง → บันทึก → ควบคุม → ตรวจสัญญาณเสี่ยง' }
    ],
    question: 'ถ้ามีค่าลดหย่อนเพิ่ม 10,000 บาท จะได้เงินคืน 10,000 บาทเสมอหรือไม่?',
    answer: 'ไม่เสมอ เงินภาษีที่ลดลงขึ้นกับอัตราภาษีส่วนเพิ่ม เช่น ฐาน 10% ประหยัดภาษีได้สูงสุดประมาณ 1,000 บาทจากค่าลดหย่อน 10,000 บาท',
    action: { id: 'create-tax-folder', label: 'สร้างโฟลเดอร์ภาษีปีนี้ แล้วรวมสลิปเงินเดือน 50 ทวิ ประกันสังคม และ PVD' },
    evidence_hint: 'เช่น Tax_2569 / ประมาณภาษีทั้งปีแล้ว', evidence_placeholder: 'ชื่อโฟลเดอร์หรือผลที่ทำเสร็จ',
    source: { url: 'https://www.rd.go.th/59670.html', owner: 'กรมสรรพากร', reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES
  },
  {
    id: 'money-lab-investing', duration_minutes: 9, route_tags: ['money_lab'],
    title: 'ลงทุนเงินเดือนแรก: สร้างฐานก่อนล่าผลตอบแทน',
    decision: 'กำหนดเป้าหมาย เงินสำรอง และความเสี่ยงที่รับได้ ก่อนเลือกสินทรัพย์ และไม่ใช้ผลตอบแทนสมมติเป็นคำรับประกัน',
    summary: 'การลงทุนที่ดีไม่ใช่การหาของที่ขึ้นเร็วที่สุด แต่คือระบบที่รอดได้นานพอให้เงินทบต้น',
    sections: [
      { title: '1. ฐานการเงินต้องไม่พัง', body: 'กันเงินฉุกเฉินและจัดการหนี้ดอกเบี้ยสูงก่อน เงินที่จะใช้ในเร็ว ๆ นี้ไม่ควรเสี่ยงกับสินทรัพย์ผันผวน' },
      { title: '2. ผลตอบแทนสูงมาพร้อมความไม่แน่นอน', body: 'ไม่มีสินทรัพย์ที่ให้ผลตอบแทนสูงโดยไม่มีความเสี่ยง กระจายสินทรัพย์ ตรวจค่าธรรมเนียม และเลือกความผันผวนที่ไม่ทำให้ต้องขายตอนแย่ที่สุด' },
      { title: '3. ใช้ระบบแทนการเดาตลาด', body: 'กำหนดเป้าหมาย ระยะเวลา เงินลงทุนต่อเดือน และทบทวนตามรอบ หากทดลองกลยุทธ์ขั้นสูงต้องรวมค่าธรรมเนียม ทดสอบนอกตัวอย่าง และเริ่มด้วยเงินเล็ก' }
    ],
    infographics: [
      { src: './assets/lessons/investing-compound.png', alt: 'กราฟตัวอย่างลงทุนเดือนละสามพันบาทที่ผลตอบแทนสมมติเจ็ดเปอร์เซ็นต์', caption: 'พลังทบต้นต้องใช้เวลา และตัวเลข 7% ในภาพเป็นสมมติฐาน ไม่ใช่ผลตอบแทนรับประกัน' },
      { src: './assets/lessons/investing-risk-return.png', alt: 'แผนภาพความสัมพันธ์ระหว่างโอกาสผลตอบแทนกับความเสี่ยง', caption: 'โอกาสผลตอบแทนสูงขึ้นมักแลกกับความผันผวนและโอกาสขาดทุนสูงขึ้น' },
      { src: './assets/lessons/investing-pipeline.png', alt: 'กระบวนการทดสอบกลยุทธ์ลงทุนจากสมมติฐานถึงเงินจริง', caption: 'แนวคิดยังไม่ใช่กลยุทธ์: ต้องมีข้อมูล ทดสอบ ตรวจความทนทาน และ paper trade ก่อน' },
      { src: './assets/lessons/investing-options.png', alt: 'กราฟ payoff พื้นฐานของสิทธิซื้อและสิทธิขาย', caption: 'ตราสารอนุพันธ์มีโครงสร้างผลตอบแทนเฉพาะและอาจเสียเงินทั้งหมดที่จ่าย จึงไม่ใช่จุดเริ่มต้นของ First Jobber' }
    ],
    question: 'กราฟที่สมมติผลตอบแทน 7% ต่อปีหมายความว่าเราจะได้ 7% ทุกปีหรือไม่?',
    answer: 'ไม่ใช่ เป็นเพียงสมมติฐานเพื่อเห็นผลของเวลา ผลตอบแทนจริงผันผวน อาจติดลบ และต้องหักค่าธรรมเนียมกับภาษีที่เกี่ยวข้อง',
    action: { id: 'write-investment-policy', label: 'เขียนเป้าหมาย ระยะเวลา เงินลงทุนต่อเดือน และขาดทุนชั่วคราวที่รับได้ลงในกระดาษหนึ่งใบ' },
    evidence_hint: 'เช่น เป้าหมายกองทุนฉุกเฉินครบ 6 เดือนก่อนเริ่มลงทุน', evidence_placeholder: 'สรุปกติกาการลงทุนของคุณ',
    source: { url: 'https://www.setinvestnow.com/th/beginner', owner: 'SET Investnow', reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES
  },
  {
    id: 'money-lab-debt', duration_minutes: 9, route_tags: ['money_lab'],
    title: 'หนี้และ Leverage: หยุดเลือดไหลก่อนเพิ่มความเสี่ยง',
    decision: 'เห็นหนี้ทุกบัญชี กันค่าอยู่รอด จ่ายขั้นต่ำ และเลือกหนี้เป้าหมายก่อนคิดเรื่องกู้เพิ่มหรือลงทุนด้วยเงินกู้',
    summary: 'หนี้ที่ดูจ่ายไหวในเดือนปกติอาจพังเมื่อรายได้ลดหรือดอกเบี้ยเพิ่ม ต้องวางแผนจากสถานการณ์แย่ ไม่ใช่ค่าเฉลี่ย',
    sections: [
      { title: '1. ทำ Debt Map ให้ครบ', body: 'บันทึกยอดคงเหลือ Effective APR ค่างวด ยอดขั้นต่ำ วันครบกำหนด หลักประกัน และสถานะค้างของทุกบัญชี ถ้าไม่เห็นทั้งหมดจะจัดลำดับผิดได้ง่าย' },
      { title: '2. ปกป้องการอยู่รอดก่อน', body: 'กันค่าอาหาร ที่อยู่ การเดินทาง การรักษา และเงินกันชนขั้นต่ำ จากนั้นรักษายอดขั้นต่ำเพื่อหลีกเลี่ยงค่าปรับ ถ้าจ่ายไม่ไหวให้ติดต่อเจ้าหนี้ก่อนวิกฤต' },
      { title: '3. เลือกวิธีโจมตีและ stress test', body: 'Avalanche ลดดอกเบี้ยรวม Snowball สร้างแรงใจ และการปรับโครงสร้างช่วยเมื่อกระแสเงินสดไม่พอ ทดสอบอีกครั้งเมื่อรายได้ลด ดอกเบี้ยหรือค่างวดเพิ่มพร้อมกัน' },
      { title: '4. Leverage ต้องผ่านทุกประตู', body: 'เงินสด อัตราดอกเบี้ย รายได้ ราคาทรัพย์ สภาพคล่อง อายุหนี้ สกุลเงิน และแผนออกต้องรับความเสี่ยงได้ หากตกแม้แต่ข้อเดียวให้ลดขนาด เปลี่ยนโครงสร้าง หรือไม่กู้' }
    ],
    infographics: [
      { src: './assets/lessons/debt-triage.png', alt: 'แผนภาพห้าขั้นสำหรับคัดกรองและจัดการหนี้', caption: 'ลำดับช่วยชีวิต: เห็นหนี้ทั้งหมด → กันเงินจำเป็น → จ่ายขั้นต่ำ → โจมตีเป้าหมาย → เจรจาก่อนวิกฤต' },
      { src: './assets/lessons/debt-stress-dsr.png', alt: 'กราฟตัวอย่าง DSR เมื่อรายได้ลดหรือดอกเบี้ยเพิ่ม', caption: 'DSR ปกติอาจดูดี แต่สถานการณ์ซ้อนกันสามารถดันภาระเกินเส้นเตือนได้' },
      { src: './assets/lessons/debt-leverage.png', alt: 'กราฟแสดงว่า leverage ขยายทั้งกำไรและขาดทุน', caption: 'Leverage ไม่ได้ขยายเฉพาะกำไร แต่ขยายขาดทุนและความเสี่ยงถูกบังคับขายด้วย' },
      { src: './assets/lessons/debt-eight-gates.png', alt: 'แผนภาพแปดเงื่อนไขก่อนกู้เพื่อการลงทุน', caption: 'ถ้าไม่ผ่านแม้แต่หนึ่ง Gate ให้ลดขนาด เปลี่ยนโครงสร้าง หรือไม่ทำ' }
    ],
    question: 'ถ้าใช้ Leverage 2 เท่า ผลลัพธ์จะเพิ่มเฉพาะตอนกำไรใช่หรือไม่?',
    answer: 'ไม่ใช่ Leverage ขยายทั้งกำไรและขาดทุน และยังเพิ่มความเสี่ยงขาดสภาพคล่อง ถูกเรียกหลักประกัน หรือถูกบังคับขาย',
    action: { id: 'complete-debt-map', label: 'ทำ Debt Map ทุกบัญชีให้ครบอย่างน้อยยอดคงเหลือ APR ยอดขั้นต่ำ และวันครบกำหนด' },
    evidence_hint: 'เช่น ทำ Debt Map ครบ 3 บัญชีแล้ว', evidence_placeholder: 'สิ่งที่ทำเสร็จหรือข้อมูลที่ยังขาด',
    source: { url: 'https://www.bot.or.th/th/satang-story/managing-debt/debt-prioritise.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES
  }
]);

export const DEBT_LEARNING_UNITS = Object.freeze([
  { id: 'before-overdue', duration_minutes: 3, route_tags: ['prevention'], decision: 'ถ้าคาดว่าจะจ่ายงวดหน้าไม่ไหว ให้ติดต่อเจ้าหนี้ก่อนวันครบกำหนด', question: 'ต้องรอเป็นหนี้เสียก่อนจึงขอปรับโครงสร้างหนี้ได้หรือไม่?', answer: 'ไม่ต้องรอ สามารถขอเจรจากับเจ้าหนี้ได้ก่อนเป็นหนี้เสีย', action: { id: 'record-next-due-date', label: 'บันทึกวันครบกำหนดและช่องทางติดต่อเจ้าหนี้' }, source: { url: 'https://www.bot.or.th/th/satang-story/managing-debt/debt-restructuring.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES },
  { id: 'ask-restructure', duration_minutes: 4, route_tags: ['direct_restructuring'], decision: 'เสนอค่างวดที่ยังเหลือเงินสำหรับค่าใช้จ่ายจำเป็น ไม่รับแผนที่ทำไม่ได้', question: 'ก่อนเซ็นแผนใหม่ควรตรวจอะไร?', answer: 'ตรวจค่างวด ดอกเบี้ย ระยะเวลา ยอดรวมที่จ่าย และวันเริ่มชำระในเอกสาร', action: { id: 'prepare-creditor-summary', label: 'เตรียมรายได้ ค่าใช้จ่ายจำเป็น และยอดที่จ่ายไหวเพื่อคุยกับเจ้าหนี้' }, source: { url: 'https://www.bot.or.th/th/satang-story/managing-debt/consumer-loan-restructuring.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES },
  { id: 'debt-clinic', duration_minutes: 4, route_tags: ['debt_clinic_check'], decision: 'ตรวจสิทธิ์คลินิกแก้หนี้ผ่านช่องทางทางการเมื่อเป็น NPL หนี้ไม่มีหลักประกัน', question: 'Debt Clinic ใช้กับหนี้มีหลักประกันทุกประเภทหรือไม่?', answer: 'ไม่ใช่ เส้นทางนี้ระบุบัตรเครดิต บัตรกดเงินสด และสินเชื่อส่วนบุคคลไม่มีหลักประกันตามเงื่อนไข', action: { id: 'check-debt-clinic-eligibility', label: 'รวบรวมเจ้าหนี้ ยอดหนี้ และวันค้างชำระเพื่อตรวจสิทธิ์' }, source: { url: 'https://www.bot.or.th/th/debtsolution/debtsolution-measure.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES },
  { id: 'clear-debt', duration_minutes: 3, route_tags: ['clear_debt_check'], decision: 'ใช้เฉพาะช่องทาง BOT/SAM เพื่อตรวจสิทธิ์ “ปิดหนี้ไว ไปต่อได้”', question: 'โครงการนี้ใช้ได้กับทุกหนี้ที่มีคำพิพากษาแล้วหรือไม่?', answer: 'ไม่ใช่ หน้าทางการระบุว่าหนี้มีคำพิพากษาแล้วไม่อยู่ในขอบเขตโครงการ', action: { id: 'verify-sam-channel', label: 'ตรวจสิทธิ์ผ่าน BOT/SAM และยืนยัน LINE ทางการก่อนทำธุรกรรม' }, source: { url: 'https://www.bot.or.th/th/cleardebt.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES },
  { id: 'legal-stage', duration_minutes: 5, route_tags: ['summons_mediation', 'enforcement_mediation'], decision: 'ห้ามเพิกเฉยต่อหมายศาลหรือคำพิพากษา ให้เก็บเอกสารและขอไกล่เกลี่ยผ่านหน่วยงานทางการ', question: 'การไกล่เกลี่ยชั้นบังคับคดีเป็นการบังคับให้คู่กรณียอมรับข้อเสนอหรือไม่?', answer: 'ไม่ใช่ เป็นกระบวนการสมัครใจและคู่กรณีเป็นผู้ตัดสินใจ', action: { id: 'save-case-deadline', label: 'บันทึกเลขคดี วันนัด และติดต่อกรมบังคับคดีเพื่อขอไกล่เกลี่ย' }, source: { url: 'https://www.led.go.th/news/view/19540', owner: 'กรมบังคับคดี', reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES },
  { id: 'credit-data-dispute', duration_minutes: 3, route_tags: ['credit_data_dispute'], decision: 'ถ้าข้อมูลเครดิตผิด ให้โต้แย้งกับเจ้าหนี้และเครดิตบูโรด้วยหลักฐาน ไม่จ่ายคนกลางเพื่อล้างเครดิต', question: 'ถ้าข้อมูลเครดิตผิดควรเริ่มติดต่อใคร?', answer: 'เริ่มแจ้งสถาบันการเงินเจ้าหนี้ และยื่นขอตรวจสอบ/แก้ไขกับเครดิตบูโรได้', action: { id: 'collect-payment-evidence', label: 'รวบรวมใบเสร็จหรือหนังสือปิดบัญชีและยื่นคำร้องแก้ไข' }, source: { url: 'https://www.bot.or.th/th/satang-story/managing-debt/creditbureau.html', owner: bot, reviewed_date: '2026-08-16' }, mastery_states: MASTERY_STATES }
]);

export const LEARNING_UNITS = Object.freeze([...MONEY_LAB_UNITS, ...DEBT_LEARNING_UNITS]);

export function unitsForRoute(route) { return DEBT_LEARNING_UNITS.filter((unit) => unit.route_tags.includes(route)); }
