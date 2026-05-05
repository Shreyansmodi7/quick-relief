import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: localStorage.getItem('paymentMethod') ? JSON.parse(localStorage.getItem('paymentMethod')) : 'Credit Card',
  prescriptionImage: localStorage.getItem('prescriptionImage') ? JSON.parse(localStorage.getItem('prescriptionImage')) : null,
};

const updateCart = (state) => {
  localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.medicine === item.medicine);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.medicine === existItem.medicine ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.medicine !== action.payload);
      updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },
    savePrescriptionImage: (state, action) => {
      state.prescriptionImage = action.payload;
      localStorage.setItem('prescriptionImage', JSON.stringify(action.payload));
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      state.prescriptionImage = null;
      localStorage.removeItem('prescriptionImage');
      updateCart(state);
    },
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, savePrescriptionImage, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;
