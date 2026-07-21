import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import AdminDataTable from "../components/AdminDataTable";
import { toast } from "react-toastify";
import api from "../api/http";
import { ListParams } from "../types";
import { usersApi } from "../api/users";

const PushNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const { data: usersData, isFetching: usersLoading } = useQuery({
    queryKey: ["users-search", userSearch],
    queryFn: () => usersApi.list({ page: 1, pageSize: 20, search: userSearch }),
    enabled: showUserModal,
  });

  const fetchHistory = async (params: ListParams) => {
    const { data } = await api.get("/push/history");
    const list = Array.isArray(data) ? data : (data?.data || []);
    const start = (params.page - 1) * params.pageSize;
    return { 
      data: list.slice(start, start + params.pageSize), 
      total: list.length,
      page: params.page,
      pageSize: params.pageSize
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Title and message are required.");
    
    setLoading(true);
    try {
      const { data } = await api.post("/push/dispatch", { title, message, userId: userId || null, audience: userId ? 'specific' : audience });
      toast.success(`Successfully sent ${data.data?.sentCount ?? data.sentCount ?? 0} notifications!`);
      setTitle("");
      setMessage("");
      setUserId("");
      setAudience("all");
      queryClient.invalidateQueries({ queryKey: ["push-history"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "message", label: "Message", render: (row: any) => <div className="text-truncate" style={{maxWidth: '300px'}}>{row.message}</div> },
    { key: "target", label: "Target", render: (row: any) => row.target_user_id ? <span className="badge bg-info">User {row.target_user_id}</span> : <span className="badge bg-primary">{row.audience || 'Broadcast'}</span> },
    { key: "sent_count", label: "Sent Count", render: (row: any) => `${row.sent_count} devices` },
    { key: "created_at", label: "Date", render: (row: any) => new Date(row.created_at).toLocaleString() },
  ];

  return (
    <div className="push-notifications-page">
      <PageHeader title="Send Push Notification" description="Send a broadcast or targeted push notification to users" />
      <div className="card mt-24 mb-24">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Compose Push Notification</h6>
        </div>
        <div className="card-body p-24">
          <form onSubmit={handleSend}>
            <div className="row gy-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Notification Title</label>
                <input type="text" className="form-control radius-8" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Special Offer!" required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Target Audience</label>
                <select className="form-select radius-8" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={!!userId}>
                  <option value="all">All Users</option>
                  <option value="male">Males Only</option>
                  <option value="female">Females Only</option>
                  <option value="verified">Verified Users Only</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Or Select Specific User</label>
                <div className="input-group">
                  <input type="text" className="form-control" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Overrides audience if set..." />
                  <button type="button" className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setShowUserModal(true)}>
                    <Icon icon="solar:users-group-rounded-outline" /> Browse
                  </button>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Message Body</label>
                <textarea className="form-control radius-8" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Get 50% off on your next recharge..." required />
              </div>
              <div className="col-12 mt-16">
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : <Icon icon="solar:plain-bold" />}
                  {loading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <AdminDataTable 
        queryKey={["push-history"]} 
        queryFn={fetchHistory} 
        columns={columns} 
        searchPlaceholder="Search notifications..." 
      />

      {showUserModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select a User</h5>
                <button type="button" className="btn-close" onClick={() => setShowUserModal(false)}></button>
              </div>
              <div className="modal-body">
                <input 
                  type="text" 
                  className="form-control mb-3" 
                  placeholder="Search by name..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {usersLoading ? (
                  <div className="text-center py-4"><span className="spinner-border text-primary" /></div>
                ) : (
                  <ul className="list-group">
                    {usersData?.data?.length ? usersData.data.map((u: any) => (
                      <button 
                        key={u.id} 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => { setUserId(u.id); setShowUserModal(false); }}
                        type="button"
                      >
                        <div>
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-secondary-light">ID: {u.id}</small>
                        </div>
                        <Icon icon="solar:arrow-right-outline" />
                      </button>
                    )) : (
                      <div className="text-center py-4 text-secondary-light">No users found</div>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationsPage;
