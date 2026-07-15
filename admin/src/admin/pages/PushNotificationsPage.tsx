import React, { useState } from "react";
import { Icon } from "@iconify/react";
import PageHeader from "../components/PageHeader";
import { toast } from "react-toastify";
import api from "../api/http";

const PushNotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/push/history");
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Title and message are required.");
    
    setLoading(true);
    try {
      const { data } = await api.post("/push/dispatch", { title, message, userId: userId || null });
      toast.success(`Successfully sent ${data.data?.sentCount ?? data.sentCount ?? 0} notifications!`);
      setTitle("");
      setMessage("");
      setUserId("");
      fetchHistory(); // refresh datatable
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="push-notifications-page">
      <PageHeader title="Send Push Notification" description="Send a broadcast or targeted push notification to users" />
      <div className="card mt-24">
        <div className="card-header border-bottom">
          <h6 className="mb-0">Custom Notification</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSend}>
            <div className="row gy-3">
              <div className="col-12">
                <label className="form-label">Notification Title</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Special Offer!" required />
              </div>
              <div className="col-12">
                <label className="form-label">Message Body</label>
                <textarea className="form-control" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Get 50% off on your next recharge..." required />
              </div>
              <div className="col-12">
                <label className="form-label">Target User ID (Optional)</label>
                <input type="text" className="form-control" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Leave blank to send to ALL users" />
                <small className="text-muted">Enter a specific User ID to send a targeted notification.</small>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : <Icon icon="solar:plain-bold" />}
                  {loading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header border-bottom">
          <h6 className="mb-0">Recent Notifications</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Target</th>
                  <th>Sent Count</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td><div className="text-truncate" style={{maxWidth: '300px'}}>{item.message}</div></td>
                    <td>{item.target_user_id ? <span className="badge bg-info">User {item.target_user_id}</span> : <span className="badge bg-primary">Broadcast</span>}</td>
                    <td>{item.sent_count} devices</td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No recent notifications</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationsPage;
