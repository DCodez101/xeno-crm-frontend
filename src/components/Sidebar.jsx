import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Filter, Megaphone } from 'lucide-react';

const links = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/customers', label: 'Customers',  icon: Users },
  { to: '/segments',  label: 'Segments',   icon: Filter },
  { to: '/campaigns', label: 'Campaigns',  icon: Megaphone },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#111210' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#E8622A' }}>
            <span className="text-white font-bold text-sm">X</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none font-display">XenoCRM</p>
            <p className="text-xs mt-0.5 leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>Fashion Suite</p>
          </div>
        </div>
      </div>

      {/* Brand pill */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-2 rounded-md px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#E8622A' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Zara Collective</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-150"
            style={({ isActive }) => ({
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                    style={{ width: '2px', height: '20px', background: '#E8622A' }}
                  />
                )}
                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Xeno SDE Assignment</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.15)' }}>v1.0 · 2026</p>
      </div>
    </aside>
  );
}
