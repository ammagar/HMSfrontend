import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const loadAppointments = () => api.get("/appointments/my").then(setAppointments).catch((e) => setError(e.message));

  useEffect(() => {
    api.get("/appointments/doctors").then(setDoctors).catch((e) => setError(e.message));
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .get(`/appointments/available-slots?doctorId=${selectedDoctor.id}&date=${date}`)
      .then((d) => setSlots(d.slots))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, date]);

  const book = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setError("");
    setSuccess("");
    setBooking(true);
    try {
      await api.post("/appointments", { doctorId: selectedDoctor.id, date, time: selectedSlot, reason });
      setSuccess("Appointment booked successfully.");
      setSelectedSlot(null);
      setReason("");
      loadAppointments();
      // refresh slots
      const d = await api.get(`/appointments/available-slots?doctorId=${selectedDoctor.id}&date=${date}`);
      setSlots(d.slots);
    } catch (e) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.del(`/appointments/${id}`);
      loadAppointments();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <h2>Hello, {user?.name?.split(" ")[0]}</h2>
        <p style={{ color: "var(--muted)" }}>Book a visit with your preferred doctor, or manage upcoming appointments.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <div className="card-header">
            <h3>Book an appointment</h3>
          </div>

          <label>1. Choose a doctor</label>
          <div className="doctor-grid" style={{ marginBottom: 18 }}>
            {doctors.map((d) => (
              <div
                key={d.id}
                className={`doctor-card ${selectedDoctor?.id === d.id ? "selected" : ""}`}
                onClick={() => setSelectedDoctor(d)}
              >
                <h4>Dr. {d.name}</h4>
                <div className="spec">{d.specialization || "General"}</div>
                {d.consultation_fee ? <div className="fee">₹{d.consultation_fee} consultation</div> : null}
              </div>
            ))}
            {!doctors.length && <p style={{ color: "var(--muted)" }}>No doctors available right now.</p>}
          </div>

          {selectedDoctor && (
            <>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="date">2. Choose a date</label>
                  <input id="date" type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="reason">Reason for visit (optional)</label>
                  <input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. acne follow-up" />
                </div>
              </div>

              <label>3. Choose an available time</label>
              {loadingSlots ? (
                <p style={{ color: "var(--muted)" }}>Loading available times…</p>
              ) : (
                <div className="slot-grid">
                  {slots.map((s) => (
                    <button
                      key={s}
                      className={`slot-btn ${selectedSlot === s ? "selected" : ""}`}
                      onClick={() => setSelectedSlot(s)}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                  {!slots.length && <p style={{ color: "var(--muted)" }}>No slots left for this date.</p>}
                </div>
              )}

              <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={!selectedSlot || booking} onClick={book}>
                {booking ? "Booking…" : `Book ${selectedSlot ? "at " + selectedSlot : ""}`}
              </button>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Your appointments</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointment_date}</td>
                    <td className="mono">{a.appointment_time}</td>
                    <td>Dr. {a.doctor_name}</td>
                    <td>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                    </td>
                    <td>
                      {a.status === "scheduled" && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!appointments.length && (
            <div className="empty-state">
              <h4>No appointments yet</h4>
              <p>Book your first visit above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
