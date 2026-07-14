import React, { useState } from "react";
import { Icon } from "@iconify/react";
import PageHeader from "../components/PageHeader";
import { toast } from "react-toastify";

const PushNotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Title and message are required.");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      let baseUrl = process.env.REACT_APP_ADMIN_API_BASE_URL || "http://localhost:4100";
      // If we are testing on a local network (e.g., from a phone) but base URL is localhost, replace it with the actual hostname so it connects to the PC
      if (baseUrl.includes("localhost") && window.location.hostname !== "localhost") {
        baseUrl = baseUrl.replace("localhost", window.location.hostname);
      }
      const res = await fetch(`${baseUrl}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, message, userId: userId || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send notification");
      toast.success(`Successfully sent ${data.sentCount} notifications!`);
      setTitle("");
      setMessage("");
      setUserId("");
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
    </div>
  );
};

export default PushNotificationsPage;
