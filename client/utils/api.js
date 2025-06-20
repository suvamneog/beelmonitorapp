const BASE_URL = 'http://122.185.169.250/gisapi/public/api';

export const loginOfficer = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getProfile = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
};

export const getBeelList = async (token) => {
  try {
 const response = await fetch(`${BASE_URL}/beellist`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Beel List error:', error);
    throw error;
  }
};

export const addBeel = async (beelData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/beeladd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(beelData)
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {}; 
    } catch (e) {

      throw new Error(text || 'Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.message || text || 'Failed to add beel');
    }

    return data;
  } catch (error) {
    console.error('Add Beel error:', error);

    let errorMessage = error.message;
    if (errorMessage.includes('<html>') || errorMessage.includes('<!DOCTYPE')) {
      errorMessage = 'Server error occurred. Please try again later.';
    }
    throw new Error(errorMessage);
  }
};