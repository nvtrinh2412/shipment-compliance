import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileUp, Terminal } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col hidden md:flex z-10 sticky top-0 h-screen">
        <div className="p-6 flex items-center justify-center">
          <img
            src="https://safiri.ai/assets/83704efc2ce0b1c75f078d456514357d7c017f63-CrIDFKJA.png"
            alt="Safiri AI"
            className="h-15 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/ingest" icon={<FileUp size={20} />} label="Ingest Data" />
          <NavItem to="/playground" icon={<Terminal size={20} />} label="API Playground" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center px-8 z-10 sticky top-0 shadow-sm shadow-slate-100/40">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-600">Admin User</div>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              AU
            </div>
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
      className={({ isActive }) => clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border",
        isActive
          ? "bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_12px_rgba(0,155,111,0.05)]"
          : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
