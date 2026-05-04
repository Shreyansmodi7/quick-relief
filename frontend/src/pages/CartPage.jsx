import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../features/cartSlice';
import { Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-4 text-lg">Your cart is currently empty.</p>
          <Link to="/medicines" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors inline-block">
            Browse Medicines
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item.medicine} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-md bg-white border border-gray-100 p-1" />
                    <div className="flex-1">
                      <Link to={`/medicine/${item.medicine}`} className="font-semibold text-gray-900 hover:text-primary-600 text-lg block">
                        {item.name}
                      </Link>
                      {item.requiresPrescription && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">Rx Required</span>
                      )}
                    </div>
                    <div className="font-bold text-gray-900">${item.price.toFixed(2)}</div>
                    <div>
                      <select
                        value={item.qty}
                        onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                        className="p-2 border border-gray-300 rounded-md bg-white"
                      >
                        {[...Array(10).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => removeFromCartHandler(item.medicine)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Order Summary</h2>
              
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)}):</span>
                <span>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-xl text-gray-900 mt-4 pt-4 border-t border-gray-100">
                <span>Total:</span>
                <span>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceed To Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
