import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Upload, CheckCircle, MapPin } from 'lucide-react';

const UploadPrescriptionPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [address, setAddress] = useState(userInfo?.address?.street || '');
  const [city, setCity] = useState(userInfo?.address?.city || '');
  const [stateForm, setStateForm] = useState(userInfo?.address?.state || '');
  const [zipCode, setZipCode] = useState(userInfo?.address?.zipCode || '');
  const [lat, setLat] = useState(userInfo?.location?.lat || 0);
  const [lng, setLng] = useState(userInfo?.location?.lng || 0);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/upload-prescription');
    }
  }, [userInfo, navigate]);

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
      setError('');
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

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    if (!prescriptionFile) {
      setError('Please upload a prescription image first.');
      return;
    }

    try {
      await api.post('/orders', {
        orderItems: [], // Pharmacist will add items later
        shippingAddress: { street: address, city, state: stateForm, zipCode, lat, lng },
        paymentMethod: 'Cash on Delivery',
        itemsPrice: 0,
        shippingPrice: 0,
        totalPrice: 0,
        prescriptionImage: prescriptionFile
      });

      navigate('/?order_success=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Order could not be placed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Upload Prescription</h1>
      <p className="text-center text-gray-500 mb-8">Let our pharmacist read your prescription and prepare your order.</p>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={placeOrderHandler}>
        <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Upload size={24} /> Attach Prescription
          </h2>
          <p className="text-blue-700 text-sm mb-4">Upload a clear image of your doctor's prescription.</p>
          
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors">
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
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-500">PDF, JPG, or PNG</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" onChange={uploadFileHandler} accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
            <button 
              type="button" 
              onClick={getLocationHandler}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors"
            >
              <MapPin size={16} /> Detect Live Location
            </button>
          </div>
          
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
              <input type="text" required value={stateForm} onChange={(e) => setStateForm(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Zip Code</label>
              <input type="text" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-colors flex items-center justify-center gap-2">
          Submit Prescription Order
        </button>
      </form>
    </div>
  );
};

export default UploadPrescriptionPage;
