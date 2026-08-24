import { useState } from "react";
import Modal from "./Modal";
import { api, openPdf } from "../api";

const emptyItem = { description: "", qty: 1, amount: "" };

export default function BillModal({ patient, appointmentId, doctorId, onClose }) {
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateItem = (idx, key, value) => setItems((its) => its.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  const addItem = () => setItems((its) => [...its, { ...emptyItem }]);
  const removeItem = (idx) => setItems((its) => its.filter((_, i) => i !== idx));

  const total = items.reduce((s, it) => s + Number(it.qty || 1) * Number(it.amount || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const clean = items.filter((it) => it.description.trim() && Number(it.amount) > 0);
    if (!clean.length) {
      setError("Add at least one billed item with an amount.");
      return;
    }
    setSaving(true);
    try {
      const bill = await api.post("/receptionist/bills", {
        patientId: patient.id,
        appointmentId,
        doctorId,
        items: clean,
        paymentMode,
      });
      await openPdf(`/receptionist/bills/${bill.id}/pdf`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Bill — ${patient.name}`} onClose={onClose} width={560}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-end" }}>
            <div className="field" style={{ flex: 3, marginBottom: 0 }}>
              <label>Description</label>
              <input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Consultation, procedure…" />
            </div>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Qty</label>
              <input type="number" min={1} value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1.4, marginBottom: 0 }}>
              <label>Amount (₹)</label>
              <input type="number" min={0} value={it.amount} onChange={(e) => updateItem(idx, "amount", e.target.value)} />
            </div>
            {items.length > 1 && (
              <button type="button" className="icon-btn" onClick={() => removeItem(idx)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom: 16 }}>
          + Add item
        </button>

        <div className="field">
          <label>Payment mode</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>

        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--teal-900)" }}>Total: ₹{total.toFixed(2)}</p>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save & print bill"}
        </button>
      </form>
    </Modal>
  );
}
