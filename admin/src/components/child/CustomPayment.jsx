import React from 'react';

const CustomPayment = () => {
    return (
        <div className="col-xxl-6">
            <div className="card radius-12 shadow-none border overflow-hidden">
                <div className="card-header bg-neutral-100 border-bottom py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                    <div className="d-flex align-items-center gap-10">
                        <span className="w-36-px h-36-px bg-base rounded-circle d-flex justify-content-center align-items-center">
                            <i className="ri-qr-code-line text-xl text-primary-light"></i>
                        </span>
                        <span className="text-lg fw-semibold text-primary-light">
                            Custom Payment (QR Code)
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
                        <div className="col-sm-12">
                            <label
                                htmlFor="paymentInstructions"
                                className="form-label fw-semibold text-primary-light text-md mb-8"
                            >
                                Instructions for User <span className="text-danger-600">*</span>
                            </label>
                            <textarea
                                className="form-control radius-8"
                                id="paymentInstructions"
                                placeholder="Scan the QR code, make the payment, and upload the screenshot."
                                defaultValue="Scan the QR code below to make the payment. After successful payment, please upload the screenshot of the transaction."
                                rows={3}
                            ></textarea>
                        </div>
                        <div className="col-sm-12">
                            <label
                                htmlFor="qrCodeImage"
                                className="form-label fw-semibold text-primary-light text-md mb-8"
                            >
                                QR Code Image <span className="text-danger-600">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control radius-8"
                                id="qrCodeImage"
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

export default CustomPayment;
