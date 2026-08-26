// frontend/src/api/products.js
import API from './axios';

export const fetchProducts = async (params = {}) => {
  try {
    const { data } = await API.get('/products', { params });
    
    // ✅ Handle both response formats
    if (data && typeof data === 'object') {
      // If backend returns { products: [], total, page, pages }
      if (data.products) {
        return data;
      }
      
      // If backend returns direct array
      if (Array.isArray(data)) {
        return { products: data, total: data.length, page: 1, pages: 1 };
      }
      
      // If backend returns something else
      return { products: data, total: 0, page: 1, pages: 1 };
    }
    
    // Fallback
    return { products: [], total: 0, page: 1, pages: 1 };
    
  } catch (error) {
    console.error('❌ Fetch products error:', error.message);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await API.post('/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await API.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`);
  return data;
};