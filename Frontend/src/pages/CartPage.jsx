// pages/CartPage.jsx
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between mb-4">
              <div>
                <p>{item.name}</p>
                <p>₹ {item.price}</p>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, +e.target.value)}
                  className="w-16 p-1 border rounded"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="bg-red-600 text-white p-1 ml-2 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-between">
            <button onClick={handleClearCart} className="bg-gray-600 text-white p-2 rounded-md">
              Clear Cart
            </button>
            <div className="font-bold">
              Total: ₹ {cart.reduce((total, item) => total + item.price * item.quantity, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
