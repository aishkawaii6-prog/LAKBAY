const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Guard: if server returned HTML (e.g. error page), don't call .json()
    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    let data
    if (isJson) {
      try { data = await response.json() } catch { data = null }
    } else {
      data = { message: await response.text() }
    }

    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data;
  } catch (error) {
    // If API fails, log error but don't crash - frontend can work with localStorage
    console.warn(`API call to ${endpoint} failed:`, error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  adminLogin: (credentials) => apiRequest('/auth/admin/login', 'POST', credentials),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', 'POST', { email }),
  verifyResetToken: (data) => apiRequest('/auth/verify-reset-token', 'POST', data),
  resetPassword: (data) => apiRequest('/auth/reset-password', 'POST', data),
  getMe: (token) => apiRequest('/auth/me', 'GET', null, token),
  updateProfile: (token, userData) => apiRequest('/auth/profile', 'PUT', userData, token),
  changePassword: (token, passwordData) => apiRequest('/auth/change-password', 'POST', passwordData, token),
  getUsers: (token) => apiRequest('/auth/users', 'GET', null, token),
  logout: (token) => apiRequest('/auth/logout', 'POST', null, token),
};

// Destinations API
export const destinationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/destinations${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id) => apiRequest(`/destinations/${id}`),
  create: (token, data) => apiRequest('/destinations', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/destinations/${id}`, 'PUT', data, token),
  delete: (token, id) => apiRequest(`/destinations/${id}`, 'DELETE', null, token),
  rate: (token, id, rating) => apiRequest(`/destinations/${id}/rate`, 'POST', { rating }, token),
  getOverviewStats: () => apiRequest('/feedback/overview-stats'),
};

// News API
export const newsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/news${queryString ? `?${queryString}` : ''}`);
  },
  getFeatured: () => apiRequest('/news?featured=true'),
  getOne: (id) => apiRequest(`/news/${id}`),
  create: (token, data) => apiRequest('/news', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/news/${id}`, 'PUT', data, token),
  delete: (token, id) => apiRequest(`/news/${id}`, 'DELETE', null, token),
  getAllAdmin: (token) => apiRequest('/news/all', 'GET', null, token),
};

// Feedback API
export const feedbackAPI = {
  overviewStats: () => apiRequest('/feedback/overview-stats'),
  overviewStatsByDestination: () => apiRequest('/feedback/destination-stats'),
  getAll: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/feedback${queryString ? `?${queryString}` : ''}`, 'GET', null, token);
  },
  getByDestination: (destinationId) => apiRequest(`/feedback/destination/${destinationId}`),
  create: (token, data) => apiRequest('/feedback', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/feedback/${id}`, 'PUT', data, token),
  delete: (token, id) => apiRequest(`/feedback/${id}`, 'DELETE', null, token),
  incrementHelpful: (token, id) => apiRequest(`/feedback/helpful/${id}`, 'PUT', null, token),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (token) => apiRequest('/activity-logs', 'GET', null, token),
};

// Messages API
export const messagesAPI = {
  send: (data) => apiRequest('/messages', 'POST', data),
  getAll: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/messages${queryString ? `?${queryString}` : ''}`, 'GET', null, token);
  },
  getOne: (token, id) => apiRequest(`/messages/${id}`, 'GET', null, token),
  update: (token, id, data) => apiRequest(`/messages/${id}`, 'PUT', data, token),
  delete: (token, id) => apiRequest(`/messages/${id}`, 'DELETE', null, token),
  getStats: (token) => apiRequest('/messages/stats/summary', 'GET', null, token),
};

// Gallery API
export const galleryAPI = {
  getAll: () => apiRequest('/gallery'),
  getByDestination: (destinationId) => apiRequest(`/gallery/destination/${destinationId}`),
  getFeatured: (limit) => apiRequest(`/gallery/featured${limit ? `?limit=${limit}` : ''}`),
  create: (token, data) => apiRequest('/gallery', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/gallery/${id}`, 'PUT', data, token),
  remove: (token, id) => apiRequest(`/gallery/${id}`, 'DELETE', null, token),
};

// Bookmarks API
export const bookmarksAPI = {
  getUserBookmarks: (userId) => apiRequest(`/bookmarks/${userId}`),
  isBookmarked: (userId, destinationId) => apiRequest(`/bookmarks/check/${userId}/${destinationId}`),
  add: (token, data) => apiRequest('/bookmarks', 'POST', data, token),
  remove: (userId, destinationId) => apiRequest(`/bookmarks/${userId}/${destinationId}`, 'DELETE', null, token),
  getCount: (destinationId) => apiRequest(`/bookmarks/count/${destinationId}`),
};

// Activities (= Events) API
export const activitiesAPI = {
  getAll: () => apiRequest('/activities'),
  getById: (id) => apiRequest(`/activities/${id}`),
  getByCategory: (category) => apiRequest(`/activities/category/${category}`),
  create: (token, data) => apiRequest('/activities', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/activities/${id}`, 'PUT', data, token),
  remove: (token, id) => apiRequest(`/activities/${id}`, 'DELETE', null, token),
};

// Notifications API
export const notificationAPI = {
  getAll: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${queryString ? `?${queryString}` : ''}`, 'GET', null, token);
  },
  getUnreadCount: (token) => apiRequest('/notifications/stats/summary', 'GET', null, token),
  getOne: (token, id) => apiRequest(`/notifications/${id}`, 'GET', null, token),
  create: (token, data) => apiRequest('/notifications', 'POST', data, token),
  update: (token, id, data) => apiRequest(`/notifications/${id}`, 'PUT', data, token),
  markRead: (token, id) => apiRequest(`/notifications/${id}/read`, 'PUT', null, token),
  markAllRead: (token) => apiRequest('/notifications/read-all', 'PUT', null, token),
  delete: (token, id) => apiRequest(`/notifications/${id}`, 'DELETE', null, token),
};

export default API_BASE_URL;
