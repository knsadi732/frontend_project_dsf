import { io } from 'socket.io-client';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

export const socket = io(env.socketUrl, {
  autoConnect: false,
  transports: ['websocket'],
  reconnectionAttempts: 3,
});

export function connectSocket() {
  if (env.mockAuth) return;
  socket.auth = { token: useAuthStore.getState().accessToken };
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
