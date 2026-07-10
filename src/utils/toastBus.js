const listeners = new Set();

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(variant, message) {
  listeners.forEach((listener) => listener({ variant, message, id: crypto.randomUUID() }));
}
