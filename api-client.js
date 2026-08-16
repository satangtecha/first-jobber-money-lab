// Optional server sync boundary. The current UI remains local-first until a
// verified session exists; this module never stores tokens in localStorage.
export async function requestMagicLink(email) {
  const response = await fetch('/api/auth/request-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
  if (!response.ok) throw new Error((await response.json()).error || 'AUTH_REQUEST_FAILED');
  return response.json();
}

export async function verifyMagicLink(token) {
  const response = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), credentials: 'include' });
  if (!response.ok) throw new Error((await response.json()).error || 'AUTH_VERIFY_FAILED');
  return response.json();
}

export async function getSessionUser() {
  const response = await fetch('/api/me', { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error((await response.json()).error || 'SESSION_CHECK_FAILED');
  return (await response.json()).user || null;
}

export async function savePlan(plan) {
  const response = await fetch('/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan, (_key, value) => typeof value === 'bigint' ? value.toString() : value), credentials: 'include' });
  if (!response.ok) throw new Error((await response.json()).error || 'PLAN_SAVE_FAILED');
  return response.json();
}

export async function loadPlans() {
  const response = await fetch('/api/plans', { credentials: 'include' });
  if (!response.ok) throw new Error((await response.json()).error || 'PLAN_LOAD_FAILED');
  return response.json();
}

async function debtApi(path, options = {}) { const response = await fetch(path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } }); if (!response.ok) throw new Error((await response.json()).error || 'DEBT_API_FAILED'); return response.status === 204 ? null : response.json(); }
export const createDebtAssessment = (assessment) => debtApi('/api/debt-navigator/assessments', { method: 'POST', body: JSON.stringify(assessment, (_key, value) => typeof value === 'bigint' ? value.toString() : value) });
export const listDebtAssessments = () => debtApi('/api/debt-navigator/assessments');
export const deleteDebtAssessment = (id) => debtApi(`/api/debt-navigator/assessments/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const createDebtAction = (action) => debtApi('/api/debt-navigator/actions', { method: 'POST', body: JSON.stringify(action) });
export const listDebtActions = (assessmentId) => debtApi(`/api/debt-navigator/actions${assessmentId ? `?assessment_id=${encodeURIComponent(assessmentId)}` : ''}`);
export const updateDebtAction = (id, patch) => debtApi(`/api/debt-navigator/actions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
