import { generateId } from '@/utils/generateId';

const listeners = new Set();

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// This fires right after login (see useLoginMutation's onSuccess), so a
// throw here — crypto.randomUUID() throws outside a secure context (plain
// HTTP) — used to abort the promise chain before the post-login navigate()
// ever ran. generateId() falls back safely instead of throwing.
export function pushToast(variant, message) {
  listeners.forEach((listener) => listener({ variant, message, id: generateId() }));
}
