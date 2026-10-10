import {
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Users,
} from "lucide-react";

type SidebarProps = {
  activeSection: "dashboard" | "content" | "subscribers";
  onNavigate: (section: "dashboard" | "content" | "subscribers") => void;
  pendingCount: number;
  userEmail?: string | null;
  onLogout: () => void;
};

export default function Sidebar({
  activeSection,
  onNavigate,
  pendingCount,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src="/assets/cinegen_logo_mockup.png"
          alt="CineGen Digital"
          className="cinegen-logo"
        />
      </div>

      <nav className="cinegen-nav">
        <button
          type="button"
          className={`nav-item ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-item ${
            activeSection === "content" ? "active" : ""
          }`}
          onClick={() => onNavigate("content")}
        >
          <PlayCircle size={19} />
          <span>Content</span>
        </button>

        <button
          type="button"
          className={`nav-item ${
            activeSection === "subscribers" ? "active" : ""
          }`}
          onClick={() => onNavigate("subscribers")}
        >
          <Users size={19} />
          <span>Subscribers</span>

          {pendingCount > 0 && (
            <span className="subscriber-count">{pendingCount}</span>
          )}
        </button>

        <button
          type="button"
          className="nav-item sidebar-signout"
          onClick={onLogout}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </nav>
    </aside>
  );
}


