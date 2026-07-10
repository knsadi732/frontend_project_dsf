import { Link } from 'react-router-dom';
import { AppButton } from '@/components/ui/AppButton';

export function ForbiddenPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-danger">403</p>
      <h1 className="text-xl font-semibold text-text">Access denied</h1>
      <p className="max-w-sm text-sm text-text-muted">
        You don't have permission to view this page. Contact an administrator if you think this
        is a mistake.
      </p>
      <AppButton as={Link} to="/dashboard" className="mt-2">
        Back to dashboard
      </AppButton>
    </div>
  );
}
