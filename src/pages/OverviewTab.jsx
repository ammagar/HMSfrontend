import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";
import { IconStethoscope, IconHeadset, IconUsers, IconCalendar, IconRupee } from "../components/Icons";
import { api } from "../api";

export default function OverviewTab({ setError, onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) {
    return (
      <div className="card">
        <p style={{ color: "var(--muted)" }}>Loading overview…</p>
      </div>
    );
  }

  const { counts, today, trend, recentPatients, recentBills } = stats;

  return (
    <>
      <div className="stat-card-grid">
        <StatCard icon={<IconStethoscope size={20} />} label="Doctors" value={counts.doctors} tone="teal" />
        <StatCard icon={<IconHeadset size={20} />} label="Receptionists" value={counts.receptionists} tone="mint" />
        <StatCard icon={<IconUsers size={20} />} label="Total patients" value={counts.patients} tone="teal" />
        <StatCard icon={<IconCalendar size={20} />} label="Today's appointments" value={today.appointments} tone="coral" />
        <StatCard icon={<IconRupee size={20} />} label="Today's collection" value={`₹${today.collection.toFixed(0)}`} tone="coral" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Last 7 days</h3>
        </div>
        <TrendChart data={trend} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Recently registered patients</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("patients")}>
              View all
            </button>
          </div>
          {recentPatients.map((p) => (
            <div className="activity-row" key={p.id}>
              <div className="avatar-circle">{initials(p.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="truncate">{p.name}</strong>
                <div className="activity-sub mono">{p.patient_code}</div>
              </div>
              <span className="badge" style={{ background: "var(--mint-50)", color: "var(--teal-900)", textTransform: "capitalize" }}>
                {p.created_by}
              </span>
            </div>
          ))}
          {!recentPatients.length && <p className="help-text">No patients registered yet.</p>}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent bills</h3>
          </div>
          {recentBills.map((b) => (
            <div className="activity-row" key={b.id}>
              <div className="avatar-circle" style={{ background: "var(--coral-500)" }}>
                ₹
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="truncate">{b.patient_name || "Patient"}</strong>
                <div className="activity-sub">{b.doctor_name ? `Dr. ${b.doctor_name}` : "—"}</div>
              </div>
              <strong className="mono">₹{Number(b.total).toFixed(0)}</strong>
            </div>
          ))}
          {!recentBills.length && <p className="help-text">No bills recorded yet.</p>}
        </div>
      </div>
    </>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
