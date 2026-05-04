import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Package, MapPin, FileText, CheckCircle } from 'lucide-react';

const PharmacistDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'pharmacist') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [userInfo, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real app, pharmacists would fetch orders assigned to them or nearby orders.
      // We will fetch all orders assigned to this pharmacist.
      const { data } = await api.get('/orders/pharmacist');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders(); // refresh
    } catch (error) {
      console.error('Error updating order', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacist Dashboard</h1>
          <p className="text-gray-500">Welcome back, {userInfo.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Assigned</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-4 rounded-full text-yellow-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Approval</p>
            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'Pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'Delivered').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Assigned Orders</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No orders assigned to you yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Delivery Address</th>
                  <th className="p-4 font-semibold">Prescription</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">#{order._id.substring(0, 8)}</td>
                    <td className="p-4 text-sm text-gray-900">
                      {order.orderItems.map(item => `${item.qty}x ${item.name}`).join(', ')}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                    </td>
                    <td className="p-4 text-sm">
                      {order.prescriptionImage ? (
                        <a href={`http://localhost:5000${order.prescriptionImage}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                          <FileText size={16} /> View Rx
                        </a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {order.status === 'Pending' && (
                        <button onClick={() => updateStatus(order._id, 'Accepted')} className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 mr-2">Accept</button>
                      )}
                      {order.status === 'Accepted' && (
                        <button onClick={() => updateStatus(order._id, 'Out for Delivery')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Dispatch</button>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <button onClick={() => updateStatus(order._id, 'Delivered')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Mark Delivered</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
