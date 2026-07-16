// `mockLogin` is deliberately separate from `mockAuth` — every other feature
// module (products, customers, sales, ...) still runs entirely on the mock
// in-memory store gated by `mockAuth`; only the auth flow itself (login/
// logout/me) needs to hit the real backend now that it exists. If
// VITE_MOCK_LOGIN isn't set at all, it falls back to `mockAuth` so nothing
// changes for anyone not opting into this.
const mockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000',
  mockAuth,
  mockLogin: import.meta.env.VITE_MOCK_LOGIN != null ? import.meta.env.VITE_MOCK_LOGIN === 'true' : mockAuth,
  appName: 'DS Footwear ERP',
};
