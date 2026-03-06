# Frontend Integration Guide

Complete guide for integrating Google OAuth2 authentication with your frontend application.

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [React Integration](#react-integration)
3. [Vue.js Integration](#vuejs-integration)
4. [Angular Integration](#angular-integration)
5. [Vanilla JavaScript](#vanilla-javascript)
6. [Token Management](#token-management)
7. [Error Handling](#error-handling)

## Authentication Flow

```
┌─────────┐      ┌──────────┐      ┌────────┐      ┌────────────┐
│Frontend │      │ Backend  │      │ Google │      │  Database  │
└────┬────┘      └────┬─────┘      └───┬────┘      └─────┬──────┘
     │                │                 │                  │
     │ 1. Get Auth URL│                 │                  │
     ├───────────────>│                 │                  │
     │ <──────────────┤                 │                  │
     │                │                 │                  │
     │ 2. Redirect to Google            │                  │
     ├─────────────────────────────────>│                  │
     │                │                 │                  │
     │ 3. User authenticates            │                  │
     │                │                 │                  │
     │ 4. Redirect with code            │                  │
     │<─────────────────────────────────┤                  │
     │                │                 │                  │
     │ 5. Send code   │                 │                  │
     ├───────────────>│                 │                  │
     │                │ 6. Exchange code│                  │
     │                ├────────────────>│                  │
     │                │<────────────────┤                  │
     │                │                 │                  │
     │                │ 7. Get user info│                  │
     │                ├────────────────>│                  │
     │                │<────────────────┤                  │
     │                │                 │                  │
     │                │ 8. Create/Update user             │
     │                ├──────────────────────────────────>│
     │                │<───────────────────────────────────┤
     │                │                 │                  │
     │ 9. Return JWT  │                 │                  │
     │<───────────────┤                 │                  │
     │                │                 │                  │
```

## React Integration

### Using React Hooks

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  profile_picture: string;
  is_active: boolean;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Try to refresh token
        await refreshToken();
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/login`);
      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (err) {
      setError('Failed to initiate login');
      console.error(err);
    }
  };

  const handleCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      setUser(data.user);
      return data.user;
    } catch (err) {
      setError('Authentication failed');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refresh })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);

      // Retry getting user info
      await checkAuth();
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    handleCallback,
    logout,
    isAuthenticated: !!user
  };
};
```

### React Components

```typescript
// components/LoginButton.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginButton: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <button
      onClick={login}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Loading...' : 'Sign in with Google'}
    </button>
  );
};

// components/CallbackPage.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      handleCallback(code)
        .then(() => {
          navigate('/dashboard');
        })
        .catch(() => {
          navigate('/login?error=auth_failed');
        });
    }
  }, [searchParams, handleCallback, navigate]);

  return <div>Authenticating...</div>;
};

// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="user-profile">
      <img src={user.profile_picture} alt={user.full_name} />
      <h3>{user.full_name}</h3>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### API Client with Auto Token Refresh

```typescript
// utils/apiClient.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  private async getAccessToken(): Promise<string | null> {
    return localStorage.getItem('access_token');
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    } catch (error) {
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    let token = await this.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // If unauthorized, try refreshing token
    if (response.status === 401) {
      token = await this.refreshAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers
        });
      }
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();
```

## Vue.js Integration

```javascript
// composables/useAuth.js
import { ref, computed, onMounted } from 'vue';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const useAuth = () => {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      loading.value = false;
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        user.value = await response.json();
      } else if (response.status === 401) {
        await refreshToken();
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      logout();
    } finally {
      loading.value = false;
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/login`);
      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (err) {
      error.value = 'Failed to initiate login';
      console.error(err);
    }
  };

  const handleCallback = async (code) => {
    loading.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      user.value = data.user;

      return data.user;
    } catch (err) {
      error.value = 'Authentication failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      logout();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh })
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      await checkAuth();
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }

    localStorage.clear();
    user.value = null;
  };

  onMounted(() => {
    checkAuth();
  });

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    handleCallback,
    logout
  };
};
```

## Token Management Best Practices

### 1. Secure Storage

```javascript
// ❌ NOT RECOMMENDED (vulnerable to XSS)
localStorage.setItem('access_token', token);

// ✅ RECOMMENDED (use httpOnly cookies in production)
// Backend should set httpOnly cookies instead
```

### 2. Token Refresh Strategy

```javascript
// Axios interceptor for automatic token refresh
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('/auth/refresh', {
          refresh_token: refreshToken
        });

        localStorage.setItem('access_token', data.access_token);
        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Error Handling

```typescript
interface ApiError {
  detail: string;
  errors?: Array<{
    field: string;
    message: string;
    type: string;
  }>;
}

const handleApiError = (error: any): string => {
  if (error.response) {
    const apiError: ApiError = error.response.data;

    if (apiError.errors) {
      return apiError.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    }

    return apiError.detail || 'An error occurred';
  }

  if (error.request) {
    return 'No response from server. Please check your connection.';
  }

  return error.message || 'An unexpected error occurred';
};
```

## Complete Example App

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Testing Authentication

```typescript
// __tests__/auth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize as unauthenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login flow', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      result.current.login();
    });

    // Verify redirect happens (mock window.location.href)
  });
});
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Store tokens in httpOnly cookies (not localStorage)
- [ ] Implement CSRF protection
- [ ] Validate tokens on every request
- [ ] Implement token refresh logic
- [ ] Handle token expiration gracefully
- [ ] Clear tokens on logout
- [ ] Implement rate limiting
- [ ] Validate redirect URIs
- [ ] Use state parameter for CSRF protection
