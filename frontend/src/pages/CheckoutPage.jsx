import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, clearCartItems } from '../features/cartSlice';
import api from '../utils/api';
import { Upload, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [address, setAddress] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [state, setState] = useState(shippingAddress.state || '');
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || '');
  
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const requiresRx = cartItems.some(item => item.requiresPrescription);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, navigate, cartItems]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setPrescriptionFile(data.image);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setError('File upload failed. Ensure it is an image or PDF.');
      setUploading(false);
    }
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (requiresRx && !prescriptionFile) {
      setError('A prescription is required for one or more items in your cart.');
      return;
    }

    const shipping = { street: address, city, state, zipCode, lat: userInfo?.location?.lat || 0, lng: userInfo?.location?.lng || 0 };
    dispatch(saveShippingAddress(shipping));

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 50 ? 0 : 5.99; // Free shipping over $50
    const totalPrice = itemsPrice + shippingPrice;

    try {
      const { data } = await api.post('/orders', {
        orderItems: cartItems,
        shippingAddress: shipping,
        paymentMethod: 'Cash on Delivery',
        itemsPrice,
        shippingPrice,
        totalPrice,
        prescriptionImage: prescriptionFile
      });

      dispatch(clearCartItems());
      navigate('/?order_success=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Order could not be placed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={placeOrderHandler}>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Street Address</label>
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">City</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">State</label>
              <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Zip Code</label>
              <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        {requiresRx && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Upload size={24} /> Prescription Required
            </h2>
            <p className="text-blue-700 text-sm mb-4">Some items in your cart require a valid prescription. Please upload it below.</p>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                     <span className="text-blue-500 font-semibold animate-pulse">Uploading...</span>
                  ) : prescriptionFile ? (
                     <div className="flex flex-col items-center text-green-600">
                       <CheckCircle size={32} className="mb-2" />
                       <span className="font-semibold">File Uploaded Successfully</span>
                     </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-blue-500" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, JPG, or PNG</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={uploadFileHandler} accept=".pdf,.jpg,.jpeg,.png" />
              </label>
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex justify-between font-bold text-2xl text-gray-900 mb-6">
            <span>Total to Pay:</span>
            <span>${(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) + (cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) > 50 ? 0 : 5.99)).toFixed(2)}</span>
          </div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-colors">
            Place Order (Cash on Delivery)
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
