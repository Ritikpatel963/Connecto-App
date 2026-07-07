import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import PageHeader from "../components/PageHeader";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
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
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'payments' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => setActiveTab('payments')}
              >
                Payment Gateways
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'notifications' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-semibold text-lg ${activeTab === 'company' ? 'active text-primary-600 border-bottom border-2 border-primary-600' : 'text-secondary-light'}`}
                onClick={() => setActiveTab('company')}
              >
                Company Profile
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
