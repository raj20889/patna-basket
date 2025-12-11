const RazorpayOption = ({ selectedPayment, setSelectedPayment }) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        selectedPayment === 'RAZORPAY'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => setSelectedPayment('RAZORPAY')}
    >
      <div className="flex items-start">
        <div className="flex items-center h-5 mt-1">
          <input
            type="radio"
            name="payment"
            checked={selectedPayment === 'RAZORPAY'}
            onChange={() => {}}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 flex items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Razorpay_logo.svg"
            alt="Razorpay"
            className="h-6 mr-2"
          />
          <h3 className="font-medium text-gray-700">Pay with Razorpay</h3>
        </div>
      </div>
      {selectedPayment === 'RAZORPAY' && (
        <p className="text-sm text-gray-500 mt-2">
          You will be redirected to the secure Razorpay checkout to complete your payment.
        </p>
      )}
    </div>
  );
};

export default RazorpayOption;