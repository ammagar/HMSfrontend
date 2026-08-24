import { IconOverview, IconStethoscope, IconHeadset, IconUsers } from "./Icons";

const NAV = [
  { key: "overview", label: "Overview", icon: IconOverview },
  { key: "doctors", label: "Doctors", icon: IconStethoscope, countKey: "doctors" },
  { key: "receptionists", label: "Receptionists", icon: IconHeadset, countKey: "receptionists" },
  { key: "patients", label: "Patients", icon: IconUsers, countKey: "patients" },
];

export default function AdminSidebar({ tab, setTab, counts }) {
  return (
    <nav className="admin-sidebar">
      {NAV.map(({ key, label, icon: Icon, countKey }) => (
        <button key={key} className={`admin-nav-item ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
          <Icon size={18} />
          <span>{label}</span>
          {countKey && counts?.[countKey] !== undefined && <span className="admin-nav-count">{counts[countKey]}</span>}
        </button>
      ))}
    </nav>
  );
}
