import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api'
});

// Customers
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerStats = () => api.get('/customers/stats');
export const getCustomer = (id) => api.get(`/customers/${id}`);

// Segments
export const getSegments = () => api.get('/segments');
export const createSegment = (data) => api.post('/segments', data);
export const previewSegment = (data) => api.post('/segments/preview', data);
export const deleteSegment = (id) => api.delete(`/segments/${id}`);
export const getSegmentPreview = (id) => api.get(`/segments/${id}/preview`);

// Campaigns — cache-busted so refresh always gets fresh data
export const getCampaigns = () => api.get('/campaigns', { params: { _t: Date.now() } });
export const createCampaign = (data) => api.post('/campaigns', data);
export const getCampaign = (id) => api.get(`/campaigns/${id}`, { params: { _t: Date.now() } });
export const sendCampaign = (id) => api.post(`/campaigns/${id}/send`);
export const getCampaignStats = (id) => api.get(`/campaigns/${id}/stats`, { params: { _t: Date.now() } });

// AI
export const suggestSegment = (description) => api.post('/ai/suggest-segment', { description });
export const draftMessage = (data) => api.post('/ai/draft-message', data);

export default api;