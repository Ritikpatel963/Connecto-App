import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { usersApi } from "../api/users";
import { MoneyCell, PersonCell, DateCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import { ErrorState, LoadingState } from "../components/PageStates";
import StatusBadge, { humanize } from "../components/StatusBadge";

const tabs = ["Profile", "Verifications", "Wallet", "Calls", "Ratings", "Referrals"] as const;

const MiniTable = ({ rows, hasImage }: { rows: Record<string, unknown>[]; hasImage?: boolean }) => {
  if (!rows.length) return <p className="text-secondary-light mb-0">No records found.</p>;
  const keys = Object.keys(rows[0]).filter((key) => !["id_image_url", "voice_audio_url"].includes(key)).slice(0, 6);
  return <div className="table-responsive"><table className="table bordered-table mb-0"><thead><tr>{keys.map((key) => <th key={key}>{humanize(key)}</th>)}{hasImage && <th>Image</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{keys.map((key) => <td key={key}>{key.endsWith('_at') ? <DateCell value={row[key]} /> : String(row[key] ?? "-")}</td>)}{hasImage && <td>{row.id_image_url && !String(row.id_image_url).startsWith("/demo/") ? <a href={String(row.id_image_url)} target="_blank" rel="noreferrer" className="text-primary-600">View Document</a> : "Demo Asset"}</td>}</tr>)}</tbody></table></div>;
};

const UserDetailPage = () => {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<typeof tabs[number]>("Profile");
  const query = useQuery({ queryKey: ["user-detail", id], queryFn: () => usersApi.detail(id) });
  if (query.isLoading) return <LoadingState label="Loading user profile..." />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  const detail = query.data;
  const user = detail.user;
  const content: Record<typeof tabs[number], React.ReactNode> = {
    Profile: <div className="row gy-4"><div className="col-lg-4"><div className="bg-neutral-50 radius-12 p-20"><PersonCell name={user.name} subtitle={`User #${user.id}`} online={user.is_online} /><hr />{[["Age", user.age], ["Location", `${user.city}, ${user.state}, ${user.country}`], ...(user.gender === 'male' ? [] : [["Call rate", `\u20B9${user.call_rate}/min`]]), ["Rating", user.average_rating]].map(([label, value]) => <div className="d-flex justify-content-between py-8" key={String(label)}><span className="text-secondary-light">{label}</span><strong>{value as React.ReactNode}</strong></div>)}</div></div><div className="col-lg-8"><h6>Profile status</h6><div className="d-flex flex-wrap gap-2 mb-24"><StatusBadge value={user.is_active ? "active" : "inactive"} /><StatusBadge value={user.is_id_verified ? "ID verified" : "ID pending"} />{user.gender !== 'male' && <StatusBadge value={user.is_voice_verified ? "Voice verified" : "Voice pending"} />}</div><h6>Languages</h6><MiniTable rows={detail.languages} /><h6 className="mt-24">Interests</h6><MiniTable rows={detail.interests} /></div></div>,
    Verifications: <><h6 className="mb-16">ID submissions</h6><MiniTable rows={detail.idVerifications} hasImage={true} />{user.gender !== 'male' && <><h6 className="mt-24 mb-16">Voice submissions</h6><MiniTable rows={detail.voiceVerifications} /></>}</>,
    Wallet: <><div className="bg-primary-50 radius-12 p-20 mb-20"><p className="mb-4 text-secondary-light">Current balance</p><h3 className="mb-0"><MoneyCell value={detail.wallet?.balance} /></h3></div><MiniTable rows={detail.transactions} /></>,
    Calls: <MiniTable rows={detail.calls} />,
    Ratings: <MiniTable rows={detail.ratings} />,
    Referrals: <><MiniTable rows={detail.referrals} /><h6 className="mt-24">Redemptions</h6><MiniTable rows={detail.redemptions} /></>,
  };

  return <>
    <PageHeader title={user.name} description={`User #${user.id} - ${user.city}, ${user.state}`} icon="solar:user-id-outline" actions={<button className="btn btn-outline-primary-600"><Icon icon="solar:pen-outline" /> Edit profile</button>} />
    <div className="card"><div className="card-header bg-base border-bottom p-0"><ul className="nav nav-pills p-12 gap-2">{tabs.map((item) => <li className="nav-item" key={item}><button className={`nav-link ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item}</button></li>)}</ul></div><div className="card-body p-24">{content[tab]}</div></div>
  </>;
};
export default UserDetailPage;
