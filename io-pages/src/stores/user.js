import { defineStore } from 'pinia';
import api from '../utils/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager' || state.user?.role === 'admin',
    canAccessAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'manager',
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/auth/login', { username, password });
        this.token = response.token;
        this.user = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async fetchUserInfo() {
      try {
        const user = await api.get('/auth/me');
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } catch (error) {
        throw error;
      }
    },
  },
});



