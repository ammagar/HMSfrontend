import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import DoctorFormModal from "../components/DoctorFormModal";
import ReceptionistFormModal from "../components/ReceptionistFormModal";
import PatientFormModal from "../components/PatientFormModal";
import { IconPlus } from "../components/Icons";
import OverviewTab from "./OverviewTab";
import { api } from "../api";
import { useAuth } from "../AuthContext";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [counts, setCounts] = useState(null);
  const { user } = useAuth();

  // Automatically clear alerts after a short delay
  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, success]);

  const refreshCounts = async () => {
    try {
      const response = await api.get("/admin/stats");
      setCounts(response.counts);
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    }
  };

  // IMPORTANT:
  // Do not use useEffect(refreshCounts, [tab])
  // because refreshCounts returns a Promise.
  useEffect(() => {
    refreshCounts();
  }, [tab]);

  const TITLES = {
    overview: "Overview",
    doctors: "Doctors",
    receptionists: "Receptionists",
    patients: "Patients",
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page">
        {/* Admin Header */}
        <div className="admin-page-head">
          <div>
            <p className="admin-eyebrow">Admin console</p>
            <h2>{TITLES[tab]}</h2>
          </div>

          <div className="admin-welcome">
            <span className="admin-welcome-label">Signed in as</span>
            <strong>{user?.name || "Admin"}</strong>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        {/* Main Admin Layout */}
        <div className="admin-layout">
          <AdminSidebar
            tab={tab}
            setTab={setTab}
            counts={counts}
          />

          <div className="admin-content">
            {tab === "overview" && (
              <OverviewTab
                setError={setError}
                onNavigate={setTab}
              />
            )}

            {tab === "doctors" && (
              <DoctorsTab
                setError={setError}
                setSuccess={setSuccess}
              />
            )}

            {tab === "receptionists" && (
              <ReceptionistsTab
                setError={setError}
                setSuccess={setSuccess}
              />
            )}

            {tab === "patients" && (
              <PatientsTab
                setError={setError}
                setSuccess={setSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DOCTORS
========================================================= */

function DoctorsTab({ setError, setSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const data = await api.get("/admin/doctors");

      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  // FIX:
  // The effect itself no longer returns the Promise.
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this doctor? This cannot be undone.")) {
      return;
    }

    try {
      await api.del(`/admin/doctors/${id}`);

      setSuccess("Doctor removed.");
      await load();
    } catch (e) {
      setError(e.message || "Failed to remove doctor.");
    }
  };

  const toggleActive = async (doctor) => {
    try {
      await api.put(`/admin/doctors/${doctor.id}`, {
        is_active: doctor.is_active ? 0 : 1,
      });

      await load();

      setSuccess(
        doctor.is_active
          ? "Doctor deactivated."
          : "Doctor activated."
      );
    } catch (e) {
      setError(e.message || "Failed to update doctor status.");
    }
  };

  const handleAdd = async (form) => {
    try {
      await api.post("/admin/doctors", form);

      setFormOpen(false);
      setSuccess("Doctor added successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to add doctor.");
    }
  };

  const handleEdit = async (form) => {
    try {
      await api.put(`/admin/doctors/${editing.id}`, form);

      setEditing(null);
      setSuccess("Doctor updated successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to update doctor.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Doctors</h3>
          <p className="card-subtitle">
            Manage doctors, specializations and availability.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setFormOpen(true)}
        >
          <IconPlus size={15} />
          Add doctor
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Email</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="table-loading">
                    Loading doctors...
                  </div>
                </td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar-circle">
                        {initials(doctor.name)}
                      </div>

                      <div>
                        <strong>Dr. {doctor.name}</strong>
                      </div>
                    </div>
                  </td>

                  <td>
                    {doctor.specialization || "-"}
                  </td>

                  <td>
                    {doctor.email || "-"}
                  </td>

                  <td>
                    {doctor.consultation_fee
                      ? `₹${doctor.consultation_fee}`
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        doctor.is_active
                          ? "badge-diagnosed"
                          : "badge-cancelled"
                      }`}
                    >
                      {doctor.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditing(doctor)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(doctor)}
                      >
                        {doctor.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(doctor.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !doctors.length && (
        <div className="empty-state">
          <div className="empty-state-icon">🩺</div>
          <h4>No doctors yet</h4>
          <p>
            Add your first doctor to start scheduling appointments.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
          >
            <IconPlus size={15} />
            Add doctor
          </button>
        </div>
      )}

      {formOpen && (
        <DoctorFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editing && (
        <DoctorFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

/* =========================================================
   RECEPTIONISTS
========================================================= */

function ReceptionistsTab({ setError, setSuccess }) {
  const [rows, setRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const data = await api.get("/admin/receptionists");

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load receptionists.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this receptionist?")) {
      return;
    }

    try {
      await api.del(`/admin/receptionists/${id}`);

      setSuccess("Receptionist removed.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to remove receptionist.");
    }
  };

  const handleAdd = async (form) => {
    try {
      await api.post("/admin/receptionists", form);

      setFormOpen(false);
      setSuccess("Receptionist added successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to add receptionist.");
    }
  };

  const handleEdit = async (form) => {
    try {
      await api.put(`/admin/receptionists/${editing.id}`, form);

      setEditing(null);
      setSuccess("Receptionist updated successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to update receptionist.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Receptionists</h3>
          <p className="card-subtitle">
            Manage reception staff and account access.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setFormOpen(true)}
        >
          <IconPlus size={15} />
          Add receptionist
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="table-loading">
                    Loading receptionists...
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((receptionist) => (
                <tr key={receptionist.id}>
                  <td>
                    <div className="name-cell">
                      <div
                        className="avatar-circle"
                        style={{
                          background: "var(--teal-700)",
                        }}
                      >
                        {initials(receptionist.name)}
                      </div>

                      <strong>{receptionist.name}</strong>
                    </div>
                  </td>

                  <td>
                    {receptionist.email || "-"}
                  </td>

                  <td>
                    {receptionist.phone || "-"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        receptionist.is_active
                          ? "badge-diagnosed"
                          : "badge-cancelled"
                      }`}
                    >
                      {receptionist.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditing(receptionist)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(receptionist.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !rows.length && (
        <div className="empty-state">
          <div className="empty-state-icon">👩‍💼</div>
          <h4>No receptionists yet</h4>
          <p>Add reception staff to manage your clinic.</p>

          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
          >
            <IconPlus size={15} />
            Add receptionist
          </button>
        </div>
      )}

      {formOpen && (
        <ReceptionistFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editing && (
        <ReceptionistFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

/* =========================================================
   PATIENTS
========================================================= */

function PatientsTab({ setError, setSuccess }) {
  const [rows, setRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const data = await api.get("/admin/patients");

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (
      !window.confirm(
        "Delete this patient record? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.del(`/admin/patients/${id}`);

      setSuccess("Patient removed.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to remove patient.");
    }
  };

  const handleAdd = async (form) => {
    try {
      await api.post("/admin/patients", form);

      setFormOpen(false);
      setSuccess("Patient added successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to add patient.");
    }
  };

  const handleEdit = async (form) => {
    try {
      await api.put(`/admin/patients/${editing.id}`, form);

      setEditing(null);
      setSuccess("Patient updated successfully.");

      await load();
    } catch (e) {
      setError(e.message || "Failed to update patient.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Patients</h3>
          <p className="card-subtitle">
            Manage registered patient records.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setFormOpen(true)}
        >
          <IconPlus size={15} />
          Add patient
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Registered via</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="table-loading">
                    Loading patients...
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((patient) => (
                <tr key={patient.id}>
                  <td className="mono">
                    {patient.patient_code}
                  </td>

                  <td>
                    <div className="name-cell">
                      <div
                        className="avatar-circle"
                        style={{
                          background: "var(--coral-500)",
                        }}
                      >
                        {initials(patient.name)}
                      </div>

                      <strong>{patient.name}</strong>
                    </div>
                  </td>

                  <td>
                    {patient.phone || "-"}
                  </td>

                  <td
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {patient.created_by || "-"}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditing(patient)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(patient.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !rows.length && (
        <div className="empty-state">
          <div className="empty-state-icon">🧑‍⚕️</div>
          <h4>No patients yet</h4>
          <p>
            Add your first patient to start managing records.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
          >
            <IconPlus size={15} />
            Add patient
          </button>
        </div>
      )}

      {formOpen && (
        <PatientFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editing && (
        <PatientFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}
