import { useEffect, useState } from "react";
import Modal from "./Modal";
import { api, openPdf } from "../api";

export default function HistoryModal({ patient, onClose }) {
  const [entries, setEntries] = useState([]);
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get(`/doctor/patients/${patient.id}/history`)
      .then(setEntries)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post(`/doctor/patients/${patient.id}/history`, { note });
      setNote("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.note);
  };

  const saveEdit = async (id) => {
    setError("");
    try {
      await api.put(`/doctor/history/${id}`, { note: editText });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title={`Case history — ${patient.name} (${patient.patient_code})`} onClose={onClose} width={640}>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={addNote} className="field" style={{ marginBottom: 18 }}>
        <label htmlFor="new-note">Add a history note</label>
        <textarea id="new-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Clinical observations, treatment notes…" />
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} disabled={saving}>
          {saving ? "Saving…" : "Add note"}
        </button>
      </form>

      <div className="card-header">
        <h4 style={{ margin: 0 }}>Past entries</h4>
        <button className="btn btn-outline btn-sm" onClick={() => openPdf(`/doctor/patients/${patient.id}/history/pdf`)}>
          Print history
        </button>
      </div>

      {entries.map((entry) => (
        <div key={entry.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
            {new Date(entry.created_at).toLocaleString("en-IN")} · Dr. {entry.doctor_name}
          </div>
          {editingId === entry.id ? (
            <>
              <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={() => saveEdit(entry.id)}>
                  Save
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: 0 }}>{entry.note}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(entry)}>
                Edit
              </button>
            </>
          )}
        </div>
      ))}
      {!entries.length && <p style={{ color: "var(--muted)" }}>No history recorded yet.</p>}
    </Modal>
  );
}
