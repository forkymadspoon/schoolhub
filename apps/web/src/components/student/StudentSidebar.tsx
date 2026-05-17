import { NavLink, useNavigate } from 'react-router-dom';
import TickIcon from '../../assets/icons/interface/tick.svg?react';
import StarIcon from '../../assets/icons/interface/star.svg?react';
import SettingIcon from '../../assets/icons/interface/setting.svg?react';
import UserIcon from '../../assets/icons/interface/user.svg?react';

const navItems = [
  { to: '/student',          label: 'Today',    Icon: TickIcon },
  { to: '/student/stats',    label: 'Stats',    Icon: StarIcon },
  { to: '/student/settings', label: 'Settings', Icon: SettingIcon },
];

export function StudentSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-line z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-line">
        <img src="/logo.svg" alt="SchoolHub" className="w-40 h-auto" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student'}
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

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-line">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted hover:bg-primary-soft/50 hover:text-ink transition-colors text-sm font-medium min-h-0 w-full"
        >
          <UserIcon className="w-5 h-5 flex-shrink-0 opacity-50" />
          Parent view
        </button>
      </div>
    </aside>
  );
}
