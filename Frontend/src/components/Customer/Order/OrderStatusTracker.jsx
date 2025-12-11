import React from 'react';
import { CheckCircleIcon, TruckIcon, XCircleIcon, CreditCardIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const OrderStatusTracker = ({ status, paymentStatus, paymentMethod }) => {
  const statusSteps = [
    { 
      id: 'pending_payment', 
      name: 'Payment', 
      shortName: 'Payment',
      icon: paymentMethod === 'COD' ? <BanknotesIcon className="h-5 w-5 md:h-6 md:w-6" /> : <CreditCardIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'yellow'
    },
    { 
      id: 'confirmed', 
      name: 'Confirmed', 
      shortName: 'Confirmed',
      icon: <CheckCircleIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'blue'
    },
    { 
      id: 'preparing', 
      name: 'Preparing', 
      shortName: 'Prep',
      icon: <ClockIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'blue'
    },
    { 
      id: 'shipped', 
      name: 'Shipped', 
      shortName: 'Shipped',
      icon: <TruckIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'blue'
    },
    { 
      id: 'delivered', 
      name: 'Delivered', 
      shortName: 'Delivered',
      icon: <CheckCircleIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'green'
    },
    { 
      id: 'cancelled', 
      name: 'Cancelled', 
      shortName: 'Cancelled',
      icon: <XCircleIcon className="h-5 w-5 md:h-6 md:w-6" />,
      color: 'red'
    }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.id === status);
  const isCancelled = status === 'cancelled';
  const isCOD = paymentMethod === 'COD';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4 md:mb-8">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-md md:text-lg font-medium text-gray-900">
          Order Status
        </h2>
      </div>
      <div className="p-4 md:p-6">
        <div className="relative">
          {/* Progress bar - hidden on mobile, shown on md+ */}
          <div className=" md:block overflow-hidden h-2 mb-4 md:mb-6 text-xs flex rounded bg-gray-200">
            <div 
              style={{ 
                width: isCancelled ? '100%' : `${(currentStatusIndex / (statusSteps.length - 2)) * 100}%`,
                backgroundColor: isCancelled ? '#ef4444' : '#3b82f6'
              }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
            ></div>
          </div>

          {/* Status steps */}
          <div className="grid grid-cols-5 gap-2 md:flex md:justify-between relative">
            {statusSteps
              .filter(step => step.id !== 'cancelled') // Remove cancelled from main flow
              .map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isFuture = index > currentStatusIndex;

                let bgColor = 'bg-gray-200';
                let textColor = 'text-gray-500';
                let borderColor = 'border-gray-300';

                if (isCompleted) {
                  bgColor = 'bg-blue-100';
                  textColor = 'text-blue-800';
                  borderColor = 'border-blue-300';
                } else if (isCurrent) {
                  bgColor = step.color === 'red' ? 'bg-red-100' : 'bg-blue-100';
                  textColor = step.color === 'red' ? 'text-red-800' : 'text-blue-800';
                  borderColor = step.color === 'red' ? 'border-red-300' : 'border-blue-300';
                }

                return (
                  <div 
                    key={step.id} 
                    className={`flex flex-col items-center ${isFuture ? 'opacity-50' : ''}`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 ${borderColor} ${bgColor} mb-1 md:mb-2`}>
                      {React.cloneElement(step.icon, { 
                        className: `h-4 w-4 md:h-6 md:w-6 ${textColor}` 
                      })}
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium text-center ${textColor} hidden md:block`}>
                      {step.name}
                    </span>
                    <span className={`text-[10px] md:text-xs font-medium text-center ${textColor} block md:hidden`}>
                      {step.shortName}
                    </span>
                    {isCurrent && !isCancelled && (
                      <span className="text-[10px] md:text-xs mt-0 md:mt-1 text-blue-600 font-medium">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            
            {/* Cancelled status - shown separately if needed */}
            {isCancelled && (
              <div className="flex flex-col items-center col-span-5 mt-4 md:mt-0 md:absolute md:right-0 md:top-0">
                <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-red-300 bg-red-100 mb-1 md:mb-2">
                  <XCircleIcon className="h-4 w-4 md:h-6 md:w-6 text-red-800" />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-center text-red-800">
                  Cancelled
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment status */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col md:flex-row md:items-center">
              <span className="font-medium text-sm md:text-base md:mr-2">Payment:</span>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-700 text-sm md:text-base">
                  {paymentMethod?.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {isCOD && (
                    <span className="ml-1 md:ml-2 text-xs md:text-sm text-gray-500">(COD)</span>
                  )}
                </span>
                <span className={`mt-1 md:mt-0 md:ml-3 px-2 py-1 rounded-full text-xs md:text-sm font-medium ${
                  paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {isCOD && paymentStatus === 'pending' ? 'Pay at Delivery' : 
                   paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1)}
                </span>
              </div>
            </div>
            {isCOD && paymentStatus === 'pending' && (
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Please prepare the exact amount when your order arrives.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracker;