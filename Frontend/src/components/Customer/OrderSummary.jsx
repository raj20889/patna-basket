const OrderSummary = ({
  address,
  cartItems,
  cartTotals,
  selectedTip,
  donationSelected,
  selectedPayment,
  navigate,
  handleTipChange,
  clearTip,
  handleDonationToggle,
  handlePaymentSubmit
}) => {
  return (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Summary</h2>
        
        {/* Delivery Address */}
        {address && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Delivery Address</h3>
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold">
                {address.addressType === 'Other' ? address.customName : address.addressType}: 
              </p>
              <p>{address.building}, {address.locality}</p>
              {address.floor && <p>Floor: {address.floor}</p>}
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p className="mt-2">
                <span className="font-medium">Contact:</span> {address.contactName} ({address.contactPhone})
              </p>
            </div>
            <button 
              className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800"
              onClick={() => navigate('/checkout')}
            >
              Change Address
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">My Cart</h3>
            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            ) : (
              cartItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.variant}</p>
                    <p className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-gray-700 font-medium">
                    ×{item.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Details - Styled like Cart */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Bill details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📦</span>
                <span>Items total</span>
              </div>
              <span className="font-medium">₹{cartTotals.itemsTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🚚</span>
                <span>Delivery charge</span>
                <span className="text-gray-400 text-xs">i</span>
              </div>
              <div>
                <span className="text-gray-400 line-through mr-1">₹25</span>
                <span className="text-blue-600">FREE</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🛍️</span>
                <span>Handling charge</span>
                <span className="text-gray-400 text-xs">i</span>
              </div>
              <span className="font-medium">₹{cartTotals.handlingCharge.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">👤</span>
                <span>Tip for delivery partner</span>
              </div>
              <span className="font-medium">₹{cartTotals.tipAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <img 
                    src="https://cdn.grofers.com/assets/ui/icons/feeding_india_icon_v6.png" 
                    alt="Feeding India" 
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Feeding India</p>
                  <p className="text-xs text-gray-500">Donation</p>
                </div>
              </div>
              <div 
                className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer ${donationSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                onClick={handleDonationToggle}
              >
                <span>₹1</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${donationSelected ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}>
                  {donationSelected && '✓'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
              <span className="font-bold text-gray-800">Grand total</span>
              <span className="font-bold text-lg text-gray-800">₹{cartTotals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tip Selection - Same as Cart */}
        <div className="p-4 mt-2">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 mb-1">Tip your delivery partner</h3>
            <p className="text-sm text-gray-500">
              Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
            </p>
          </div>
          
          {selectedTip > 0 && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Selected tip: ₹{selectedTip}</span>
              <button 
                onClick={clearTip}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[20, 30, 50, 'Custom'].map((amount) => (
              <button
                key={amount}
                onClick={() => typeof amount === 'number' && handleTipChange(amount)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg ${selectedTip === amount ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} transition-colors`}
              >
                {typeof amount === 'number' ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://b.zmtcdn.com/data/o2_assets/${
                        amount === 20 ? '2ef961c631b0b3ec214689aca4e95efd1633353812' : 
                        amount === 30 ? '047a7d05ee3bbad4db7e962c25d759cd1633508344' : 
                        '3eff26c9392c33254d314ce8758ffae51633353789'
                      }.png?output-format=webp`} 
                      alt={`₹${amount}`}
                      className="w-5 h-5"
                    />
                    <span>₹{amount}</span>
                  </div>
                ) : (
                  <span>{amount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          onClick={handlePaymentSubmit}
          disabled={!selectedPayment}
          className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition-colors ${
            !selectedPayment 
              ? 'bg-gray-400 cursor-not-allowed' 
              : selectedPayment === 'COD' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {selectedPayment === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
        </button>

        {/* Security Assurance */}
        <div className="mt-4 flex items-center text-xs text-gray-500">
          <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
          </svg>
          Secure payment processed with 256-bit encryption
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;