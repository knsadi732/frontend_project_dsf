export const TOAST_MESSAGES = {
  CREATE_SUCCESS: (entity) => `${entity} created successfully`,
  UPDATE_SUCCESS: (entity) => `${entity} updated successfully`,
  DELETE_SUCCESS: (entity) => `${entity} deleted successfully`,
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Unable to reach the server. Check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been signed out.',
};
