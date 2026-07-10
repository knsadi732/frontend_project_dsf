import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/layouts/components/Sidebar';
import { Header } from '@/layouts/components/Header';
import { Footer } from '@/layouts/components/Footer';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
