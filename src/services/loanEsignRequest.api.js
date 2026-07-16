import { createCrudApi } from '@/services/api/createCrudApi';
import { loanEsignRequests } from '@/services/api/mockDb';
import { addCommunicationLog } from '@/services/communicationLog.api';
import { queryClient } from '@/config/queryClient';
import { queryKeys } from '@/config/queryKeys';

// Loan Agreement e-Sign: there's no real email service in this mock, so
// "sending" the request is simulated — logged to the Communication Log with
// the manually-entered email as recipient — and a shareable /esign/:token
// link is generated for the Finance user to hand to the counter-party
// directly. The counter-party has no ERP login and opens the link as a
// fresh page load (a new tab, or literally after receiving it) — every
// other entity in this mock lives in plain in-memory arrays that reset on
// reload, which would make the link "forget" the request the moment it's
// opened anywhere but the exact tab that created it. So this one entity is
// persisted to localStorage as well, hydrated back into the shared array on
// module load. That only survives within the same browser (not across
// different devices/machines — there's still no real backend to hand the
// data to a genuinely separate party), but it's what makes "open the link,
// sign it, come back" actually work in this mock.
const STORAGE_KEY = 'dsFootwearErp.loanEsignRequests';

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loanEsignRequests));
  } catch {
    // localStorage unavailable (private browsing quota, etc.) — the request
    // still works for the tab that created it, it just won't survive reload.
  }
}

(function hydrate() {
  if (loanEsignRequests.length > 0) return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(stored)) loanEsignRequests.push(...stored);
  } catch {
    // corrupt/unavailable storage — start empty, same as every other entity.
  }
})();

// Cross-tab sync: the `storage` event fires in every OTHER same-origin tab
// when one tab writes this key (e.g. the counter-party signing in the tab
// opened from the shared link) — without this, a Finance tab left open
// during signing would keep showing "Pending" until manually reloaded.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      const stored = JSON.parse(event.newValue ?? '[]');
      if (!Array.isArray(stored)) return;
      loanEsignRequests.length = 0;
      loanEsignRequests.push(...stored);
      queryClient.invalidateQueries({ queryKey: queryKeys.loanEsignRequests.all });
    } catch {
      // ignore malformed cross-tab payloads
    }
  });
}

const baseApi = createCrudApi('loanEsignRequests', loanEsignRequests, { dateField: 'createdDate' });

export const loanEsignRequestApi = {
  ...baseApi,
  create: (payload) =>
    baseApi.create(payload).then((record) => {
      addCommunicationLog({
        businessEvent: 'Loan e-sign request sent',
        channel: 'email',
        recipient: record.email,
        template: 'Loan e-sign request',
      });
      persist();
      return record;
    }),
};

export function getLoanEsignRequestByToken(token) {
  return loanEsignRequests.find((request) => request.token === token) ?? null;
}

export function signLoanEsignRequest(token, signerName) {
  const request = loanEsignRequests.find((item) => item.token === token);
  if (!request || request.status === 'signed') return request ?? null;

  request.status = 'signed';
  request.signedAt = new Date().toISOString();
  request.signerName = signerName;
  persist();
  return request;
}
