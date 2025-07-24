'use client'

import { useState } from 'react'
import { FaMobile, FaBitcoin, FaBolt, FaQrcode } from 'react-icons/fa'

interface PaymentMethodSelectorProps {
  total: number
  orderId: string
  onPaymentInitiated: (paymentData: any) => void
}

export default function PaymentMethodSelector({ 
  total, 
  orderId, 
  onPaymentInitiated 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'bitcoin' | 'lightning' | null>(null)
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentData, setPaymentData] = useState<any>(null)

  const initiatePayment = async () => {
    if (!selectedMethod) return

    setLoading(true)
    try {
      if (selectedMethod === 'mpesa') {
        if (!phoneNumber) {
          alert('Please enter your phone number')
          setLoading(false)
          return
        }

        const response = await fetch('/api/payments/mpesa/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            amount: total,
            orderId
          }),
        })

        const data = await response.json()
        if (data.success) {
          setPaymentData(data)
          onPaymentInitiated(data)
        } else {
          alert(data.message || 'Payment initiation failed')
        }
      } else {
        // Bitcoin or Lightning
        const response = await fetch('/api/payments/bitcoin/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentMethod: selectedMethod
          }),
        })

        const data = await response.json()
        if (data.success) {
          setPaymentData(data)
          onPaymentInitiated(data)
        } else {
          alert(data.message || 'Payment initiation failed')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
      <p className="text-gray-600 mb-6">Total Amount: Ksh {total.toLocaleString()}</p>

      <div className="space-y-4">
        {/* M-Pesa Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedMethod === 'mpesa' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={() => setSelectedMethod('mpesa')}
        >
          <div className="flex items-center space-x-3">
            <FaMobile className="text-green-600 text-xl" />
            <div>
              <h4 className="font-semibold">M-Pesa</h4>
              <p className="text-sm text-gray-600">Pay with your mobile money</p>
            </div>
          </div>
          
          {selectedMethod === 'mpesa' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="0712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Bitcoin Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedMethod === 'bitcoin' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-200 hover:border-orange-300'
          }`}
          onClick={() => setSelectedMethod('bitcoin')}
        >
          <div className="flex items-center space-x-3">
            <FaBitcoin className="text-orange-500 text-xl" />
            <div>
              <h4 className="font-semibold">Bitcoin</h4>
              <p className="text-sm text-gray-600">Pay with Bitcoin (on-chain)</p>
            </div>
          </div>
        </div>

        {/* Lightning Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedMethod === 'lightning' 
              ? 'border-yellow-500 bg-yellow-50' 
              : 'border-gray-200 hover:border-yellow-300'
          }`}
          onClick={() => setSelectedMethod('lightning')}
        >
          <div className="flex items-center space-x-3">
            <FaBolt className="text-yellow-500 text-xl" />
            <div>
              <h4 className="font-semibold">Lightning Network</h4>
              <p className="text-sm text-gray-600">Fast Bitcoin payments</p>
            </div>
          </div>
        </div>
      </div>

      {selectedMethod && (
        <button
          onClick={initiatePayment}
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Initiating Payment...' : 'Proceed to Payment'}
        </button>
      )}

      {/* Payment Instructions */}
      {paymentData && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          {selectedMethod === 'mpesa' && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">M-Pesa Payment Initiated</h4>
              <p className="text-sm text-blue-700">
                Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
              </p>
            </div>
          )}
          
          {selectedMethod === 'bitcoin' && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Bitcoin Payment Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Amount:</strong> {paymentData.amountSats} sats</p>
                <p><strong>Address:</strong> {paymentData.walletAddress}</p>
                <div className="mt-2">
                  <FaQrcode className="inline mr-2" />
                  <span>Scan QR code or copy payment URI</span>
                </div>
              </div>
            </div>
          )}
          
          {selectedMethod === 'lightning' && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Lightning Payment Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Amount:</strong> {paymentData.amountSats} sats</p>
                <p className="break-all"><strong>Invoice:</strong> {paymentData.paymentRequest}</p>
                <div className="mt-2">
                  <FaQrcode className="inline mr-2" />
                  <span>Scan with your Lightning wallet</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
