import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, MapPin, Package } from 'lucide-react';
import api from '../utils/api';

const DeliveryOrdersPage = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'delivery') {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const [availableRes, myRes] = await Promise.all([
          api.get('/orders/deliveries/available'),
          api.get('/orders/deliveries/my-deliveries'),
        ]);
        setAvailableOrders(availableRes.data || []);
        setMyDeliveries(myRes.data || []);
      } catch (error) {
        console.error('Failed to load delivery orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, userInfo]);

  const allOrders = [...availableOrders, ...myDeliveries];
  const uniqueOrders = allOrders.filter(
    (order, index, self) => index === self.findIndex((o) => o._id === order._id)
  );

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Orders</h1>
        <p className="text-gray-500">
          View pharmacist details and customer delivery addresses.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse">Loading orders...</div>
      ) : uniqueOrders.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          No delivery orders found right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uniqueOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-700">#{order._id.substring(0, 8)}</span>
                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                  {order.status}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      From Pharmacist
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.pharmacist?.name || 'Assigned pharmacist'}
                    </p>
                    {order.pharmacist?.email && (
                      <p className="text-sm text-gray-600">{order.pharmacist.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer Delivery Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.user?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order Items
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.orderItems?.length
                        ? order.orderItems.map((item) => `${item.qty}x ${item.name}`).join(', ')
                        : 'Prescription order'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryOrdersPage;
