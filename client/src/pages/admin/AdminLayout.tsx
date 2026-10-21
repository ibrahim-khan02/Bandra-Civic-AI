import { NavLink, Outlet  } from "react-router-dom";

const navItems = [
  { label: "Overview", path: "/admin", icon: "◫", end: true },
  { label: "Complaints", path: "/admin/complaints", icon: "▤", end: false },
  { label: "Zonal Map", path: "/admin/map", icon: "⌖", end: false },
];








export const AdminLayout = () => {
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Admin sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Bandra Civic AI
            </p>
            <h1 className="mt-2 text-xl font-bold">Admin Portal</h1>
            <p className="mt-1 text-sm text-slate-500">
              Civic complaint management
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <NavLink
              to="/"
              className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
            >
              ← Back to Citizen Website
            </NavLink>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">Bandra East & West</p>
              <h2 className="text-lg font-semibold">Civic Administration</h2>
            </div>
            {/* <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              Admin UI Preview
            </span> */}
          </header>

          {/* Mobile navigation */}
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white p-3 md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? "bg-emerald-50 font-semibold text-emerald-800"
                      : "text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <main className="p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

