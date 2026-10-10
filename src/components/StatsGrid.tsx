import { Film, PlayCircle, ShieldCheck, Users } from "lucide-react";

type StatsGridProps = {
  totalContent: number;
  published: number;
  pendingSubscribers: number;
  activeSubscribers: number;
};

export default function StatsGrid({
  totalContent,
  published,
  pendingSubscribers,
  activeSubscribers,
}: StatsGridProps) {
  return (
    <section id="dashboard-section" className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Film size={21} />
        </div>
        <div>
          <span>Admin Entries</span>
          <strong>{totalContent}</strong>
          <small>Movies & Series</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <PlayCircle size={21} />
        </div>
        <div>
          <span>Published</span>
          <strong>{published}</strong>
          <small>Published content</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <Users size={21} />
        </div>
        <div>
          <span>Pending Approval</span>
          <strong>{pendingSubscribers}</strong>
          <small>New requests</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <span>Active Subscribers</span>
          <strong>{activeSubscribers}</strong>
          <small>Approved users</small>
        </div>
      </div>
    </section>
  );
}
