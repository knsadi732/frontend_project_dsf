import { Link } from 'react-router-dom';
import { AppButton } from '@/components/ui/AppButton';

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-xl font-semibold text-text">Page not found</h1>
      <p className="max-w-sm text-sm text-text-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <AppButton as={Link} to="/dashboard" className="mt-2">
        Back to dashboard
      </AppButton>
    </div>
  );
}
