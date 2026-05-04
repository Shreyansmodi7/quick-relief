import Order from '../models/Order.js';
import Pharmacy from '../models/Pharmacy.js';

// Helper function to calculate distance using Haversine formula
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    prescriptionImage
  } = req.body;

  if (orderItems && orderItems.length === 0 && !prescriptionImage) {
    res.status(400).json({ message: 'No order items and no prescription provided' });
    return;
  }

  // Find nearest pharmacy
  let assignedPharmacist = null;
  if (shippingAddress.lat && shippingAddress.lng) {
    const pharmacies = await Pharmacy.find({ isApproved: true });
    let minDistance = Infinity;
    
    pharmacies.forEach(pharmacy => {
      const distance = getDistanceFromLatLonInKm(
        shippingAddress.lat,
        shippingAddress.lng,
        pharmacy.location.lat,
        pharmacy.location.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        assignedPharmacist = pharmacy.pharmacist;
      }
    });
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    pharmacist: assignedPharmacist,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    prescriptionImage
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Pharmacist or Admin
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    if (order.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get orders assigned to a pharmacist
// @route   GET /api/orders/pharmacist
// @access  Private/Pharmacist
export const getPharmacistOrders = async (req, res) => {
  const orders = await Order.find({ pharmacist: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};
