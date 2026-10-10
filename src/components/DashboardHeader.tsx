import { Bell, Crown, Search } from "lucide-react";

type DashboardHeaderProps = {
  userEmail?: string | null;
};

export default function DashboardHeader({
  userEmail,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-copy">
        <p className="eyebrow">
          <Crown size={15} />
          Welcome back, Admin
        </p>

        <h1>Dashboard</h1>

        <p className="subtitle">
          Manage your content, subscribers and platform settings.
        </p>
      </div>

      <div className="dashboard-header-actions">
        <div className="header-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search movies, series, or subscribers..."
            aria-label="Search"
          />
        </div>

        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="header-profile">
          <div className="header-profile-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <span>{userEmail || "Administrator"}</span>
          </div>
        </div>

        <div className="status-pill">
          <span className="status-dot" />
          Firebase Connected
        </div>
      </div>
    </header>
  );
}
