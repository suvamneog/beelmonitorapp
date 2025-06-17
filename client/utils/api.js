// utils/api.js
const BASE_URL = 'http://122.185.169.250/gisapi/public/api';

export const loginOfficer = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      return { 
        success: true, 
        token: data.access_token,
        user: data.user
      };
    } else {
      return { success: false, message: data.message || 'Invalid credentials' };
    }
  } catch (err) {
    console.error('Login API error:', err);
    return { success: false, message: 'Network error' };
  }
};

export const getProfile = async (userId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/profile/${userId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Profile API error:', err);
    throw err;
  }
};

export const getBeelList = async (token) => {
  try {
    const res = await fetch('http://122.185.169.250/api/beellist', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Beel List API error:', err);
    throw err;
  }
};