const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// API request helper with retry mechanism
const apiRequest = async (endpoint: string, options: RequestInit = {}, retries = 2) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`Attempting to fetch: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || `API request failed with status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${endpoint}, ${retries} attempts left`);
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest(endpoint, options, retries - 1);
    }
    
    console.error('API request failed:', error);
    throw new Error(`Network error or server not responding. Please check if the server is running at ${API_BASE_URL}`);
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  register: async (userData: any) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  },
};

// Meals API
export const mealsAPI = {
  getAll: async (filters?: { type?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.date) params.append('date', filters.date);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/meals${query}`);
  },

  create: async (mealData: any) => {
    return apiRequest('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  update: async (id: string, mealData: any) => {
    return apiRequest(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/meals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Feedback API
export const feedbackAPI = {
  getAll: async (filters?: { type?: string; date?: string; rating?: string; student_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.rating) params.append('rating', filters.rating);
    if (filters?.student_id) params.append('student_id', filters.student_id);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/feedback${query}`);
  },

  submit: async (feedbackData: any) => {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  getAnalytics: async () => {
    return apiRequest('/feedback/analytics');
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };

