import { api, setAuthToken } from '../api';

export const authService = {
  async register(data: { email: string; password: string; full_name?: string; role?: string }) {
    const response = await api.post('auth/register', data);

    return response.data;
  },

  async login(email: string, password: string) {
    // FastAPI backend uses OAuth2PasswordRequestForm: username + password as application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('auth/login', formData, {

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });




    if (response.data?.access_token) {
      // Extract role from response.user.role (primary), fallback to response.role
      const rawRole = response.data?.user?.role || response.data?.role || 'user';

      // Normalize: backend uses "user", frontend expectss "citizen"
      const role = rawRole === 'user' ? 'citizen' : rawRole;




      // Store token and normalized role in localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', role);

      // Also persist in cookies so Next.js middleware can read them server-side
      document.cookie = `token=${response.data.access_token}; path=/; SameSite=Lax`;
      document.cookie = `role=${role}; path=/; SameSite=Lax`;

      setAuthToken(response.data.access_token, role);
    }

    return response.data;
  },

  async logout() {
    // Clear cookies so middleware re-evaluates
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
