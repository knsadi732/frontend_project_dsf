import { useEffect, useRef, useState } from 'react';
import { lookupPincode } from '@/utils/pincodeLookup';

// Debounced state/city autofill as a 6-digit PIN is typed. `onResolved` sets
// the form fields but they stay ordinary editable inputs, so a user can
// always overwrite the guess when it doesn't match the customer's real
// address (rural PINs frequently span districts, and India Post's data has
// gaps).
export function usePincodeAutofill(pincode, onResolved) {
  const [asyncStatus, setAsyncStatus] = useState('idle');
  const lastLookedUp = useRef('');

  const digits = (pincode ?? '').trim();
  const isValidPin = /^\d{6}$/.test(digits);

  useEffect(() => {
    if (!isValidPin) {
      lastLookedUp.current = '';
      return undefined;
    }
    if (digits === lastLookedUp.current) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setAsyncStatus('loading');
      const result = await lookupPincode(digits);
      if (cancelled) return;
      lastLookedUp.current = digits;
      if (result) {
        setAsyncStatus('resolved');
        onResolved(result);
      } else {
        setAsyncStatus('not_found');
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [digits, isValidPin, onResolved]);

  return isValidPin ? asyncStatus : 'idle';
}

export const PINCODE_STATUS_TEXT = {
  loading: 'Looking up PIN code…',
  resolved: 'City/state auto-filled from PIN — edit if incorrect.',
  not_found: 'PIN not recognized — enter city/state manually.',
};
