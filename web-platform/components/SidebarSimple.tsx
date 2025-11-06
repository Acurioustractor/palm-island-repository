'use client';

export default function SidebarSimple() {
  return (
    <aside className="sidebar-nav">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral-warm rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">PI</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Palm Island</h2>
            <p className="text-white/60 text-xs">Story Server</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <a href="/dashboard" className="sidebar-nav-item block">
          <span className="font-medium">Dashboard</span>
        </a>
        <a href="/stories" className="sidebar-nav-item block">
          <span className="font-medium">Stories</span>
        </a>
        <a href="/storytellers" className="sidebar-nav-item block">
          <span className="font-medium">People</span>
        </a>
        <a href="/search" className="sidebar-nav-item block">
          <span className="font-medium">Search</span>
        </a>
      </nav>
    </aside>
  );
}
