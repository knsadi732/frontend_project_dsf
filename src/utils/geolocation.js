// Wraps the callback-based navigator.geolocation API in a Promise. Resolves
// `null` instead of rejecting when location is unavailable/denied/timed out
// so callers (attendance check-in) can treat it as "no location" rather than
// a hard failure — a user without location permission should still be
// able to log in.
export function getCurrentPosition({ timeout = 8000 } = {}) {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => resolve(null),
      { timeout, maximumAge: 0 },
    );
  });
}
