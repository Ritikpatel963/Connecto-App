import React from 'react'
import RazorPay from './child/RazorPay'
import InAppPurchase from './child/InAppPurchase'
import CustomPayment from './child/CustomPayment'

const PaymentGatewayLayer = () => {
    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-body p-24">
                <div className="row gy-4">

                    {/* RazorPay */}
                    <RazorPay />

                    {/* In-App Purchase */}
                    <InAppPurchase />

                    {/* Custom Payment (QR Code) */}
                    <CustomPayment />

                </div>
            </div>
        </div>

    )
}

export default PaymentGatewayLayer