import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import api from '../utils/api';
import { Search } from 'lucide-react';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/medicines?keyword=${searchQuery}`);
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(keyword);
  };

  const handleAddToCart = (medicine) => {
    dispatch(addToCart({
      medicine: medicine._id,
      name: medicine.name,
      image: medicine.image,
      price: medicine.price,
      requiresPrescription: medicine.requiresPrescription,
      qty: 1,
    }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Catalog</h1>
        <form onSubmit={handleSearch} className="w-full md:w-1/3 relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search medicines..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
              <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-8 rounded-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {medicines.length > 0 ? medicines.map((medicine) => (
            <div key={medicine._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-40 mb-4 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-4">
                <img src={medicine.image} alt={medicine.name} className="max-h-full object-contain" />
                {medicine.requiresPrescription && (
                  <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Rx Required</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{medicine.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{medicine.description}</p>
                <p className="text-xs text-primary-600 font-medium">{medicine.category}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-gray-900 text-lg">${medicine.price.toFixed(2)}</span>
                <button 
                  onClick={() => handleAddToCart(medicine)}
                  disabled={!medicine.inStock}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    medicine.inStock 
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {medicine.inStock ? 'Add' : 'Out of Stock'}
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              No medicines found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicinesPage;
