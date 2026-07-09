import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { settingsApi } from "../api/settings";

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (location.hash === "#withdrawal") {
      setActiveTab("withdrawal");
    }
  }, [location.hash]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'withdrawal') {
      navigate('/settings#withdrawal', { replace: true });
    } else {
      navigate('/settings', { replace: true });
    }
  };

  // Settings State
  const [withdrawalConfig, setWithdrawalConfig] = useState<{min: string, max: string}>({min: "100", max: "10000"});

  const { data: configData } = useQuery({
    queryKey: ["settings", "withdrawal_config"],
    queryFn: () => settingsApi.get("withdrawal_config"),
  });

  useEffect(() => {
    if (configData) {
      setWithdrawalConfig(configData);
    }
  }, [configData]);

  const saveRules = useMutation({
    mutationFn: (config: any) => settingsApi.set("withdrawal_config", config),
    onSuccess: () => {
      toast.success("Withdrawal rule saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleSave = () => {
    if (activeTab === 'withdrawal') {
      saveRules.mutate(withdrawalConfig);
    } else {
      toast.success("Settings saved successfully!");
    }
  };

  return (
    <>
      <PageHeader 
        title="Settings" 
        description="Platform-level configuration placeholder for the REST settings API." 
        icon="solar:settings-outline" 
      />
      
      <div className="card">
        <div className="card-header border-bottom p-0">
          <ul className="nav nav-tabs nav-tabs-line p-24 pb-0 border-0">
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'general' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('general')}
              >
                General
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'payments' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('payments')}
              >
                Payment Gateways
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'otp' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('otp')}
              >
                OTP Methods
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'notifications' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('notifications')}
              >
                Notifications
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'company' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('company')}
              >
                Company Profile
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'withdrawal' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => handleTabChange('withdrawal')}
              >
                Withdrawal Rules
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body p-24">
          <div className="tab-content">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="row gy-4">
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Platform name</label>
                  <input className="form-control" defaultValue="Connecting People" />
                </div>
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Support email</label>
                  <input className="form-control" defaultValue="support@connecto.app" />
                </div>
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Default currency</label>
                  <select className="form-select" defaultValue="INR">
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Agora region</label>
                  <select className="form-select" defaultValue="auto">
                    <option value="auto">Automatic</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="alert alert-info d-flex align-items-start gap-2 mb-0">
                    <Icon icon="solar:info-circle-outline" className="text-xl flex-shrink-0" />
                    <span>This is a frontend placeholder. Save will call <code>PATCH /api/admin/settings</code> when the endpoint is available.</span>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="row gy-4">
                {/* Razorpay */}
                <div className="col-lg-12">
                  <div className="card shadow-none border">
                    <div className="card-header bg-neutral-50 border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:card-outline" className="text-2xl text-primary-600" />
                        <h6 className="mb-0 text-lg">Razorpay</h6>
                      </div>
                      <div className="form-switch switch-primary">
                        <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                      </div>
                    </div>
                    <div className="card-body p-24">
                      <div className="row gy-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Environment</label>
                          <select className="form-select" defaultValue="sandbox">
                            <option value="sandbox">Sandbox</option>
                            <option value="production">Production</option>
                          </select>
                        </div>
                        <div className="col-md-6"></div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Key ID</label>
                          <input className="form-control" placeholder="rzp_test_..." />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Key Secret</label>
                          <input className="form-control" type="password" placeholder="••••••••••••" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Play In-App Purchase */}
                <div className="col-lg-12">
                  <div className="card shadow-none border">
                    <div className="card-header bg-neutral-50 border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:play-circle-outline" className="text-2xl text-primary-600" />
                        <h6 className="mb-0 text-lg">Google Play In-App Purchase</h6>
                      </div>
                      <div className="form-switch switch-primary">
                        <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                      </div>
                    </div>
                    <div className="card-body p-24">
                      <div className="row gy-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Package Name</label>
                          <input className="form-control" defaultValue="com.connecto.app" placeholder="com.example.app" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Service Account JSON</label>
                          <input className="form-control" type="file" accept=".json" />
                        </div>
                        <div className="col-12">
                          <p className="text-sm text-secondary-light mb-0 mt-2">
                            Used to verify Android in-app purchases on the server.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Payment (QR Code) */}
                <div className="col-lg-12">
                  <div className="card shadow-none border">
                    <div className="card-header bg-neutral-50 border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:scanner-outline" className="text-2xl text-primary-600" />
                        <h6 className="mb-0 text-lg">Custom Payment (QR Code)</h6>
                      </div>
                      <div className="form-switch switch-primary">
                        <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                      </div>
                    </div>
                    <div className="card-body p-24">
                      <div className="row gy-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold">Instructions for User</label>
                          <textarea 
                            className="form-control" 
                            rows={3}
                            defaultValue="Scan the QR code below to make the payment. After successful payment, please upload the screenshot of the transaction." 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Upload QR Code</label>
                          <input className="form-control" type="file" accept="image/*" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTP TAB */}
            {activeTab === 'otp' && (
              <div className="row gy-4">
                {/* Firebase OTP */}
                <div className="col-lg-12">
                  <div className="card shadow-none border">
                    <div className="card-header bg-neutral-50 border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="logos:firebase" className="text-2xl text-primary-600" />
                        <h6 className="mb-0 text-lg">Firebase</h6>
                      </div>
                      <div className="form-switch switch-primary">
                        <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                      </div>
                    </div>
                    <div className="card-body p-24">
                      <div className="row gy-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">API Key</label>
                          <input className="form-control" placeholder="AIzaSyB..." />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Auth Domain</label>
                          <input className="form-control" placeholder="app-id.firebaseapp.com" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Project ID</label>
                          <input className="form-control" placeholder="app-id" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Sender ID</label>
                          <input className="form-control" placeholder="123456789" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fast2sms OTP */}
                <div className="col-lg-12">
                  <div className="card shadow-none border">
                    <div className="card-header bg-neutral-50 border-bottom py-16 px-24 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Icon icon="solar:letter-outline" className="text-2xl text-primary-600" />
                        <h6 className="mb-0 text-lg">Fast2sms</h6>
                      </div>
                      <div className="form-switch switch-primary">
                        <input className="form-check-input" type="checkbox" role="switch" />
                      </div>
                    </div>
                    <div className="card-body p-24">
                      <div className="row gy-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">API Key</label>
                          <input className="form-control" type="password" placeholder="••••••••••••" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Sender ID</label>
                          <input className="form-control" placeholder="FSTSMS" />
                        </div>
                        <div className="col-12">
                          <p className="text-sm text-secondary-light mb-0 mt-2">
                            Used for sending domestic OTP messages in India.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="row gy-4">
                <div className="col-12">
                  <h6 className="mb-4">Global Notifications</h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-16 mb-16">
                    <div>
                      <p className="fw-semibold mb-0 text-primary-light">Email Notifications</p>
                      <span className="text-sm text-secondary-light">Send system emails to users</span>
                    </div>
                    <div className="form-switch switch-primary">
                      <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-16 mb-16">
                    <div>
                      <p className="fw-semibold mb-0 text-primary-light">Push Notifications</p>
                      <span className="text-sm text-secondary-light">Send push notifications to mobile apps</span>
                    </div>
                    <div className="form-switch switch-primary">
                      <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY TAB */}
            {activeTab === 'company' && (
              <div className="row gy-4">
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Company Name</label>
                  <input className="form-control" defaultValue="Connecto LLC" />
                </div>
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Tax ID / VAT</label>
                  <input className="form-control" placeholder="e.g. US123456789" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Address</label>
                  <textarea className="form-control" rows={3} defaultValue="123 Platform St, Tech City" />
                </div>
              </div>
            )}

            {/* WITHDRAWAL RULES TAB */}
            {activeTab === 'withdrawal' && (
              <div className="row gy-4">
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Minimum Withdrawal Amount (INR)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input 
                      type="number"
                      className="form-control" 
                      value={withdrawalConfig.min} 
                      onChange={(e) => setWithdrawalConfig({...withdrawalConfig, min: e.target.value})}
                      placeholder="e.g. 100" 
                    />
                  </div>
                  <p className="text-sm text-secondary-light mb-0 mt-2">
                    Users cannot request a withdrawal below this amount.
                  </p>
                </div>
                
                <div className="col-lg-6">
                  <label className="form-label fw-semibold">Maximum Withdrawal Amount (INR)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input 
                      type="number"
                      className="form-control" 
                      value={withdrawalConfig.max} 
                      onChange={(e) => setWithdrawalConfig({...withdrawalConfig, max: e.target.value})}
                      placeholder="e.g. 10000" 
                    />
                  </div>
                  <p className="text-sm text-secondary-light mb-0 mt-2">
                    Users cannot request a withdrawal exceeding this amount in a single transaction.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-24 pt-24 border-top">
              <button className="btn btn-primary-600" onClick={handleSave}>
                Save settings
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
