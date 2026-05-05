import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePrescriptionImage } from '../features/cartSlice';
import api from '../utils/api';
import { Upload, CheckCircle } from 'lucide-react';

const UploadPrescriptionPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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
      dispatch(savePrescriptionImage(data.image));
      setUploading(false);
      setError('');
    } catch (err) {
      console.error(err);
      setError('File upload failed. Ensure it is an image or PDF.');
      setUploading(false);
    }
  };

  const continueHandler = (e) => {
    e.preventDefault();
    if (!prescriptionFile) {
      setError('Please upload a prescription image first.');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Upload Prescription</h1>
      <p className="text-center text-gray-500 mb-8">Upload your prescription and we will handle the rest.</p>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={continueHandler}>
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

        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-colors flex items-center justify-center gap-2">
          Continue to Checkout
        </button>
      </form>
    </div>
  );
};

export default UploadPrescriptionPage;
