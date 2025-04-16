import { useEffect } from 'react';

const CheckoutSlider = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Slider */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          {/* Close button */}
          <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
            <button
              onClick={onClose}
              className="rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              <span className="h-6 w-6 flex items-center justify-center">×</span>
            </button>
          </div>
          
          {/* Slider content */}
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              {/* Your checkout content here */}
              <div className="cart-modal-rn cart-modal--with-searchbar">
                <div className="CartAddress__Container-sc-1jlv8-0 fGTjHE">
                  <div className="CartAddress__NavBarContainer-sc-1jlv8-1 CWdiH">
                    <div className="CartAddress__NavBarWrapper-sc-1jlv8-2 kZtLwj">
                      <div className="CartAddress__IconContainer-sc-1jlv8-3 iYqXSt">
                        <div className="CartAddress__Icon-sc-1jlv8-4 dzsSWV"></div>
                      </div>
                      <div className="CartAddress__NavBarTitle-sc-1jlv8-5 geqCwO">
                        Select delivery address
                      </div>
                    </div>
                  </div>
                  <div className="CartAddress__Wrapper-sc-1jlv8-6 kqWYTv">
                    <div className="CartAddress__AddAddressContainer-sc-1jlv8-10 eJDWnW">
                      <div className="CartAddress__PlusIcon-sc-1jlv8-9 hhOXKP"></div> 
                      Add a new address
                    </div>
                    <div className="CartAddress__AddressListContainer-sc-1jlv8-7 eAKrPa">
                      <div className="CartAddress__AddressHeading-sc-1jlv8-8 cyeNhU">
                        Your saved address
                      </div>
                      <div className="AddressList__AddressLists-sc-zt55li-0 hddZfp"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSlider;