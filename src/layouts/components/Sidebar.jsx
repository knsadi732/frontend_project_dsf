import { useState } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronsLeft, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLayoutStore } from '@/store/layoutStore';
import { NAV_ITEMS } from '@/layouts/components/navConfig';
import { cn } from '@/utils/cn';
import { DsLogoMark } from '@/components/ui/DsLogoMark';

const linkClasses = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text',
    isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
  );

// Accordion sub-list: only one module's children are expanded at a time —
// clicking an already-expanded module collapses it, clicking another
// collapses whichever was open and expands the one just clicked.
function SidebarContent({ collapsed, onNavigate }) {
  const { can } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const items = NAV_ITEMS.filter((item) => can(item.module, 'view'));
  const activeItem = items.find((item) => location.pathname.startsWith(item.to));
  const [expandedTo, setExpandedTo] = useState(activeItem?.children ? activeItem.to : null);

  // Re-derive the expanded module whenever the active route's module changes
  // (e.g. a dashboard tile or breadcrumb navigates elsewhere) — done during
  // render, not an effect, so it takes effect before the first paint of the
  // new route instead of flashing the old module's sub-list open first.
  const [trackedModule, setTrackedModule] = useState(activeItem?.to ?? null);
  if ((activeItem?.to ?? null) !== trackedModule) {
    setTrackedModule(activeItem?.to ?? null);
    setExpandedTo(activeItem?.children ? activeItem.to : null);
  }

  const activeTab = searchParams.get('tab');

  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const isModuleActive = location.pathname.startsWith(item.to);

        if (!item.children) {
          return (
            <NavLink key={item.to} to={item.to} onClick={onNavigate} className={linkClasses}>
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        }

        const isExpanded = !collapsed && expandedTo === item.to;
        const defaultChildKey = item.children[0].key;

        return (
          <div key={item.to}>
            <NavLink
              to={item.to}
              onClick={(event) => {
                event.preventDefault();
                setExpandedTo((prev) => (prev === item.to ? null : item.to));
              }}
              className={linkClasses}
              aria-expanded={isExpanded}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn('size-4 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                </>
              )}
            </NavLink>

            {isExpanded && (
              <div className="ml-4 flex flex-col gap-1 border-l border-border pl-3 pt-1">
                {item.children.map((child) => {
                  const isChildActive = isModuleActive && (activeTab ? activeTab === child.key : child.key === defaultChildKey);
                  return (
                    <NavLink
                      key={child.key}
                      to={`${item.to}?tab=${child.key}`}
                      onClick={onNavigate}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text',
                        isChildActive && 'bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary',
                      )}
                    >
                      {child.label}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
                <DsLogoMark size={22} />
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
        <div className="flex-1 overflow-y-auto">
          <SidebarContent collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileSidebar} aria-hidden="true" />
          <aside className="relative flex w-64 flex-col bg-surface shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <div className="flex min-w-0 items-center gap-2">
                <DsLogoMark size={22} />
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
            <div className="flex-1 overflow-y-auto">
              <SidebarContent collapsed={false} onNavigate={closeMobileSidebar} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
