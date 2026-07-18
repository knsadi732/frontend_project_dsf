// Real backend has no "must change password on first login" flag (no such
// field in user.validator.js / GET /auth/me), so there's no way to detect
// this from the API. This tracks it client-side instead — same pattern as
// loanEsignRequest.api.js's localStorage persistence — keyed by the phone
// number HR used to create the account. Best-effort: only works if the
// employee's first login happens in the same browser HR used, since there's
// nowhere real to store this server-side.
const STORAGE_KEY = 'dsFootwearErp.pendingPasswordChange';

function readAll() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function writeAll(phones) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phones));
  } catch {
    // localStorage unavailable — the flag just won't survive/apply.
  }
}

export function markPendingPasswordChange(phone) {
  if (!phone) return;
  const phones = readAll();
  if (!phones.includes(phone)) writeAll([...phones, phone]);
}

export function isPendingPasswordChange(phone) {
  return Boolean(phone) && readAll().includes(phone);
}

export function clearPendingPasswordChange(phone) {
  if (!phone) return;
  writeAll(readAll().filter((item) => item !== phone));
}
