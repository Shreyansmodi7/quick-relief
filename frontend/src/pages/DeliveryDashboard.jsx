import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Truck, MapPin, CheckCircle, Package } from 'lucide-react';

const DeliveryDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'mine'
  
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'delivery') {
      navigate('/');
      return;
    }
    fetchData();
  }, [userInfo, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const availableRes = await api.get('/orders/deliveries/available');
      setAvailableOrders(availableRes.data);

      const mineRes = await api.get('/orders/deliveries/my-deliveries');
      setMyDeliveries(mineRes.data);
    } catch (error) {
      console.error('Error fetching delivery data', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (id) => {
    try {
      await api.put(`/orders/${id}/accept-delivery`);
      fetchData(); // refresh lists
      setActiveTab('mine');
    } catch (error) {
      console.error('Error accepting delivery', error);
      alert('Could not accept delivery. It may have been taken by another driver.');
    }
  };

  const updateDeliveryStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const markAsDelivered = async (id) => {
    try {
      await api.put(`/orders/${id}/deliver`);
      fetchData();
    } catch (error) {
      console.error('Error marking as delivered', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-500">Welcome, {userInfo.name} - Let's hit the road!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Available Pickups</p>
            <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">My Active Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{myDeliveries.filter(d => d.status !== 'Delivered').length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'available' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('available')}
        >
          Available Pickups
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'mine' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('mine')}
        >
          My Deliveries
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse">Loading orders...</div>
      ) : activeTab === 'available' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOrders.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              No new orders ready for pickup. Check back soon!
            </div>
          ) : (
            availableOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                  <span className="font-semibold text-gray-700">#{order._id.substring(0, 8)}</span>
                  <span className="text-lg font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-4 text-gray-600">
                    <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                    <p className="text-sm">
                      <span className="block font-semibold text-gray-900">{order.user?.name}</span>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 mb-4 border-t pt-4">
                    <span className="font-semibold text-gray-700">Items:</span> {order.orderItems.length > 0 ? order.orderItems.map(item => `${item.qty}x ${item.name}`).join(', ') : 'Prescription Order (See chemist)'}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button onClick={() => acceptDelivery(order._id)} className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors flex justify-center items-center gap-2">
                    <Truck size={18} /> Accept Delivery
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDeliveries.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              You haven't accepted any deliveries yet.
            </div>
          ) : (
            myDeliveries.map((order) => (
              <div key={order._id} className={`bg-white rounded-xl shadow-sm border ${order.status === 'Delivered' ? 'border-green-200' : 'border-blue-200'} overflow-hidden flex flex-col`}>
                <div className={`p-4 border-b flex justify-between items-center ${order.status === 'Delivered' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                  <span className="font-semibold text-gray-700">#{order._id.substring(0, 8)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-4 text-gray-600">
                    <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                    <p className="text-sm">
                      <span className="block font-semibold text-gray-900">{order.user?.name}</span>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                    </p>
                  </div>
                  
                  {order.status !== 'Delivered' && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Payment Method: <span className="font-semibold text-gray-900">{order.paymentMethod}</span></p>
                      <p className="text-sm text-gray-600">Amount to Collect: <span className="font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span></p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                  {order.status === 'Accepted by Driver' && (
                    <button onClick={() => updateDeliveryStatus(order._id, 'Out for Delivery')} className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded border border-blue-700 hover:bg-blue-700 transition-colors">
                      Start Route
                    </button>
                  )}
                  {order.status === 'Out for Delivery' && (
                    <button onClick={() => markAsDelivered(order._id)} className="flex-1 bg-green-600 text-white font-bold py-3 rounded border border-green-700 hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Mark Delivered
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <div className="flex-1 text-center py-2 text-green-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle size={18} /> Delivery Completed
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
