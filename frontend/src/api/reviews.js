import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Auth Config Helper ───────────────────────────────────
const getAuthConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = userInfo?.token;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// ─── Get all reviews (Admin only) ────────────────────────
export const getAllReviews = async (params = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reviews`, {
      ...getAuthConfig(),
      params,
    });
    return data;
  } catch (error) {
    // ✅ Silent fail for non-admin users (403/401)
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn('⚠️ Reviews not accessible (user not admin)');
      return { reviews: [], total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    throw error;
  }
};

// ─── Update review status ────────────────────────────────
export const updateReviewStatus = async (reviewId, status) => {
  const { data } = await axios.put(
    `${API_URL}/reviews/${reviewId}/status`,
    { status },
    getAuthConfig()
  );
  return data;
};

// ─── Delete review ───────────────────────────────────────
export const deleteReview = async (reviewId) => {
  const { data } = await axios.delete(
    `${API_URL}/reviews/${reviewId}`,
    getAuthConfig()
  );
  return data;
};

// ─── Get reviews by product (Public) ─────────────────────
export const getProductReviews = async (productId) => {
  const { data } = await axios.get(`${API_URL}/reviews/product/${productId}`);
  return data;
};

// ─── Create review (Logged in user) ──────────────────────
export const createReview = async (reviewData) => {
  const { data } = await axios.post(
    `${API_URL}/reviews`,
    reviewData,
    getAuthConfig()
  );
  return data;
};