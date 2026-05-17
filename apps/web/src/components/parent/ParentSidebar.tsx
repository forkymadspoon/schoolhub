import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import HomeIcon from '../../assets/icons/interface/home.svg?react';
import CalendarIcon from '../../assets/icons/interface/calendar.svg?react';
import AnalyticsIcon from '../../assets/icons/interface/analytics.svg?react';
import HeartIcon from '../../assets/icons/interface/heart.svg?react';
import SettingIcon from '../../assets/icons/interface/setting.svg?react';
import UserIcon from '../../assets/icons/interface/user.svg?react';

const navItems = [
  { to: '/',          label: 'Home',      Icon: HomeIcon },
  { to: '/plan',      label: 'Plan',      Icon: CalendarIcon },
  { to: '/progress',  label: 'Progress',  Icon: AnalyticsIcon },
  { to: '/wellbeing', label: 'Wellbeing', Icon: HeartIcon },
  { to: '/settings',  label: 'Settings',  Icon: SettingIcon },
];

export function ParentSidebar() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  useEffect(() => {
    void api.get<Child[]>('/children').then(c => {
      setChildren(c);
      if (c[0]) setActiveChildId(c[0].id);
    }).catch(() => null);
  }, []);

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-7 bottom-0 w-60 bg-surface border-r border-line z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[90px] border-b border-line">
        <img src="/logo.svg" alt="SchoolHub" className="w-40 h-auto" />
      </div>

      {/* Child switcher */}
      <div className="px-4 py-3 border-b border-line">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Child</p>
        <div className="flex flex-wrap gap-1.5">
          {children.map(child => (
            <button
              key={child.id}
              type="button"
              onClick={() => setActiveChildId(child.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-pill transition-colors min-h-0 min-w-0 ${
                activeChildId === child.id
                  ? 'bg-primary text-white'
                  : 'bg-primary-soft text-primary hover:bg-primary/20'
              }`}
            >
              {child.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="text-xs font-semibold px-3 py-1.5 rounded-pill transition-colors min-h-0 min-w-0 border border-dashed border-line text-muted hover:border-primary hover:text-primary"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm min-h-0 ${
                isActive
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted hover:bg-primary-soft/50 hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'opacity-50'}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-line">
        <button
          type="button"
          onClick={() => navigate('/student')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted hover:bg-primary-soft/50 hover:text-ink transition-colors text-sm font-medium min-h-0 w-full"
        >
          <UserIcon className="w-5 h-5 flex-shrink-0 opacity-50" />
          Student view
        </button>
      </div>
    </aside>
  );
}
