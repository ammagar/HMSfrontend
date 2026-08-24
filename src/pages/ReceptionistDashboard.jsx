import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PatientFormModal from "../components/PatientFormModal";
import BillModal from "../components/BillModal";
import { api, openPdf } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState("queue");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <h2>Front desk</h2>
        <div className="tab-row">
          <button className={`tab-btn ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
            Appointment queue
          </button>
          <button className={`tab-btn ${tab === "patients" ? "active" : ""}`} onClick={() => setTab("patients")}>
            Patients
          </button>
          <button className={`tab-btn ${tab === "collections" ? "active" : ""}`} onClick={() => setTab("collections")}>
            Collections report
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {tab === "queue" && <QueueTab setError={setError} setSuccess={setSuccess} />}
        {tab === "patients" && <PatientsTab setError={setError} setSuccess={setSuccess} />}
        {tab === "collections" && <CollectionsTab setError={setError} />}
      </div>
    </div>
  );
}

/* ============================== Queue tab ============================== */

function QueueTab({ setError, setSuccess }) {
  const [date, setDate] = useState(todayStr());
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [billTarget, setBillTarget] = useState(null);
  const [bookOpen, setBookOpen] = useState(false);

  const load = () => {
    const qs = new URLSearchParams({ date, ...(doctorId ? { doctorId } : {}) });
    api
      .get(`/receptionist/appointments?${qs}`)
      .then(setAppointments)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    api.get("/appointments/doctors").then(setDoctors).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(load, [date, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (idx, dir) => {
    const arr = [...appointments];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setAppointments(arr);
    api
      .put("/receptionist/appointments/reorder", { orderedIds: arr.map((a) => a.id) })
      .catch((e) => setError(e.message));
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.del(`/receptionist/appointments/${id}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const printCasePaper = (patientId) => openPdf(`/receptionist/case-paper/${patientId}/pdf`);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Appointments</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">All doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setBookOpen(true)}>
            + Book walk-in
          </button>
        </div>
      </div>

      <p className="help-text" style={{ marginBottom: 10 }}>
        Use ↑ / ↓ to shuffle the queue order for the day.
      </p>

      {appointments.map((a, idx) => (
        <div className="queue-item" key={a.id}>
          <span className="order-num">{idx + 1}</span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <strong>{a.patient_name}</strong>
            <div style={{ fontSize: 12, color: "var(--muted)" }} className="mono">
              {a.patient_code} · {a.phone}
            </div>
          </div>
          <div style={{ minWidth: 140 }}>
            <div className="mono">{a.appointment_time}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Dr. {a.doctor_name}</div>
          </div>
          <span className={`badge badge-${a.status}`}>{a.status}</span>
          <div className="queue-actions">
            <button className="icon-btn" onClick={() => move(idx, -1)} title="Move up">
              ↑
            </button>
            <button className="icon-btn" onClick={() => move(idx, 1)} title="Move down">
              ↓
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setBillTarget(a)}>
              Bill
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => printCasePaper(a.patient_id)}>
              Case paper
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>
              Cancel
            </button>
          </div>
        </div>
      ))}
      {!appointments.length && (
        <div className="empty-state">
          <h4>No appointments for this day</h4>
          <p>Book a walk-in patient to get started.</p>
        </div>
      )}

      {billTarget && (
        <BillModal
          patient={{ id: billTarget.patient_id, name: billTarget.patient_name }}
          appointmentId={billTarget.id}
          doctorId={billTarget.doctor_id}
          onClose={() => setBillTarget(null)}
        />
      )}

      {bookOpen && <WalkInBookingModal doctors={doctors} onClose={() => setBookOpen(false)} onBooked={() => { load(); setSuccess?.("Walk-in booked."); }} />}
    </div>
  );
}

function WalkInBookingModal({ doctors, onClose, onBooked }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [patient, setPatient] = useState(null);
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || "");
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) return setResults([]);
    const rows = await api.get(`/receptionist/patients?q=${encodeURIComponent(q)}`);
    setResults(rows);
  };

  useEffect(() => {
    if (!doctorId || !date) return;
    api
      .get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`)
      .then((d) => setSlots(d.slots))
      .catch(() => setSlots([]));
  }, [doctorId, date]);

  const book = async () => {
    setError("");
    if (!patient || !doctorId || !date || !time) {
      setError("Select a patient, doctor, date and time.");
      return;
    }
    try {
      await api.post("/receptionist/appointments", { patientId: patient.id, doctorId, date, time });
      onBooked();
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="card-header">
          <h3>Book walk-in appointment</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        {!creatingNew ? (
          <>
            <div className="field">
              <label>Search patient by name / phone / ID</label>
              <input value={query} onChange={(e) => search(e.target.value)} placeholder="Start typing…" />
            </div>
            {results.map((r) => (
              <div
                key={r.id}
                className={`doctor-card ${patient?.id === r.id ? "selected" : ""}`}
                style={{ marginBottom: 8 }}
                onClick={() => setPatient(r)}
              >
                <strong>{r.name}</strong>
                <div className="spec mono">
                  {r.patient_code} · {r.phone}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreatingNew(true)}>
              Patient not found? Add new patient
            </button>
          </>
        ) : (
          <PatientFormModal
            onClose={() => setCreatingNew(false)}
            onSubmit={async (form) => {
              const created = await api.post("/receptionist/patients", form);
              setPatient(created);
              setCreatingNew(false);
            }}
          />
        )}

        {patient && (
          <div className="card" style={{ marginTop: 14, padding: 14, background: "var(--mint-50)" }}>
            <strong>Booking for: {patient.name}</strong>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Doctor</label>
                <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <label>Time</label>
            <div className="slot-grid">
              {slots.map((s) => (
                <button key={s} type="button" className={`slot-btn ${time === s ? "selected" : ""}`} onClick={() => setTime(s)}>
                  {s}
                </button>
              ))}
              {!slots.length && <p style={{ color: "var(--muted)" }}>No slots available.</p>}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={book}>
              Confirm booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== Patients tab ============================== */

function PatientsTab({ setError, setSuccess }) {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = (q) => {
    const path = q ? `/receptionist/patients?q=${encodeURIComponent(q)}` : "/receptionist/patients";
    api.get(path).then(setPatients).catch((e) => setError(e.message));
  };

  useEffect(() => load(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card">
      <div className="card-header">
        <h3>Patients</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Search…" value={query} onChange={(e) => { setQuery(e.target.value); load(e.target.value); }} />
          <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(true)}>
            + Add patient
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Registered via</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.patient_code}</td>
                <td>{p.name}</td>
                <td>{p.phone}</td>
                <td>{p.gender || "-"}</td>
                <td style={{ textTransform: "capitalize" }}>{p.created_by}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openPdf(`/receptionist/case-paper/${p.id}/pdf`)}>
                      Case paper
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <PatientFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={async (form) => {
            await api.post("/receptionist/patients", form);
            setSuccess("Patient added.");
            load();
          }}
        />
      )}
      {editing && (
        <PatientFormModal
          initial={editing}
          title="Edit patient"
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            await api.put(`/receptionist/patients/${editing.id}`, form);
            setSuccess("Patient updated.");
            load();
          }}
        />
      )}
    </div>
  );
}

/* ============================== Collections tab ============================== */

function CollectionsTab({ setError }) {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState(todayStr());
  const [doctorId, setDoctorId] = useState("all");
  const [doctors, setDoctors] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get("/appointments/doctors").then(setDoctors).catch(() => {});
  }, []);

  const run = () => {
    const qs = new URLSearchParams({ type, date, doctorId });
    api
      .get(`/receptionist/collections?${qs}`)
      .then(setReport)
      .catch((e) => setError(e.message));
  };

  useEffect(run, [type, date, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const printReport = () => openPdf(`/receptionist/collections/pdf?${new URLSearchParams({ type, date, doctorId })}`);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Collections report</h3>
        <button className="btn btn-outline btn-sm" onClick={printReport}>
          Print report
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 10 }}>
        <div className="field">
          <label>Report type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="field">
          <label>{type === "monthly" ? "Any date in month" : "Date"}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Doctor</label>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          <option value="all">All doctors (cumulative)</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.name}
            </option>
          ))}
        </select>
      </div>

      {report && (
        <>
          <div className="stat-row">
            <div className="stat-tile">
              <div className="label">Period</div>
              <div className="value" style={{ fontSize: 16 }}>
                {report.label}
              </div>
            </div>
            <div className="stat-tile">
              <div className="label">Bills</div>
              <div className="value">{report.rows.length}</div>
            </div>
            <div className="stat-tile">
              <div className="label">Total collection</div>
              <div className="value">₹{report.total.toFixed(2)}</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="mono">{r.id}</td>
                    <td>{r.patient_name}</td>
                    <td>{r.doctor_name ? "Dr. " + r.doctor_name : "-"}</td>
                    <td>₹{Number(r.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!report.rows.length && (
            <div className="empty-state">
              <h4>No bills in this period</h4>
            </div>
          )}
        </>
      )}
    </div>
  );
}
