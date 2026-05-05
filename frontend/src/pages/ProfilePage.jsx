import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Package, XCircle, CheckCircle, Clock, Truck, FileText, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/profile');
      return;
    }
    fetchMyOrders();
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/myorders');
      // Sort orders by newest first
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your purchase history');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrderHandler = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.put(`/orders/${orderId}/cancel`);
        fetchMyOrders(); // Refresh the list
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  // Helper to determine the current step for the timeline
  const getStepStatus = (orderStatus) => {
    if (orderStatus === 'Cancelled') return -1;
    if (orderStatus === 'Pending') return 1;
    if (orderStatus === 'Accepted' || orderStatus === 'Ready for Pickup' || orderStatus === 'Accepted by Driver') return 2;
    if (orderStatus === 'Out for Delivery') return 3;
    if (orderStatus === 'Delivered') return 4;
    return 1;
  };

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-500 font-medium">{userInfo?.name}</p>
          <p className="text-gray-400 text-sm">{userInfo?.email}</p>
        </div>
        <div className="bg-primary-50 p-4 rounded-full text-primary-600">
          <Package size={40} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase History & Tracking</h2>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse bg-white rounded-xl border border-gray-100">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const step = getStepStatus(order.status);
            const isCancelled = order.status === 'Cancelled';
            
            return (
              <div key={order._id} className={`bg-white rounded-xl shadow-sm border ${isCancelled ? 'border-red-200' : 'border-gray-200'} overflow-hidden`}>
                {/* Order Header */}
                <div className={`p-5 flex justify-between items-center border-b ${isCancelled ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div>
                    <span className="text-sm text-gray-500">Order ID</span>
                    <p className="font-bold text-gray-900">#{order._id.substring(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total</span>
                    <p className="font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</h3>
                    {order.orderItems.length > 0 ? (
                      <ul className="space-y-2">
                        {order.orderItems.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-gray-800">
                            <span>{item.qty}x {item.name}</span>
                            <span className="text-gray-500">${(item.qty * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="flex items-center gap-2 text-gray-600"><FileText size={16} /> Prescription Only Order</p>
                    )}
                  </div>

                  {/* Pharmacist Confirmation Message */}
                  {step >= 2 && !isCancelled && (
                    <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-100">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-bold">Pharmacist Confirmed!</p>
                        <p className="text-sm text-green-700">The chemist has reviewed and accepted your order. It is currently being processed.</p>
                      </div>
                    </div>
                  )}

                  {/* Tracking Timeline */}
                  {isCancelled ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-center gap-2 border border-red-200">
                      <XCircle size={24} />
                      <span className="font-bold text-lg">Order Cancelled</span>
                    </div>
                  ) : (
                    <div className="relative pt-2 pb-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Live Tracking</h3>
                      
                      <div className="flex justify-between items-center relative px-2">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded"></div>
                        
                        {/* Progress Bar Active */}
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded transition-all duration-500"
                          style={{ width: `${((step - 1) / 3) * 100}%` }}
                        ></div>

                        {/* Step 1: Placed */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Clock size={16} />
                          </div>
                          <span className={`text-xs font-semibold mt-2 absolute top-8 whitespace-nowrap ${step >= 1 ? 'text-primary-700' : 'text-gray-400'}`}>Placed</span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <CheckCircle size={16} />
                          </div>
                          <span className={`text-xs font-semibold mt-2 absolute top-8 whitespace-nowrap ${step >= 2 ? 'text-primary-700' : 'text-gray-400'}`}>Confirmed</span>
                        </div>

                        {/* Step 3: Dispatched */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Truck size={16} />
                          </div>
                          <span className={`text-xs font-semibold mt-2 absolute top-8 whitespace-nowrap ${step >= 3 ? 'text-primary-700' : 'text-gray-400'}`}>Dispatched</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step >= 4 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <CheckCircle size={16} />
                          </div>
                          <span className={`text-xs font-semibold mt-2 absolute top-8 whitespace-nowrap ${step >= 4 ? 'text-green-600' : 'text-gray-400'}`}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status === 'Pending' && (
                    <div className="mt-8 border-t border-gray-100 pt-4 flex justify-end">
                      <button 
                        onClick={() => cancelOrderHandler(order._id)}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
                      >
                        <XCircle size={16} /> Cancel Order
                      </button>
                    </div>
                  )}

                  {order.status === 'Ready for Pickup' && (
                    <div className="mt-8 border-t border-gray-100 pt-4 flex items-center gap-2 text-blue-600 text-sm font-semibold">
                      <AlertCircle size={16} /> Awaiting a delivery driver to pick up your order.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
