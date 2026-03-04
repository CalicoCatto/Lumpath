import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: '记录', icon: ClipboardList },
  { path: '/history', label: '诊断', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
] as const;

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide tab bar on diagnosis detail page
  if (location.pathname.startsWith('/diagnosis/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                active ? 'text-primary-600' : 'text-stone-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
