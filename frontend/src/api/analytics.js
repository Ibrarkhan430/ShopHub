// frontend/src/api/analytics.js
import API from './axios';

// ─── Customer Analytics ──────────────────────────────────
export const fetchCustomerAnalytics = async () => {
  const { data } = await API.get('/analytics/customers');
  return data;
};

// ─── Dashboard Stats ─────────────────────────────────────
export const fetchDashboardStats = async (days = 7) => {
  const { data } = await API.get('/analytics/stats', { params: { days } });
  return data;
};

// ─── Sales Over Time ─────────────────────────────────────
export const fetchSalesOverTime = async (days = 7) => {
  const { data } = await API.get('/analytics/sales-over-time', { params: { days } });
  return data;
};

// ─── Orders Over Time ────────────────────────────────────
export const fetchOrdersOverTime = async (days = 7) => {
  const { data } = await API.get('/analytics/orders-over-time', { params: { days } });
  return data;
};

// ─── New Customers Over Time ─────────────────────────────
export const fetchNewCustomers = async (days = 7) => {
  const { data } = await API.get('/analytics/new-customers', { params: { days } });
  return data;
};

// ─── Sales By Category ──────────────────────────────────
export const fetchCategorySales = async () => {
  const { data } = await API.get('/analytics/categories');
  return data;
};

// ─── Top Products ────────────────────────────────────────
export const fetchTopProducts = async (limit = 5) => {
  const { data } = await API.get('/analytics/top-products', { params: { limit } });
  return data;
};

// ─── Top Customers ───────────────────────────────────────
export const fetchTopCustomers = async (limit = 5) => {
  const { data } = await API.get('/analytics/top-customers', { params: { limit } });
  return data;
};

// ─── Business Insights ──────────────────────────────────
export const fetchBusinessInsights = async (days = 7) => {
  const { data } = await API.get('/analytics/insights', { params: { days } });
  return data;
};

// ─── Customer Daily Sales ───────────────────────────────
export const fetchCustomerDailySales = async (customerId, days = 7) => {
  const { data } = await API.get(`/analytics/customers/${customerId}/daily`, {
    params: { days }
  });
  return data;
};

// ✅ REMOVED: fetchAllAnalytics - yeh route exist nahi karta
// Use individual endpoints instead