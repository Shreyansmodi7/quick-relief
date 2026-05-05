import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, clearCartItems } from '../features/cartSlice';
import api from '../utils/api';
import { Upload, CheckCircle, MapPin, CreditCard, Wallet, Truck } from 'lucide-react';

const CheckoutPage = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress, paymentMethod, prescriptionImage } = cart;
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [stateForm, setStateForm] = useState(shippingAddress.state || '');
  const [zipCode, setZipCode] = useState(shippingAddress.zipCode || '');
  const [lat, setLat] = useState(shippingAddress.lat || userInfo?.location?.lat || 0);
  const [lng, setLng] = useState(shippingAddress.lng || userInfo?.location?.lng || 0);
  
  const [payment, setPayment] = useState(paymentMethod || 'Credit Card');
  
  const [prescriptionFile, setPrescriptionFile] = useState(prescriptionImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const requiresRx = cartItems.some(item => item.requiresPrescription);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    }
    if (cartItems.length === 0 && !prescriptionImage) {
      navigate('/cart');
    }
  }, [userInfo, navigate, cartItems, prescriptionImage]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setPrescriptionFile(data.image);
      dispatch({ type: 'cart/savePrescriptionImage', payload: data.image });
      setUploading(false);
    } catch (err) {
      console.error(err);
      setError('File upload failed. Ensure it is an image or PDF.');
      setUploading(false);
    }
  };

  const getLocationHandler = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setError('');
          alert('Location securely fetched for live tracking!');
        },
        (err) => {
          setError('Could not fetch location. Please allow location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const submitShipping = (e) => {
    e.preventDefault();
    if (requiresRx && !prescriptionFile) {
      setError('A prescription is required for one or more items in your cart.');
      return;
    }
    dispatch(saveShippingAddress({ street: address, city, state: stateForm, zipCode, lat, lng }));
    setError('');
    setStep(2);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(payment));
    setStep(3);
  };

  const placeOrderHandler = async () => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 50 ? 0 : 5.99;
    const totalPrice = itemsPrice + shippingPrice;

    try {
      const { data } = await api.post('/orders', {
        orderItems: cartItems,
        shippingAddress: { street: address, city, state: stateForm, zipCode, lat, lng },
        paymentMethod: payment,
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

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 50 ? 0 : 5.99;

  return (
    <div className="max-w-3xl mx-auto mb-16">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <span className="font-semibold text-sm">Shipping</span>
        </div>
        <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className="font-semibold text-sm">Payment</span>
        </div>
        <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          <span className="font-semibold text-sm">Review</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

        {/* STEP 1: SHIPPING */}
        {step === 1 && (
          <form onSubmit={submitShipping}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Shipping Details</h2>
              <button 
                type="button" 
                onClick={getLocationHandler}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <MapPin size={16} /> Detect Live Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Street Address</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">City</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">State</label>
                <input type="text" required value={stateForm} onChange={(e) => setStateForm(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Zip Code</label>
                <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" />
              </div>
            </div>

            {requiresRx && (
              <div className="mb-8 bg-red-50 p-6 rounded-xl border border-red-100">
                <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2"><Upload size={20} /> Prescription Required</h3>
                <p className="text-red-700 text-sm mb-4">Please upload a valid prescription image or PDF for your regulated medicines.</p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-red-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-red-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <span className="text-red-500 font-semibold animate-pulse">Uploading...</span>
                    ) : prescriptionFile ? (
                      <div className="flex flex-col items-center text-green-600">
                        <CheckCircle size={32} className="mb-2" />
                        <span className="font-semibold">Prescription Attached</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-red-500" />
                        <span className="font-semibold text-gray-600">Click to upload</span>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={uploadFileHandler} accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>
            )}

            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md">
              Continue to Payment
            </button>
          </form>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <form onSubmit={submitPayment}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>
            
            <div className="space-y-4 mb-8">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payment === 'Credit Card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" value="Credit Card" checked={payment === 'Credit Card'} onChange={(e) => setPayment(e.target.value)} className="mr-4 w-5 h-5 text-primary-600" />
                <CreditCard className={`mr-3 ${payment === 'Credit Card' ? 'text-primary-600' : 'text-gray-500'}`} size={24} />
                <span className="text-lg font-semibold text-gray-900">Credit Card (Simulated)</span>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payment === 'PayPal' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" value="PayPal" checked={payment === 'PayPal'} onChange={(e) => setPayment(e.target.value)} className="mr-4 w-5 h-5 text-primary-600" />
                <Wallet className={`mr-3 ${payment === 'PayPal' ? 'text-primary-600' : 'text-gray-500'}`} size={24} />
                <span className="text-lg font-semibold text-gray-900">PayPal</span>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${payment === 'Cash on Delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" value="Cash on Delivery" checked={payment === 'Cash on Delivery'} onChange={(e) => setPayment(e.target.value)} className="mr-4 w-5 h-5 text-primary-600" />
                <Truck className={`mr-3 ${payment === 'Cash on Delivery' ? 'text-primary-600' : 'text-gray-500'}`} size={24} />
                <span className="text-lg font-semibold text-gray-900">Cash on Delivery</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl text-lg transition-colors">
                Back
              </button>
              <button type="submit" className="w-2/3 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md">
                Review Order
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Confirmation</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                  <span className="font-semibold text-gray-900">${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">${shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t text-xl font-bold text-gray-900">
                <span>Total to Pay</span>
                <span>${(itemsPrice + shippingPrice).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Shipping To:</h3>
                <p className="text-gray-600 text-sm">{address}</p>
                <p className="text-gray-600 text-sm">{city}, {stateForm} {zipCode}</p>
                {lat !== 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-2 inline-block">Live Location Attached</span>}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Payment Method:</h3>
                <p className="text-gray-600 text-sm font-semibold">{payment}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl text-lg transition-colors">
                Back
              </button>
              <button onClick={placeOrderHandler} className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md">
                Confirm & Place Order
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
