import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function PatientRegister() {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", password: "", dob: "", gender: "", address: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await api.post("/auth/send-otp", { email });
      setInfo(data.message);
      if (data.devOtp) setDevOtp(data.devOtp); // shown only in local/dev mock-email mode
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/auth/register-patient", { email, otp, ...form });
      login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand-row">
          <Logo className="leaf" style={{ color: "var(--teal-900)" }} />
          <strong style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>SkinHairDoc</strong>
        </div>
        <h1>Patient registration</h1>
        <p className="subtitle">
          {step === 1 ? "Verify your email to create your patient account." : "Enter the code we sent and a few details."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {info && step === 2 && <div className="alert alert-info">{info}{devOtp ? ` (dev OTP: ${devOtp})` : ""}</div>}

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={completeRegistration}>
            <div className="field">
              <label htmlFor="otp">6-digit code</label>
              <input id="otp" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            </div>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required value={form.name} onChange={update("name")} />
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" required value={form.phone} onChange={update("phone")} />
              </div>
              <div className="field">
                <label htmlFor="dob">Date of birth</label>
                <input id="dob" type="date" value={form.dob} onChange={update("dob")} />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="gender">Gender</label>
                <select id="gender" value={form.gender} onChange={update("gender")}>
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="password">Create password</label>
                <input id="password" type="password" required value={form.password} onChange={update("password")} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="address">Address (optional)</label>
              <textarea id="address" value={form.address} onChange={update("address")} rows={2} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating account…" : "Verify & create account"}
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 6 }} onClick={() => setStep(1)}>
              Use a different email
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
