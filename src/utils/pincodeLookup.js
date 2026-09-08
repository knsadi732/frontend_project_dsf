// India Post's free public PIN code API — no key needed. Returns the
// district (used as our "city", since we don't store a separate district
// column — see 0120_alter_customers_add_address_fields.sql) and state for a
// 6-digit PIN. Cached in-memory since the same PIN is often looked up
// repeatedly while a user is typing/correcting an address.
const cache = new Map();

export async function lookupPincode(pincode) {
  if (cache.has(pincode)) return cache.get(pincode);

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) throw new Error('Pincode lookup failed');
    const [payload] = await res.json();
    const office = payload?.Status === 'Success' ? payload.PostOffice?.[0] : null;
    const result = office ? { city: office.District, state: office.State } : null;
    cache.set(pincode, result);
    return result;
  } catch {
    // Offline/blocked/rate-limited — treat like "not found" so the caller
    // falls back to manual entry instead of surfacing a hard error.
    return null;
  }
}
