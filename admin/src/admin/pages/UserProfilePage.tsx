import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { usersApi } from "../api/users";
import { packagesApi } from "../api/packages";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, MoneyCell, PersonCell, RatingCell } from "../components/Cells";
import { ErrorState, LoadingState } from "../components/PageStates";
import StatusBadge, { humanize } from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord, CallRecord, ListParams, ListResponse, SelectFilter, User, FavoriteRecord } from "../types";
import { favoritesApi } from "../api/favorites";

const tabs = ["Profile", "Verifications", "Wallet", "Calls", "Ratings", "Referrals", "Favorites"] as const;
type Tab = typeof tabs[number];

const tabIcons: Record<Tab, string> = {
  Profile: "solar:user-id-outline",
  Verifications: "solar:shield-check-outline",
  Wallet: "solar:wallet-2-outline",
  Calls: "solar:phone-calling-outline",
  Ratings: "solar:star-outline",
  Referrals: "solar:share-circle-outline",
  Favorites: "solar:heart-angle-outline",
};

const callFilters: SelectFilter[] = [{
  key: "status",
  label: "Status",
  options: ["initiated", "ongoing", "completed", "missed", "rejected", "failed"].map((value) => ({ label: humanize(value), value })),
}];

const formatDuration = (seconds: number) => `${String(Math.floor((seconds || 0) / 60)).padStart(2, "0")}:${String((seconds || 0) % 60).padStart(2, "0")}`;

const localList = <T extends BaseRecord>(source: T[]) => async (params: ListParams): Promise<ListResponse<T>> => {
  const search = params.search?.trim().toLowerCase();
  let rows = source.filter((row) => !search || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search)));

  Object.entries(params.filters || {}).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) rows = rows.filter((row) => String(row[key]) === String(value));
  });

  if (params.sortBy) {
    const direction = params.sortDirection === "desc" ? -1 : 1;
    rows = [...rows].sort((a, b) => String(a[params.sortBy!] ?? "").localeCompare(String(b[params.sortBy!] ?? ""), undefined, { numeric: true }) * direction);
  }

  const total = rows.length;
  const start = (params.page - 1) * params.pageSize;
  return { data: rows.slice(start, start + params.pageSize), total, page: params.page, pageSize: params.pageSize };
};

interface ProfileForm {
  name: string;
  phone_number: string;
  age: number;
  gender: User["gender"];
  country: string;
  state: string;
  city: string;
  call_rate: number;
  call_package_id: string | number;
}

const formFromUser = (user: User): ProfileForm => ({
  name: user.name,
  phone_number: user.phone_number || "",
  age: user.age,
  gender: user.gender,
  country: user.country,
  state: user.state,
  city: user.city,
  call_rate: user.call_rate,
  call_package_id: user.call_package_id || "",
});

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

const isValidPhoneNumber = (value: string) => /^\+[1-9]\d{7,14}$/.test(normalizePhoneNumber(value));

const initials = (name: string) => name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

const EmptyPanel = ({ label }: { label: string }) => <div className="profile-empty-state">
  <span><Icon icon="solar:inbox-line-outline" /></span>
  <p className="mb-0">No {label.toLowerCase()} found</p>
</div>;

const MiniTable = ({ rows, emptyLabel = "records", hasImage }: { rows: Record<string, unknown>[]; emptyLabel?: string; hasImage?: boolean }) => {
  if (!rows.length) return <EmptyPanel label={emptyLabel} />;
  const keys = Object.keys(rows[0]).filter((key) => !["id", "user_id", "id_image_url", "voice_audio_url"].includes(key)).slice(0, 6);
  return <div className="table-responsive"><table className="table bordered-table align-middle mb-0"><thead><tr>{keys.map((key) => <th key={key}>{humanize(key)}</th>)}{hasImage && <th>Image</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{keys.map((key) => <td key={key}>{String(row[key] ?? "-")}</td>)}{hasImage && <td>{row.id_image_url && !String(row.id_image_url).startsWith("/demo/") ? <a href={String(row.id_image_url)} target="_blank" rel="noreferrer" className="text-primary-600 fw-medium">View Document</a> : "Demo Asset"}</td>}</tr>)}</tbody></table></div>;
};

const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) => <div className="profile-info-item">
  <span className="profile-info-icon"><Icon icon={icon} /></span>
  <div><span className="d-block text-sm text-secondary-light mb-2">{label}</span><strong className="text-primary-light">{value || "-"}</strong></div>
</div>;

const Metric = ({ icon, label, value, tone }: { icon: string; label: string; value: React.ReactNode; tone: string }) => <div className="col-sm-6 col-xl">
  <div className="card profile-metric-card h-100"><span className={`profile-metric-icon ${tone}`}><Icon icon={icon} /></span><div><span className="d-block text-sm text-secondary-light">{label}</span><strong className="profile-metric-value">{value}</strong></div></div>
</div>;

const callColumns = [
  { key: "caller", label: "Caller", render: (row: CallRecord) => <PersonCell name={row.caller} userId={row.caller_user_id} /> },
  { key: "receiver", label: "Receiver", render: (row: CallRecord) => <PersonCell name={row.receiver} userId={row.receiver_user_id} /> },
  { key: "duration_seconds", label: "Duration", render: (row: CallRecord) => <span className="font-monospace">{formatDuration(row.duration_seconds)}</span> },
  { key: "rate_per_min_charged", label: "Rate/min", render: (row: CallRecord) => <MoneyCell value={row.rate_per_min_charged} /> },
  { key: "total_cost", label: "Total cost", render: (row: CallRecord) => <MoneyCell value={row.total_cost} /> },
  { key: "status", label: "Status", render: (row: CallRecord) => <StatusBadge value={row.status} /> },
  { key: "created_at", label: "Date", render: (row: CallRecord) => <DateCell value={row.created_at} /> },
];
const walletColumns = [
  { key: "id", label: "Transaction" },
  { key: "transaction_type", label: "Type", render: (row: BaseRecord) => humanize(String(row.transaction_type || "-")) },
  { key: "amount", label: "Amount", render: (row: BaseRecord) => <MoneyCell value={row.amount} /> },
  { key: "payment_method", label: "Method", render: (row: BaseRecord) => humanize(String(row.payment_method || "-")) },
  { key: "verification_status", label: "Status", render: (row: BaseRecord) => <StatusBadge value={String(row.verification_status || "pending")} /> },
  { key: "created_at", label: "Created", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
];
const receivedColumns = [
  { key: "rater", label: "From", render: (row: BaseRecord) => <PersonCell name={row.rater} userId={row.rater_user_id as number} /> },
  { key: "rating", label: "Rating", render: (row: BaseRecord) => <RatingCell value={row.rating as number} /> },
  { key: "review", label: "Review", render: (row: BaseRecord) => <span>{String(row.review || "-")}</span> },
  { key: "created_at", label: "Date", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
];

const ratingsReceivedColumns = [
  { key: "rated", label: "To", render: (row: BaseRecord) => <PersonCell name={row.rated} userId={row.rated_user_id as number} /> },
  { key: "rating", label: "Rating", render: (row: BaseRecord) => <RatingCell value={row.rating} /> },
  { key: "review_text", label: "Review", sortable: false, className: "profile-review-cell" },
  { key: "created_at", label: "Date", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
];
const referralColumns = [
  { key: "id", label: "S.No", render: (row: any) => <span className="text-secondary fw-medium">#REF-{row.id}</span> },
  { key: "referrer", label: "Referrer", render: (row: any) => <PersonCell name={row.referrer} userId={row.referrer_user_id} /> },
  { key: "referred", label: "Referred user", render: (row: any) => <PersonCell name={row.referred} userId={row.referred_user_id} /> },
  { key: "status", label: "Status", render: (row: BaseRecord) => <StatusBadge value={String(row.status)} /> },
  { key: "qualified_at", label: "Qualified", render: (row: BaseRecord) => <DateCell value={row.qualified_at} /> },
  { key: "created_at", label: "Joined", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
];
const favoriteColumns = [
  { key: "id", label: "ID" },
  { key: "target_user", label: "Liked User", render: (row: FavoriteRecord) => <PersonCell name={row.target_user_name || `User #${row.target_user_id}`} userId={row.target_user_id} /> },
  { key: "created_at", label: "Date", render: (row: FavoriteRecord) => <DateCell value={row.created_at} /> },
];

const fansColumns = [
  { key: "user", label: "Fan", render: (row: FavoriteRecord) => <PersonCell name={row.user_name || `User #${row.user_id}`} userId={row.user_id} /> },
  { key: "created_at", label: "Date", render: (row: FavoriteRecord) => <DateCell value={row.created_at} /> },
];

const UserProfilePage = () => {
  const { id = "" } = useParams();
  const client = useQueryClient();
  const [tab, setTab] = useState<Tab>("Profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const query = useQuery({ queryKey: ["user-detail", id], queryFn: () => usersApi.detail(id) });
  const { data: packagesData } = useQuery({ queryKey: ["packages"], queryFn: () => packagesApi.list({ page: 1, pageSize: 100 }) });
  const packages = packagesData?.data || [];

  const save = useMutation({
    mutationFn: () => usersApi.update(id, { ...form!, phone_number: normalizePhoneNumber(form!.phone_number) }),
    onSuccess: () => {
      toast.success("Profile updated");
      setEditing(false);
      client.invalidateQueries({ queryKey: ["user-detail", id] });
      client.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <LoadingState label="Loading user profile..." />;
  if (query.isError || !query.data) return <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />;

  const detail = query.data;
  const user = detail.user;
  const openEditor = () => { setForm(formFromUser(user)); setEditing(true); };
  const fullLocation = [user.city, user.state, user.country].filter(Boolean).join(", ");

  const currentPkg = packages.find((p: any) => String(p.id) === String(user.call_package_id));
  const rateDisplay = currentPkg ? `${currentPkg.currency || 'INR'} ${currentPkg.price}/${currentPkg.billing_unit || 'minute'}` : `Not set`;

  const callRows = detail.calls as CallRecord[];
  
  const totalSpent = detail.transactions
    .filter((t: any) => t.transaction_type === 'recharge' && (t.verification_status === 'verified' || t.status === 'verified' || t.status === 'completed'))
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const profileContent = <div className="row g-3">
    <div className="col-xl-8">
      <section className="profile-section-card h-100">
        <div className="profile-section-heading"><span><Icon icon="solar:user-id-outline" /></span><div><h5 className="mb-2">Personal information</h5><p className="mb-0 text-sm text-secondary-light">Member identity and account details</p></div></div>
        <div className="profile-info-grid">
          <InfoItem icon="solar:phone-outline" label="Phone number" value={user.phone_number} />
          <InfoItem icon="solar:calendar-outline" label="Age" value={`${user.age} years`} />
          <InfoItem icon="solar:user-outline" label="Gender" value={humanize(user.gender)} />
          <InfoItem icon="solar:map-point-outline" label="Location" value={fullLocation} />
          {user.gender !== 'male' && <InfoItem icon="solar:phone-calling-outline" label="Call rate" value={rateDisplay} />}
          <InfoItem icon="solar:calendar-add-outline" label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
        </div>
      </section>
    </div>
    <div className="col-xl-4">
      <section className="profile-section-card h-100">
        <div className="profile-section-heading"><span><Icon icon="solar:shield-check-outline" /></span><div><h5 className="mb-2">Account status</h5><p className="mb-0 text-sm text-secondary-light">Access and verification state</p></div></div>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between gap-3"><span>Account</span><StatusBadge value={user.is_active ? "active" : "inactive"} /></div>
          <div className="d-flex align-items-center justify-content-between gap-3"><span>ID verification</span><StatusBadge value={user.is_id_verified ? "verified" : "pending"} /></div>
          {user.gender !== 'male' && <div className="d-flex align-items-center justify-content-between gap-3"><span>Voice verification</span><StatusBadge value={user.is_voice_verified ? "verified" : "pending"} /></div>}
          <div className="d-flex align-items-center justify-content-between gap-3"><span>Presence</span><StatusBadge value={user.is_online ? "online" : "offline"} /></div>
        </div>
      </section>
    </div>
    <div className="col-lg-6"><section className="profile-section-card"><div className="profile-section-heading"><span><Icon icon="solar:global-outline" /></span><div><h5 className="mb-2">Languages</h5><p className="mb-0 text-sm text-secondary-light">Languages used for matching</p></div></div><MiniTable rows={detail.languages} emptyLabel="languages" /></section></div>
    <div className="col-lg-6"><section className="profile-section-card"><div className="profile-section-heading"><span><Icon icon="solar:heart-outline" /></span><div><h5 className="mb-2">Interests</h5><p className="mb-0 text-sm text-secondary-light">Topics shown on the profile</p></div></div><MiniTable rows={detail.interests} emptyLabel="interests" /></section></div>
  </div>;

  const tabContent: Record<Tab, React.ReactNode> = {
    Profile: profileContent,
    Verifications: <div className="row g-3"><div className="col-12"><section className="profile-section-card"><h5 className="mb-16">ID verification submissions</h5><MiniTable rows={detail.idVerifications} emptyLabel="ID submissions" hasImage={true} /></section></div>{user.gender !== 'male' && <div className="col-12"><section className="profile-section-card"><h5 className="mb-16">Voice verification submissions</h5><MiniTable rows={detail.voiceVerifications} emptyLabel="voice submissions" /></section></div>}</div>,
    Wallet: <div><div className="profile-table-heading d-flex justify-content-between align-items-center"><div><h5>Wallet transactions</h5><p className="mb-0">Review this member's wallet activity and payment status.</p></div><div className="text-end"><span className="text-sm text-secondary-light d-block mb-1">Current Balance</span><h4 className="mb-0 text-primary-600">{detail.wallet?.balance || 0} Coins</h4></div></div><AdminDataTable<BaseRecord> queryKey={["user-wallet-transactions", id]} queryFn={localList(detail.transactions)} columns={walletColumns} initialSort={{ key: "created_at", direction: "desc" }} searchPlaceholder="Search wallet transactions..." /></div>,
    Calls: <div><div className="profile-table-heading"><h5>Call history</h5><p>Search, filter and review this member's calls.</p></div><AdminDataTable<CallRecord> queryKey={["user-calls", id]} queryFn={localList(callRows)} columns={callColumns} filters={callFilters} initialSort={{ key: "created_at", direction: "desc" }} defaultVisibleColumns={["caller", "receiver", "duration_seconds", "total_cost", "status", "created_at"]} searchPlaceholder="Search call history..." /></div>,
    Ratings: <div className="d-flex flex-column gap-4"><div><div className="profile-table-heading"><h5>Reviews received</h5><p>Feedback this member received from others.</p></div><AdminDataTable<BaseRecord> queryKey={["user-ratings-received", id]} queryFn={localList(detail.ratings.filter((r: BaseRecord) => String(r.rated_user_id) === String(id)))} columns={receivedColumns} initialSort={{ key: "created_at", direction: "desc" }} searchPlaceholder="Search received reviews..." /></div><div><div className="profile-table-heading"><h5>Reviews given</h5><p>Feedback this member gave to others.</p></div><AdminDataTable<BaseRecord> queryKey={["user-ratings-given", id]} queryFn={localList(detail.ratings.filter((r: BaseRecord) => String(r.rater_user_id) === String(id)))} columns={givenColumns} initialSort={{ key: "created_at", direction: "desc" }} searchPlaceholder="Search given reviews..." /></div></div>,
    Referrals: <div><div className="profile-table-heading"><h5>Referral history</h5><p>Track users referred by or connected to this member.</p></div><AdminDataTable<BaseRecord> queryKey={["user-referrals", id]} queryFn={localList(detail.referrals)} columns={referralColumns} initialSort={{ key: "created_at", direction: "desc" }} searchPlaceholder="Search referral history..." /></div>,
    Favorites: <div className="d-flex flex-column gap-4"><div><div className="profile-table-heading"><h5>Favorites</h5><p>Users that this member has liked.</p></div><AdminDataTable<FavoriteRecord> queryKey={["user-favorites", id]} queryFn={(params) => favoritesApi.listUserFavorites(id, params)} columns={favoriteColumns} initialSort={{ key: "created_at", direction: "desc" }} /></div><div><div className="profile-table-heading"><h5>Fans</h5><p>Users who have liked this member.</p></div><AdminDataTable<FavoriteRecord> queryKey={["user-fans", id]} queryFn={(params) => favoritesApi.listUserFans(id, params)} columns={fanColumns} initialSort={{ key: "created_at", direction: "desc" }} /></div></div>,
  };

  return <div className="user-profile-page">
    <Link to="/users" className="profile-back-link"><Icon icon="solar:alt-arrow-left-linear" /> All users</Link>

    <section className="card profile-hero-card">
      <div className="profile-avatar">
        {user.profile_image_url ? <img src={user.profile_image_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : initials(user.name)}
        <span className={user.is_online ? "online" : ""} />
      </div>
      <div className="profile-hero-content flex-grow-1 min-w-0"><div className="d-flex flex-wrap align-items-center gap-2 mb-6"><h2 className="mb-0">{user.name}</h2><StatusBadge value={user.is_active ? "active" : "inactive"} /></div><p className="mb-6 text-secondary-light"><Icon icon="solar:phone-outline" /> {user.phone_number}</p><p className="mb-0 text-secondary-light"><Icon icon="solar:map-point-outline" /> {fullLocation || "Location not added"} · User #{user.id}</p></div>
      <button className="btn btn-primary-600 profile-edit-button d-inline-flex align-items-center gap-2" onClick={openEditor}><Icon icon="solar:pen-outline" /> Edit profile</button>
    </section>

    <div className="row g-3 mb-24">
      <Metric icon="solar:wallet-money-outline" label="Total recharged" value={<MoneyCell value={totalSpent} />} tone="success" />
      <Metric icon="solar:wallet-2-outline" label="Coins balance" value={`${detail.wallet?.balance || 0} Coins`} tone="primary" />
      <Metric icon="solar:phone-calling-outline" label="Total calls" value={detail.calls.length} tone="info" />
      <Metric icon="solar:share-circle-outline" label="Referrals" value={user.total_referrals || 0} tone="primary" />
      <Metric icon="solar:gift-outline" label="Referral earnings" value={<MoneyCell value={user.referral_earnings || 0} />} tone="success" />
      <Metric icon="solar:star-bold" label="Average rating" value={Number(user.average_rating || 0).toFixed(1)} tone="warning" />
      {user.gender !== 'male' && <Metric icon="solar:dollar-minimalistic-outline" label="Call rate" value={rateDisplay} tone="success" />}
    </div>

    <section className="card overflow-hidden">
      <div className="profile-tabs-wrap"><div className="profile-tabs" role="tablist">{tabs.map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}><Icon icon={tabIcons[item]} /> {item}</button>)}</div></div>
      <div className="card-body profile-tab-body">{tabContent[tab]}</div>
    </section>

    <ThemeModal open={editing && Boolean(form)} title="Edit user profile" onClose={() => setEditing(false)} size="lg" footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn-primary-600" disabled={!form?.name.trim() || !isValidPhoneNumber(form?.phone_number || "") || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save changes"}</button></>}>
      {form && <div className="row gy-3">
        <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
        <div className="col-md-6"><label className="form-label">Phone number <span className="text-danger">*</span></label><input type="tel" className="form-control" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value.replace(/[^\d+]/g, "") })} placeholder="+919876543210" maxLength={16} required /></div>
        <div className="col-md-4"><label className="form-label">Age</label><input type="number" min={18} className="form-control" value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} /></div>
        <div className="col-md-4"><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as User["gender"] })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
        {form.gender !== 'male' && (
          <div className="col-md-4">
            <label className="form-label">Call Package</label>
            <select className="form-select" value={form.call_package_id} onChange={(event) => setForm({ ...form, call_package_id: event.target.value })}>
              <option value="">No Package (Free)</option>
              {packages.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.coins} coins)</option>)}
            </select>
          </div>
        )}
        <div className="col-md-4"><label className="form-label">Country</label><input className="form-control" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></div>
        <div className="col-md-4"><label className="form-label">State</label><input className="form-control" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></div>
        <div className="col-md-4"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
      </div>}
    </ThemeModal>
  </div>;
};

export default UserProfilePage;
