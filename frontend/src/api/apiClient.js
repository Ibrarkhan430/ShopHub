import API from './axios';

// ─── Auth ──────────────────────────────────────────────────
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/password', data);

// ─── Addresses ────────────────────────────────────────────
export const addAddress = (data) => API.post('/auth/addresses', data);
export const updateAddress = (id, data) => API.put(`/auth/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/auth/addresses/${id}`);

// ─── Reviews ──────────────────────────────────────────────
export const fetchReviews = () => API.get('/reviews');
export const createReview = (data) => API.post('/reviews', data);
export const fetchProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const updateReviewStatus = (id, status) =>
  API.put(`/reviews/${id}/status`, { status });
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

// ─── Wishlist ─────────────────────────────────────────────
export const fetchWishlist = () => API.get('/wishlist');
export const addToWishlist = (productId) =>
  API.post('/wishlist', { productId });
export const removeFromWishlist = (productId) =>
  API.delete(`/wishlist/${productId}`);