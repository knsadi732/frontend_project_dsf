// crypto.randomUUID() only exists in a secure context (HTTPS or localhost)
// — throws on a plain-HTTP deployment. Falls back to a timestamp+counter id
// when the secure-context API isn't available; not cryptographically
// random, but every call site here only needs per-session uniqueness.
let counter = 0;
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  counter += 1;
  return `id-${Date.now()}-${counter}`;
}
