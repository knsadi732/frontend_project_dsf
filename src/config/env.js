export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000',
  mockAuth: import.meta.env.VITE_MOCK_AUTH === 'true',
  appName: 'DS Footwear ERP',
};
