import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthConfig = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return {
      headers: {
        Authorization: userInfo?.token ? `Bearer ${userInfo.token}` : '',
      },
    };
  } catch (error) {
    return {
      headers: {
        Authorization: '',
      },
    };
  }
};

export const buyNow = async (data) => {
  const { data: order } = await axios.post(`${API_URL}/orders/buy-now`, data, getAuthConfig());
  return order;
};

export const getMyOrders = async () => {
  const { data } = await axios.get(`${API_URL}/orders/myorders`, getAuthConfig());
  return data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, getAuthConfig());
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await axios.post(`${API_URL}/orders`, orderData, getAuthConfig());
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await axios.get(`${API_URL}/orders/${orderId}`, getAuthConfig());
  return data;
};

export const getAllOrders = async () => {
  const { data } = await axios.get(`${API_URL}/orders`, getAuthConfig());
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await axios.put(
    `${API_URL}/orders/${orderId}/status`, 
    { status }, 
    getAuthConfig()
  );
  return data;
};

export const payOrder = async (orderId) => {
  const { data } = await axios.put(
    `${API_URL}/orders/${orderId}/pay`, 
    {}, 
    getAuthConfig()
  );
  return data;
};