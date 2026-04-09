import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppState } from "@/state";

const tabs = [
  { to: "/workout", label: "Workout" },
  { to: "/routines", label: "Routines" },
  { to: "/history", label: "History" },
  { to: "/exercises", label: "Exercises" },
] as const;

export function Layout() {
  const location = useLocation();
  const { data } = useAppState();
  const routineForm =
    location.pathname.startsWith("/routines/") && location.pathname !== "/routines";
  const activeSession =
    location.pathname === "/workout" && data.activeWorkout != null;
  const hideNav = routineForm || activeSession;

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-white">Let&apos;s werk aaht 👅💦💪</h1>
          <NavLink
            to="/settings"
            className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            Settings
          </NavLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-around">
            {tabs.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center text-xs font-medium transition-colors",
                    isActive ? "text-orange-400" : "text-slate-500 hover:text-slate-300",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
