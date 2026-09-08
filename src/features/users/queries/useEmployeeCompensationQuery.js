import { useQuery } from '@tanstack/react-query';
import { employeeCompensationApi } from '@/services/employeeCompensation.api';

// Silent on failure by design: a 403 (no employee_compensation.view
// permission) or 404 (no active structure for this employee) both just
// mean "don't show the Compensation section" — the backend is the real
// gate, this hook doesn't editorialize about *why* there's no data.
export function useEmployeeCompensationQuery(userId) {
  return useQuery({
    queryKey: ['employeeCompensation', 'detail', userId],
    queryFn: () => employeeCompensationApi.getForUser(userId),
    enabled: Boolean(userId),
    retry: false,
    throwOnError: false,
  });
}
