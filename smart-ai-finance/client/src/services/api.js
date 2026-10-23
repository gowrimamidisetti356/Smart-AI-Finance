
const API_BASE_URL = `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api`;

/**
 * Helper to get the auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('finance_token') || '';
};

/**
 * Generic fetch wrapper with automatic JWT token attachment
 * and error handling
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  // Ensure the endpoint starts with exactly one slash.
  const normalizedEndpoint = `/${endpoint.replace(/^\/+/, '')}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.message ||
        data.error ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(
      `API Request failed for [${options.method || 'GET'} ${normalizedEndpoint}]:`,
      err.message
    );
    throw err;
  }
}

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------
export const authApi = {
  login: async (email, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  getMe: async () => {
    return await request('/auth/me');
  },
};

// ----------------------------------------------------
// TRANSACTIONS API
// ----------------------------------------------------
export const transactionsApi = {
  getAll: async () => {
    return await request('/transactions');
  },

  create: async (transactionData) => {
    return await request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  delete: async (id) => {
    return await request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// ANALYTICS API
// ----------------------------------------------------
export const analyticsApi = {
  getSummary: async () => {
    return await request('/analytics/summary');
  },

  getForecast: async () => {
    return await request('/analytics/forecast');
  },
};

// ----------------------------------------------------
// GOALS API
// ----------------------------------------------------
export const goalsApi = {
  getAll: async () => {
    return await request('/goals');
  },

  getProgress: async () => {
    return await request('/goals/progress');
  },

  create: async (goalData) => {
    return await request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  update: async (id, updateData) => {
    return await request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id) => {
    return await request(`/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------------------------------------------
// AI ASSISTANT API
// ----------------------------------------------------
export const aiApi = {
  chat: async (message) => {
    return await request('/ai-assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getHistory: async () => {
    return await request('/ai-assistant/history');
  },
};

// ----------------------------------------------------
// ACCOUNTS API
// ----------------------------------------------------
export const accountsApi = {
  getAll: async () => {
    return await request('/accounts');
  },

  create: async (accountData) => {
    return await request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  delete: async (id) => {
    return await request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  },
};
