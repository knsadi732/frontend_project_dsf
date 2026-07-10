import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { useLayoutStore } from '@/store/layoutStore';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { useKeyPress } from '@/hooks/useKeyPress';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const toggleMobileSidebar = useLayoutStore((state) => state.toggleMobileSidebar);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useKeyPress('Escape', () => setMenuOpen(false), { enabled: menuOpen });

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
        className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover"
          >
            <BaseAvatar name={user?.name} size="sm" />
            <span className="hidden text-sm font-medium text-text sm:block">{user?.name}</span>
            <ChevronDown className="size-3.5 text-text-muted" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-surface py-1 shadow-lg"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="truncate text-xs text-text-muted">{user?.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-surface-hover"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
