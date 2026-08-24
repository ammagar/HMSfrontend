import { useState } from "react";
import Modal from "./Modal";

export default function ReceptionistFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || { name: "", email: "", phone: "", password: "" });
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
    <Modal title={initial ? "Edit receptionist" : "Add receptionist"} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Full name</label>
          <input required value={form.name} onChange={update("name")} />
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
        <div className="field">
          <label>{initial ? "New password (optional)" : "Password"}</label>
          <input type="password" required={!initial} value={form.password || ""} onChange={update("password")} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save receptionist"}
        </button>
      </form>
    </Modal>
  );
}
