import React, { FormEvent, useState } from "react";
import { Icon } from "@iconify/react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const LoginPage = () => {
  const { session, admin, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session && admin) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-neutral-50 px-3 py-5">
      <div className="card border-0 shadow-sm w-100" style={{ maxWidth: 440 }}>
        <div className="card-body p-32 p-md-40">
          <div className="text-center mb-32">
            <img src="/assets/images/logo.png" alt="Connecting People" style={{ maxWidth: 190 }} className="mb-24" />
            <h4 className="mb-8">Admin sign in</h4>
            <p className="text-secondary-light mb-0">Use your authorized administrator account.</p>
          </div>

          {error && <div className="alert alert-danger d-flex gap-2 align-items-start"><Icon icon="solar:danger-circle-outline" className="text-xl flex-shrink-0" /><span>{error}</span></div>}

          <form onSubmit={submit}>
            <label className="form-label fw-semibold" htmlFor="admin-email">Email address</label>
            <div className="position-relative mb-20">
              <Icon icon="solar:letter-outline" className="position-absolute top-50 start-0 translate-middle-y ms-16 text-secondary-light" />
              <input id="admin-email" type="email" className="form-control ps-40" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required autoFocus />
            </div>

            <label className="form-label fw-semibold" htmlFor="admin-password">Password</label>
            <div className="position-relative mb-24">
              <Icon icon="solar:lock-password-outline" className="position-absolute top-50 start-0 translate-middle-y ms-16 text-secondary-light" />
              <input id="admin-password" type={showPassword ? "text" : "password"} className="form-control ps-40 pe-40" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required minLength={6} />
              <button type="button" className="btn border-0 position-absolute top-50 end-0 translate-middle-y me-4 p-2 text-secondary-light" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                <Icon icon={showPassword ? "solar:eye-closed-outline" : "solar:eye-outline"} />
              </button>
            </div>

            <button type="submit" className="btn btn-primary-600 w-100 py-12" disabled={submitting || !email || !password}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
