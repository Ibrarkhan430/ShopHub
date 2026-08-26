// frontend/src/api/settings.js
import API from './axios';

// ─── Get Settings ──────────────────────────────────────
export const getSettings = async () => {
  const { data } = await API.get('/settings');
  return data;
};

// ─── Update Settings ──────────────────────────────────
export const updateSettings = async (settings) => {
  const { data } = await API.put('/settings', settings);
  return data;
};