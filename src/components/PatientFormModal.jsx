import { useState } from "react";
import Modal from "./Modal";

export default function PatientFormModal({ initial, onClose, onSubmit, title }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", phone: "", dob: "", gender: "", address: "", password: "" }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const hasLogin = !!initial?.user;
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password && form.password.length > 0 && !form.email) {
      setError("An email is required to set a login password.");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
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
    <Modal title={title || (initial ? "Edit patient" : "Add patient")} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Full name</label>
          <input required value={form.name} onChange={update("name")} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Phone</label>
            <input required value={form.phone} onChange={update("phone")} />
          </div>
          <div className="field">
            <label>Email{form.password ? "" : " (optional)"}</label>
            <input type="email" value={form.email || ""} onChange={update("email")} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Date of birth</label>
            <input type="date" value={form.dob || ""} onChange={update("dob")} />
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={form.gender || ""} onChange={update("gender")}>
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Address</label>
          <textarea rows={2} value={form.address || ""} onChange={update("address")} />
        </div>

        <div className="field">
          <label>{hasLogin ? "Reset login password" : "Set login password"}</label>
          <input
            type="password"
            value={form.password || ""}
            onChange={update("password")}
            placeholder={hasLogin ? "Leave blank to keep current password" : "Leave blank if patient will self-register later"}
            autoComplete="new-password"
          />
          <p className="help-text">
            {hasLogin
              ? "This patient already has a login. Enter a new password only if you want to reset it."
              : "Optional — set this if the patient wants to log in themselves. An email is required to do so."}
          </p>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save patient"}
        </button>
      </form>
    </Modal>
  );
}
