import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PrescriptionModal from "../components/PrescriptionModal";
import HistoryModal from "../components/HistoryModal";
import { api, openPdf } from "../api";
import { useAuth } from "../AuthContext";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [rxTarget, setRxTarget] = useState(null); // { patient, appointmentId }
  const [historyTarget, setHistoryTarget] = useState(null); // patient
  const [lookupCode, setLookupCode] = useState("");
  const [lookupError, setLookupError] = useState("");

  const load = () =>
    api
      .get("/doctor/patients/today")
      .then(setPatients)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const markDiagnosed = async (appt) => {
    try {
      await api.patch(`/doctor/appointments/${appt.id}/status`, { status: "diagnosed" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const openHistoryByCode = async (e) => {
    e.preventDefault();
    setLookupError("");
    if (!lookupCode.trim()) return;
    try {
      const patient = await api.get(`/doctor/patients/by-code/${encodeURIComponent(lookupCode.trim())}`);
      setHistoryTarget(patient);
    } catch (err) {
      setLookupError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <h2>Dr. {user?.name}</h2>
        <p style={{ color: "var(--muted)" }}>Today, {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stat-row">
          <div className="stat-tile">
            <div className="label">Patients today</div>
            <div className="value">{patients.length}</div>
          </div>
          <div className="stat-tile">
            <div className="label">Diagnosed</div>
            <div className="value">{patients.filter((p) => p.status === "diagnosed").length}</div>
          </div>
          <div className="stat-tile">
            <div className="label">Waiting</div>
            <div className="value">{patients.filter((p) => p.status === "scheduled").length}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Today's patients</h3>
            <form onSubmit={openHistoryByCode} style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Lookup by Patient ID"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                style={{ width: 200 }}
              />
              <button className="btn btn-outline btn-sm" type="submit">
                Open history
              </button>
            </form>
          </div>
          {lookupError && <div className="alert alert-error">{lookupError}</div>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>ID</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.appointment_time}</td>
                    <td>{p.patient_name}</td>
                    <td className="mono">{p.patient_code}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {p.status === "scheduled" && (
                          <button className="btn btn-secondary btn-sm" onClick={() => markDiagnosed(p)}>
                            Mark diagnosed
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            setRxTarget({
                              patient: { id: p.patient_id, name: p.patient_name, patient_code: p.patient_code },
                              appointmentId: p.id,
                            })
                          }
                        >
                          Prescribe
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setHistoryTarget({ id: p.patient_id, name: p.patient_name, patient_code: p.patient_code })
                          }
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!patients.length && (
            <div className="empty-state">
              <h4>No patients scheduled for today</h4>
              <p>Your queue will appear here once appointments are booked for {todayStr()}.</p>
            </div>
          )}
        </div>
      </div>

      {rxTarget && (
        <PrescriptionModal
          patient={rxTarget.patient}
          appointmentId={rxTarget.appointmentId}
          onClose={() => setRxTarget(null)}
          onSaved={load}
        />
      )}
      {historyTarget && <HistoryModal patient={historyTarget} onClose={() => setHistoryTarget(null)} />}
    </div>
  );
}
