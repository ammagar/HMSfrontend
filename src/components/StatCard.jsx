export default function StatCard({ icon, label, value, tone = "teal", sub }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}
