import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  FileText,
  AlertTriangle,
  Settings,
  Pill,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily-entry', label: 'Daily Entry', icon: PlusCircle },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/drugs', label: 'Drug List', icon: Pill },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h1 className="text-lg font-bold text-primary">AAM Shivnagri HSC</h1>
          <p className="text-xs text-muted-foreground">Drug Inventory System</p>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            © 2025 Drug Inventory
          </p>
        </div>
      </div>
    </aside>
  );
}
