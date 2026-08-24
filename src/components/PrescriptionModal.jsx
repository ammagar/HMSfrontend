import { useState } from "react";
import Modal from "./Modal";
import { api, openPdf } from "../api";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "", notes: "" };

export default function PrescriptionModal({ patient, appointmentId, onClose, onSaved }) {
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([{ ...emptyMed }]);
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateMed = (idx, key, value) =>
    setMedicines((meds) => meds.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));

  const addMed = () => setMedicines((meds) => [...meds, { ...emptyMed }]);
  const removeMed = (idx) => setMedicines((meds) => meds.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanMeds = medicines.filter((m) => m.name.trim());
    if (!cleanMeds.length) {
      setError("Add at least one medicine.");
      return;
    }
    setSaving(true);
    try {
      const rx = await api.post("/doctor/prescriptions", {
        patientId: patient.id,
        appointmentId,
        diagnosis,
        medicines: cleanMeds,
        advice,
        followUpDate: followUpDate || null,
      });
      await openPdf(`/doctor/prescriptions/${rx.id}/pdf`);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Prescription — ${patient.name}`} onClose={onClose} width={640}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="diagnosis">Diagnosis</label>
          <textarea id="diagnosis" rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>

        <label>Medicines</label>
        {medicines.map((m, idx) => (
          <div key={idx} className="card" style={{ padding: 14, marginBottom: 10 }}>
            <div className="grid-2">
              <div className="field">
                <label>Name</label>
                <input value={m.name} onChange={(e) => updateMed(idx, "name", e.target.value)} placeholder="e.g. Tretinoin 0.025%" />
              </div>
              <div className="field">
                <label>Dosage</label>
                <input value={m.dosage} onChange={(e) => updateMed(idx, "dosage", e.target.value)} placeholder="e.g. Apply thin layer" />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Frequency</label>
                <input value={m.frequency} onChange={(e) => updateMed(idx, "frequency", e.target.value)} placeholder="e.g. Once nightly" />
              </div>
              <div className="field">
                <label>Duration</label>
                <input value={m.duration} onChange={(e) => updateMed(idx, "duration", e.target.value)} placeholder="e.g. 4 weeks" />
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <input value={m.notes} onChange={(e) => updateMed(idx, "notes", e.target.value)} placeholder="Optional" />
            </div>
            {medicines.length > 1 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMed(idx)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addMed} style={{ marginBottom: 16 }}>
          + Add medicine
        </button>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="advice">Advice</label>
            <textarea id="advice" rows={2} value={advice} onChange={(e) => setAdvice(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="followup">Follow-up date</label>
            <input id="followup" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save & print prescription"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
