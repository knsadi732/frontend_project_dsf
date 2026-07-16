import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

// Ch17 Communication Log (17.12): a record of every business event pushed
// through addNotification(), including a simulated 'email' leg for
// customer/vendor-facing events — this mock has no real SMTP/SMS gateway,
// so every simulated send is instantly 'delivered'.
const EMAIL_SIMULATED_TITLES = [
  'Invoice generated',
  'Return approved',
  'Return rejected',
  'Credit note issued',
  'Payment received',
  'Vendor payment recorded',
  'GRN approved — materials received',
];

let mockCommunicationLogs = [];
let nextLogId = 1;

export function addCommunicationLog({ businessEvent, channel, template, recipient = 'All', notificationId = null, entityId = null }) {
  if (!env.mockAuth) return;
  mockCommunicationLogs = [
    {
      id: String(nextLogId++),
      businessEvent,
      recipient,
      channel,
      template: template ?? businessEvent,
      deliveryStatus: 'delivered',
      sentTime: new Date().toISOString(),
      readTime: null,
      retryCount: 0,
      notificationId,
      entityId,
    },
    ...mockCommunicationLogs,
  ];
}

export function logNotificationEvent(notification) {
  addCommunicationLog({ businessEvent: notification.title, channel: 'in_app', recipient: 'All', notificationId: notification.id, entityId: notification.entityId });
  if (EMAIL_SIMULATED_TITLES.some((title) => notification.title.startsWith(title))) {
    addCommunicationLog({ businessEvent: notification.title, channel: 'email', recipient: 'Customer/Vendor', notificationId: notification.id, entityId: notification.entityId });
  }
}

export function markCommunicationLogRead(notificationId) {
  mockCommunicationLogs = mockCommunicationLogs.map((log) =>
    log.notificationId === notificationId && log.channel === 'in_app' && !log.readTime
      ? { ...log, readTime: new Date().toISOString() }
      : log,
  );
}

export const communicationLogApi = {
  list: (params) => {
    if (env.mockAuth) return Promise.resolve({ data: mockCommunicationLogs, total: mockCommunicationLogs.length });
    return apiClient.get('/communication-logs', { params }).then((res) => res.data);
  },
};
