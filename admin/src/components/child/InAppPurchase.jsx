import React from 'react';

const InAppPurchase = () => {
    return (
        <div className="col-xxl-6">
            <div className="card radius-12 shadow-none border overflow-hidden">
                <div className="card-header bg-neutral-100 border-bottom py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                    <div className="d-flex align-items-center gap-10">
                        <span className="w-36-px h-36-px bg-base rounded-circle d-flex justify-content-center align-items-center">
                            <i className="ri-google-play-fill text-xl text-primary-light"></i>
                        </span>
                        <span className="text-lg fw-semibold text-primary-light">
                            Google Play In-App Purchase
                        </span>
                    </div>
                    <div className="form-switch switch-primary d-flex align-items-center justify-content-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            defaultChecked
                        />
                    </div>
                </div>
                <div className="card-body p-24">
                    <div className="row gy-3">
                        <div className="col-sm-6">
                            <label
                                htmlFor="packageName"
                                className="form-label fw-semibold text-primary-light text-md mb-8"
                            >
                                Package Name <span className="text-danger-600">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control radius-8"
                                id="packageName"
                                placeholder="com.example.app"
                                defaultValue="com.snappo.inc"
                            />
                        </div>
                        <div className="col-sm-6">
                            <label
                                htmlFor="serviceAccountJson"
                                className="form-label fw-semibold text-primary-light text-md mb-8"
                            >
                                Service Account JSON <span className="text-danger-600">*</span>
                            </label>
                            <input
                                type="file"
                                accept=".json"
                                className="form-control radius-8"
                                id="serviceAccountJson"
                            />
                        </div>
                        
                        <div className="col-sm-12">
                            <button
                                type="submit"
                                className="btn btn-primary border border-primary-600 text-md px-24 py-8 radius-8 w-100 text-center mt-3"
                            >
                                Save Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InAppPurchase;
