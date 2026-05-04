import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import api from '../utils/api';
import { FileText, Truck, ShieldCheck, Clock } from 'lucide-react';

const HomePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data } = await api.get('/medicines');
        setMedicines(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching medicines', error);
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const handleAddToCart = (medicine) => {
    dispatch(addToCart({
      medicine: medicine._id,
      name: medicine.name,
      image: medicine.image,
      price: medicine.price,
      qty: 1,
    }));
    // Could add toast notification here
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Fast, Reliable <br /> <span className="text-primary-600">Medicine Delivery</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Get your prescriptions and health products delivered to your doorstep in minutes from trusted local pharmacies.
          </p>
          <div className="flex gap-4">
            <Link to="/medicines" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-md text-center">
              Order Now
            </Link>
            <Link to="/checkout" className="bg-white hover:bg-gray-50 text-primary-600 border border-primary-200 px-6 py-3 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2 justify-center">
              <FileText size={20} /> Upload Prescription
            </Link>
          </div>
        </div>
        <div className="md:w-5/12 flex justify-center">
          <div className="relative w-full max-w-sm aspect-square bg-white rounded-full shadow-2xl overflow-hidden flex items-center justify-center p-8">
            <img 
              src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Pharmacy" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast Delivery</h3>
            <p className="text-sm text-gray-500">Delivered within hours from nearest pharmacy.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">100% Genuine Products</h3>
            <p className="text-sm text-gray-500">Sourced directly from verified pharmacists.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Tracking</h3>
            <p className="text-sm text-gray-500">Track your order status in real-time.</p>
          </div>
        </div>
      </section>

      {/* Category Carousels */}
      <section className="space-y-12">
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px] h-64 flex-shrink-0">
                <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-8 rounded-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          ['Homeopathy', 'Personal Care'].map(categoryName => {
            const categoryMedicines = medicines.filter(m => m.category === categoryName);
            if (categoryMedicines.length === 0) return null;

            return (
              <div key={categoryName} className="relative">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                  {categoryMedicines.map((medicine) => (
                    <div key={medicine._id} className="snap-start bg-[#f9fdfa] p-4 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow group flex flex-col min-w-[200px] max-w-[220px] flex-shrink-0 relative">
                      
                      {/* Discount Badge */}
                      {medicine.discount > 0 && (
                        <div className="absolute top-0 left-4 bg-[#f05a28] text-white text-xs font-bold px-3 py-1 rounded-b-lg z-10 shadow-sm">
                          Up to {medicine.discount}% off
                        </div>
                      )}

                      <div className="relative h-32 mt-4 mb-4 overflow-hidden rounded-xl bg-white flex items-center justify-center p-2">
                        <img src={medicine.image} alt={medicine.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-end text-center">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{medicine.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{medicine.subCategory || medicine.description}</p>
                        
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="font-bold text-gray-900">${medicine.price.toFixed(2)}</span>
                          {medicine.discount > 0 && (
                             <span className="text-xs text-gray-400 line-through">
                               ${(medicine.price * (1 + medicine.discount/100)).toFixed(2)}
                             </span>
                          )}
                        </div>

                        <button 
                          onClick={() => handleAddToCart(medicine)}
                          disabled={!medicine.inStock}
                          className={`w-full py-2 rounded-full text-sm font-bold transition-colors ${
                            medicine.inStock 
                              ? 'bg-primary-600 text-white hover:bg-primary-700' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {medicine.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default HomePage;
