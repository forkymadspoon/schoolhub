import { NavLink } from 'react-router-dom';
import TickIcon from '../../assets/icons/interface/tick.svg?react';
import StarIcon from '../../assets/icons/interface/star.svg?react';
import SettingIcon from '../../assets/icons/interface/setting.svg?react';

const tabs = [
  { to: '/student',          label: 'Today',    Icon: TickIcon },
  { to: '/student/stats',    label: 'Stats',    Icon: StarIcon },
  { to: '/student/settings', label: 'Settings', Icon: SettingIcon },
];

export function StudentBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line z-20 pb-safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/student'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.Icon className={`w-6 h-6 ${isActive ? '' : 'opacity-50'}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
