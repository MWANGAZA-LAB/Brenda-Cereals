'use client'

import { useState } from 'react'
import { FaMobile, FaBitcoin, FaCreditCard } from 'react-icons/fa'

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
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'safaricom_paybill' | 'bitcoin_wallet' | null>(null)
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
      } else if (selectedMethod === 'safaricom_paybill') {
        if (!phoneNumber) {
          alert('Please enter your phone number')
          setLoading(false)
          return
        }

        const response = await fetch('/api/payments/safaricom-paybill/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            orderId
          }),
        })

        const data = await response.json()
        if (data.success) {
          setPaymentData(data)
          onPaymentInitiated(data)
        } else {
          alert(data.error || 'Payment initiation failed')
        }
      } else if (selectedMethod === 'bitcoin_wallet') {
        const response = await fetch('/api/payments/bitcoin-wallet/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId
          }),
        })

        const data = await response.json()
        if (data.success) {
          setPaymentData(data)
          onPaymentInitiated(data)
        } else {
          alert(data.error || 'Payment initiation failed')
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

        {/* Safaricom Paybill Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedMethod === 'safaricom_paybill' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => setSelectedMethod('safaricom_paybill')}
        >
          <div className="flex items-center space-x-3">
            <FaCreditCard className="text-blue-600 text-xl" />
            <div>
              <h4 className="font-semibold">Safaricom Paybill</h4>
              <p className="text-sm text-gray-600">Pay directly to paybill number</p>
            </div>
          </div>
          
          {selectedMethod === 'safaricom_paybill' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="0712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Bitcoin Wallet Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedMethod === 'bitcoin_wallet' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-200 hover:border-orange-300'
          }`}
          onClick={() => setSelectedMethod('bitcoin_wallet')}
        >
          <div className="flex items-center space-x-3">
            <FaBitcoin className="text-orange-500 text-xl" />
            <div>
              <h4 className="font-semibold">Bitcoin Wallet</h4>
              <p className="text-sm text-gray-600">Pay with Bitcoin via QR code</p>
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
          
          {selectedMethod === 'safaricom_paybill' && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Safaricom Paybill Payment</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Paybill Number:</strong> {paymentData.paybillInstructions?.paybillNumber}</p>
                <p><strong>Account Number:</strong> {paymentData.orderId || 'Your Order ID'}</p>
                <div className="mt-3">
                  <p className="font-medium mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {paymentData.paybillInstructions?.instructions?.map((instruction: string, index: number) => (
                      <li key={index} className="text-xs">{instruction}</li>
                    ))}
                  </ol>
                </div>
                <div className="mt-3 p-2 bg-yellow-100 rounded">
                  <p className="text-xs text-yellow-800">
                    After payment, you'll receive an SMS confirmation. Enter the confirmation code to complete your order.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {selectedMethod === 'bitcoin_wallet' && (
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Bitcoin Wallet Payment</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Amount:</strong> {paymentData.formattedAmount}</p>
                <p className="break-all"><strong>Address:</strong> {paymentData.walletAddress}</p>
                {paymentData.qrCodeImage && (
                  <div className="mt-3 text-center">
                    <img 
                      src={paymentData.qrCodeImage} 
                      alt="Bitcoin Payment QR Code" 
                      className="mx-auto w-48 h-48 border rounded"
                    />
                    <p className="mt-2 text-xs text-gray-600">Scan with your Bitcoin wallet</p>
                  </div>
                )}
                <div className="mt-3">
                  <p className="font-medium mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {paymentData.instructions?.map((instruction: string, index: number) => (
                      <li key={index} className="text-xs">{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
