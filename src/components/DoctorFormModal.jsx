import { useState } from "react";
import Modal from "./Modal";

export default function DoctorFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", phone: "", password: "", specialization: "", qualification: "", consultation_fee: "" }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? "Edit doctor" : "Add doctor"} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Full name</label>
          <input required value={form.name} onChange={update("name")} placeholder="Dr. Ananya Rao" />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Email</label>
            <input type="email" required disabled={!!initial} value={form.email} onChange={update("email")} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone || ""} onChange={update("phone")} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Specialization</label>
            <input value={form.specialization || ""} onChange={update("specialization")} placeholder="Dermatology" />
          </div>
          <div className="field">
            <label>Qualification</label>
            <input value={form.qualification || ""} onChange={update("qualification")} placeholder="MD, DVL" />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Consultation fee (₹)</label>
            <input type="number" value={form.consultation_fee || ""} onChange={update("consultation_fee")} />
          </div>
          <div className="field">
            <label>{initial ? "New password (optional)" : "Password"}</label>
            <input type="password" required={!initial} value={form.password || ""} onChange={update("password")} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save doctor"}
        </button>
      </form>
    </Modal>
  );
}
