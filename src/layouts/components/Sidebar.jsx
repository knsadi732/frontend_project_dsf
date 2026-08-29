import { NavLink } from 'react-router-dom';
import { ChevronsLeft, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLayoutStore } from '@/store/layoutStore';
import { NAV_ITEMS } from '@/layouts/components/navConfig';
import { cn } from '@/utils/cn';
import logo from '@/assets/logo.png';

function SidebarContent({ collapsed, onNavigate }) {
  const { can } = useAuth();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_ITEMS.filter((item) => can(item.module, 'view')).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
            )
          }
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useLayoutStore();

  return (
    <>
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border bg-surface transition-[width] md:flex md:flex-col',
          sidebarCollapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <div className="flex min-w-0 items-center gap-2">
            {!sidebarCollapsed && (
              <>
                <img src={logo} alt="DS Footwear" className="size-8 shrink-0 rounded-md object-cover" />
                <span className="truncate text-sm font-semibold text-text">DS Footwear</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
          >
            <ChevronsLeft className={cn('size-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileSidebar} aria-hidden="true" />
          <aside className="relative flex w-64 flex-col bg-surface shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <div className="flex min-w-0 items-center gap-2">
                <img src={logo} alt="DS Footwear" className="size-8 shrink-0 rounded-md object-cover" />
                <span className="truncate text-sm font-semibold text-text">DS Footwear</span>
              </div>
              <button
                type="button"
                onClick={closeMobileSidebar}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent collapsed={false} onNavigate={closeMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  );
}
