import { NavLink } from 'react-router-dom';
import HomeIcon from '../../assets/icons/interface/home.svg?react';
import CalendarIcon from '../../assets/icons/interface/calendar.svg?react';
import AnalyticsIcon from '../../assets/icons/interface/analytics.svg?react';
import HeartIcon from '../../assets/icons/interface/heart.svg?react';
import SettingIcon from '../../assets/icons/interface/setting.svg?react';

const tabs = [
  { to: '/',          label: 'Home',      Icon: HomeIcon },
  { to: '/plan',      label: 'Plan',      Icon: CalendarIcon },
  { to: '/progress',  label: 'Progress',  Icon: AnalyticsIcon },
  { to: '/wellbeing', label: 'Wellbeing', Icon: HeartIcon },
  { to: '/settings',  label: 'Settings',  Icon: SettingIcon },
];

export function ParentBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line z-20 pb-safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
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
