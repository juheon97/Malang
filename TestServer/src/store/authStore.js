// src/store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  username: localStorage.getItem('username') || '',
  
  login: (username) => set(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    return { isLoggedIn: true, username };
  }),
  
  logout: () => set(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    return { isLoggedIn: false, username: '' };
  })
}));

export default useAuthStore;
