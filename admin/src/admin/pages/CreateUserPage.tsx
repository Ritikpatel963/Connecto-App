import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { packagesApi } from "../api/packages";
import { settingsApi } from "../api/settings";
import { usersApi } from "../api/users";
import PageHeader from "../components/PageHeader";
import { User } from "../types";

const normalizePhone = (v: string) => { const d = v.replace(/\D/g, ""); return d.length === 10 ? `+91${d}` : `+${d}`; };
const isValidPhone = (v: string) => /^\+[1-9]\d{7,14}$/.test(normalizePhone(v));

const CreateUserPage = () => {
  const navigate = useNavigate();

  const { data: packagesData } = useQuery({ queryKey: ["packages"], queryFn: () => packagesApi.list({ page: 1, pageSize: 100 }) });
  const { data: defaultPackageId } = useQuery({ queryKey: ["default_girl_package_id"], queryFn: () => settingsApi.get("default_girl_package_id") });
  const packages = packagesData?.data || [];

  const [form, setForm] = useState({
    name: "", phone_number: "", age: 18,
    gender: "female" as User["gender"],
    country: "India", state: "", city: "",
    call_rate: 0,
    call_package_id: "" as string | number,
    bio: "",
    is_active: true, is_id_verified: false, is_voice_verified: false,
  });

  // Auto-assign default package when gender switches to girl
  const setGender = (g: User["gender"]) => setForm(f => ({
    ...f, gender: g,
    call_package_id: g !== "male" ? (f.call_package_id || defaultPackageId || "") : "",
  }));

  const save = useMutation({
    mutationFn: () => {
      const payload: any = { ...form, phone_number: normalizePhone(form.phone_number), is_online: false, average_rating: 0, created_at: new Date().toISOString() };
      if (!payload.call_package_id || payload.gender === "male") payload.call_package_id = null;
      if (!payload.bio) delete payload.bio;
      return usersApi.create(payload);
    },
    onSuccess: (user: any) => { toast.success("User created!"); navigate(`/users/${user.id}`); },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSave = form.name.trim() && isValidPhone(form.phone_number) && form.age >= 16;

  return (
    <div className="create-user-page">
      <PageHeader
        title="Create User"
        description="Add a new app user profile — male caller or female/hostess profile."
        icon="solar:user-plus-outline"
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/users")}>Cancel</button>
            <button className="btn btn-primary-600" disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        }
      />

      <div className="row gy-4">
        {/* Basic Info */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header"><h6 className="mb-0">Basic Information</h6></div>
            <div className="card-body">
              <div className="row gy-3">
                <div className="col-md-6">
                  <label className="form-label">Full name <span className="text-danger">*</span></label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone number <span className="text-danger">*</span></label>
                  <input type="tel" className="form-control" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value.replace(/[^\d+]/g, "") })} placeholder="+919876543210 or 9876543210" maxLength={16} />
                  {form.phone_number && !isValidPhone(form.phone_number) && <div className="text-danger text-sm mt-1">Enter a valid phone number</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Age</label>
                  <input type="number" min={16} max={60} className="form-control" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Gender / Role <span className="text-danger">*</span></label>
                  <select className="form-select" value={form.gender} onChange={e => setGender(e.target.value as User["gender"])}>
                    <option value="female">Female (Girl profile — available for calls)</option>
                    <option value="male">Male (Caller)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Country</label>
                  <input className="form-control" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">State</label>
                  <input className="form-control" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio <span className="text-secondary-light fw-normal text-sm">(optional)</span></label>
                  <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short bio shown on profile..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role / Settings */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header"><h6 className="mb-0">Call Settings</h6></div>
            <div className="card-body">
              {form.gender !== "male" ? (
                <>
                  <label className="form-label">Call Package</label>
                  <select className="form-select mb-3" value={form.call_package_id} onChange={e => setForm({ ...form, call_package_id: e.target.value })}>
                    <option value="">No Package (Free)</option>
                    {packages.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.coins} coins/{p.billing_unit || "min"}</option>)}
                  </select>
                  {String(form.call_package_id) === String(defaultPackageId) && (
                    <span className="badge bg-primary-100 text-primary-600 rounded-pill text-xs">Default package</span>
                  )}
                  <div className="mt-3">
                    <label className="form-label">Custom call rate <span className="text-secondary-light fw-normal text-sm">(coins/min, overrides package)</span></label>
                    <input type="number" min={0} className="form-control" value={form.call_rate} onChange={e => setForm({ ...form, call_rate: Number(e.target.value) })} />
                  </div>
                </>
              ) : (
                <p className="text-secondary-light text-sm mb-0">Male callers use their own coin balance — no package needed.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h6 className="mb-0">Account Controls</h6></div>
            <div className="card-body d-flex flex-column gap-3">
              <label className="d-flex align-items-center gap-2 mb-0">
                <input type="checkbox" className="form-check-input mt-0" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <span>Active account</span>
              </label>
              <label className="d-flex align-items-center gap-2 mb-0">
                <input type="checkbox" className="form-check-input mt-0" checked={form.is_id_verified} onChange={e => setForm({ ...form, is_id_verified: e.target.checked })} />
                <span>ID verified</span>
              </label>
              {form.gender !== "male" && (
                <label className="d-flex align-items-center gap-2 mb-0">
                  <input type="checkbox" className="form-check-input mt-0" checked={form.is_voice_verified} onChange={e => setForm({ ...form, is_voice_verified: e.target.checked })} />
                  <span>Voice verified</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
