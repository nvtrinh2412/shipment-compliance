import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileUp, Ship, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex text-slate-50">
      <aside className="w-64 glass-panel border-r border-slate-700/50 flex flex-col hidden md:flex z-10 sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              S
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Safiri AI
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/ingest" icon={<FileUp size={20} />} label="Ingest Data" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 glass-panel border-b border-slate-700/50 flex items-center px-8 z-10 sticky top-0">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">Admin User</div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({isActive}) => clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]" 
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      )}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
