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
  const [userIds, setUserIds] = useState<string[]>([]);
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const confirmSend = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/push/dispatch", { title, message, userIds: userIds.length > 0 ? userIds : null, audience: userIds.length > 0 ? 'specific' : audience });
      toast.success(`Successfully sent ${data.data?.sentCount ?? data.sentCount ?? 0} notifications!`);
      setTitle("");
      setMessage("");
      setUserIds([]);
      setAudience("all");
      setShowConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: ["push-history"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Title and message are required.");
    setShowConfirmModal(true);
  };

  const toggleUser = (id: string) => {
    setUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
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
                <select className="form-select radius-8" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={userIds.length > 0}>
                  <option value="all">All Users</option>
                  <option value="male">Males Only</option>
                  <option value="female">Females Only</option>
                  <option value="verified">Verified Users Only</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">Or Select Specific Users</label>
                <div className="input-group">
                  <input type="text" className="form-control" readOnly value={userIds.length > 0 ? `${userIds.length} users selected` : ''} placeholder="Overrides audience if set..." />
                  {userIds.length > 0 && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => setUserIds([])}>
                      Clear
                    </button>
                  )}
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
                <h5 className="modal-title">Select Users</h5>
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
                      <label 
                        key={u.id} 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="form-check-input mt-0" 
                            checked={userIds.includes(u.id)}
                            onChange={() => toggleUser(u.id)} 
                          />
                          <div>
                            <div className="fw-semibold">{u.name}</div>
                            <small className="text-secondary-light">ID: {u.id}</small>
                          </div>
                        </div>
                      </label>
                    )) : (
                      <div className="text-center py-4 text-secondary-light">No users found</div>
                    )}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowUserModal(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Push Notification</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>You are about to send <strong>{title}</strong>.</p>
                <p>Target Audience: <span className="badge bg-primary">{userIds.length > 0 ? `${userIds.length} Specific User(s)` : audience.toUpperCase()}</span></p>
                <p>Are you sure you want to proceed?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={confirmSend} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : <Icon icon="solar:plain-bold" />}
                  {loading ? "Sending..." : "Confirm & Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationsPage;
