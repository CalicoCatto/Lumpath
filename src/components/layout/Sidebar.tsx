import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: '记录', icon: ClipboardList },
  { path: '/history', label: '诊断', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
] as const;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 flex-col bg-white border-r border-stone-200 w-[4.5rem] lg:w-64 transition-all duration-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 lg:px-6 border-b border-stone-100">
        <span className="text-xl font-bold text-primary-600 hidden lg:block">悟径</span>
        <span className="text-xl font-bold text-primary-600 lg:hidden mx-auto">悟</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 lg:px-3">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 rounded-xl transition-colors
                w-full px-3 py-2.5
                ${active
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className="shrink-0 mx-auto lg:mx-0" />
              <span className="text-sm font-medium hidden lg:block">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 lg:px-4 py-4 border-t border-stone-100">
        <p className="text-[10px] text-stone-300 text-center lg:text-left">Lumpath v1.0</p>
      </div>
    </aside>
  );
}
