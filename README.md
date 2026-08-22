# First Jobber Money Lab — UX/UI Redesign Handoff

## Product in one sentence

แพลตฟอร์มเรียนรู้การเงินสำหรับ First Jobber ไทยที่ให้ผู้เรียนเรียน ทดลอง และตัดสินใจเรื่องภาษี การลงทุน และหนี้ผ่านบทเรียนกับสถานการณ์จำลอง โดยไม่ใช้เงินจริง

## Links

- Live demo: https://satangtecha.github.io/first-jobber-money-lab/
- Public frontend repository: https://github.com/satangtecha/first-jobber-money-lab
- Full source repository: https://github.com/satangtecha/first-jobber-debt-navigator

## User feedback that must drive the redesign

งานปัจจุบันยังดู generic, text-heavy, ไม่สร้างสรรค์ และเหมือน dashboard ที่ประกอบจาก card จำนวนมาก ผู้ใช้ไม่ต้องการการเปลี่ยนสีหรือ reskin เล็กน้อย แต่ต้องการให้คิด information architecture, interaction, visual storytelling และระบบการเรียนใหม่อย่างจริงจัง

## Redesign authority

อนุญาตให้รื้อและออกแบบใหม่ทั้งหมดในขอบเขตต่อไปนี้:

- Information architecture และ navigation
- Home / learning dashboard
- Course map, lesson player, practice, quiz และ progress
- Tax Lab, Investment Simulator และ Debt Navigator
- Responsive layout, typography, illustration, charts และ micro-interactions

## Contracts that must be preserved

- ห้ามเปลี่ยนผลคำนวณของ `rules.js`, `debt-engine.js`, `payoff-engine.js`, `tax-lab.js` และ `investment-sim.js`
- รักษาข้อมูลเดิมใน local state, authentication, API และ persistence contract
- รักษา `data-action`, `data-screen`, input IDs และ delegated event behavior หรือทำ migration ที่มีเอกสารและ test
- ห้ามใส่ OTP, secret key, service-role key หรือข้อมูลการเงินจริงไว้ใน frontend
- เนื้อหาการเงินต้องคง source/review metadata และขอบเขตว่าเป็นเครื่องมือเรียนรู้

## Important source locations

- App/view orchestration: `web/public/app.js`
- Shared UI primitives: `web/public/ui-primitives.js`
- Current redesign layer: `web/public/product-redesign.css`
- Curriculum and progression: `web/public/curriculum.js`, `web/public/academy-state.js`
- Financial engines: `web/public/rules.js`, `web/public/debt-engine.js`, `web/public/payoff-engine.js`, `web/public/tax-lab.js`, `web/public/investment-sim.js`
- Backend/API boundary: `web/server.js`, `web/backend/`, `web/public/api-client.js`
- Automated checks: `web/tests/`

## Local run

```powershell
cd web
npm install
npm start
```

Open `http://127.0.0.1:4177/`.

## Verification

```powershell
cd web
npm run check
npm run test:all
```

## Required design process

1. Audit the current application screen by screen.
2. Propose three genuinely different product directions before implementation.
3. Select one direction and define typography, color, spacing, icon, chart and motion systems.
4. Produce mobile and desktop wireframes for the complete learning loop and all three Labs.
5. Implement one end-to-end vertical slice and visually compare it with the current version.
6. Continue only after the slice establishes a clear quality bar.
7. Verify mobile, desktop, keyboard, reduced motion, loading, empty, error and completed states.

## Acceptance criteria

- The result must not look like a generic admin dashboard or a collection of white cards.
- Each screen must have one primary user decision and a clear next action.
- Learning must visibly connect concept, worked example, practice, quiz and real-life action.
- Simulations must show meaningful causality and trade-offs, not decorative charts.
- Thai copy must be direct, readable and natural.
- Mobile layouts must be intentionally designed rather than scaled-down desktop screens.
- Existing automated tests remain green, and new interaction tests cover redesigned routes.

## Security and packaging

The repository and handoff archive intentionally exclude `.env`, dependencies, build outputs, signing files and secrets. Use `.env.example` for configuration names only.
