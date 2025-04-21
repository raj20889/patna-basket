const PaymentMethods = ({ selectedPayment, setSelectedPayment }) => {
  return (
    <div className="lg:w-2/3">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Payment Method</h2>
        
        <div className="space-y-4">
          {/* Cash on Delivery Option */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => setSelectedPayment('COD')}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === 'COD'}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-700">Cash on Delivery (COD)</h3>
                <p className="text-sm text-gray-500 mt-1">Pay with cash when your order is delivered</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  No additional fees
                </div>
              </div>
            </div>
          </div>

          {/* Credit/Debit Card Option */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => setSelectedPayment('CARD')}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === 'CARD'}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-700">Credit/Debit Card</h3>
                <p className="text-sm text-gray-500 mt-1">Pay using your credit or debit card</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" className="h-6" alt="Visa" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" className="h-6" alt="Mastercard" />
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" className="h-6" alt="Apple Pay" />
                </div>
              </div>
            </div>
            
            {selectedPayment === 'CARD' && (
              <div className="mt-4">
                <div className="border rounded p-4 bg-gray-50">
                  <iframe 
                    width="100%" 
                    height="300px" 
                    title="Payments" 
                    src="https://www.zomato.com/zpaykit/init" 
                    id="payment_widget" 
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* UPI Payment Option */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'UPI' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => setSelectedPayment('UPI')}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === 'UPI'}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-700">UPI Payment</h3>
                <p className="text-sm text-gray-500 mt-1">Pay using any UPI app</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Paytm_Logo.png" className="h-6" alt="Paytm" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/PhonePe_Logo.svg" className="h-6" alt="PhonePe" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Google_Pay_%28GPay%29_Logo.svg" className="h-6" alt="Google Pay" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Notes Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Notes</h2>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Any special instructions for your order?"
        ></textarea>
      </div>
    </div>
  );
};

export default PaymentMethods;