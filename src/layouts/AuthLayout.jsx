import { Outlet } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="DS Footwear" className="size-16 rounded-lg object-cover" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
