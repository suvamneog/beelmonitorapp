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

export const getBeelStats = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const data = json.data;

    console.log('Total Beels:', data.total_beels);
    console.log('Total Water Area:', data.total_water_area);
    console.log('Total Sanction Amount:', data.total_sanction_amount);
    console.log('Total Production:', data.total_production);
    console.log('Total PM:', data.total_pm);
    console.log('Total FP:', data.total_fp);
    console.log('Average FP:', data.avg_fp);

    return data; // return only the useful `data` object
  } catch (error) {
    console.error('Beel Stats error:', error);
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

export const updateBeel = async (beelData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/beelupdate`, {
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
      throw new Error(data.message || text || 'Failed to update beel');
    }

    return data;
  } catch (error) {
    console.error('Update Beel error:', error);
    let errorMessage = error.message;
    if (errorMessage.includes('<html>') || errorMessage.includes('<!DOCTYPE')) {
      errorMessage = 'Server error occurred. Please try again later.';
    }
    throw new Error(errorMessage);
  }
};

export const getMasterData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/masterdata`, {
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
    console.error('Master data error:', error);
    throw error;
  }
};

export const submitSurvey = async (surveyData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(surveyData)
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(text || 'Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.message || text || 'Failed to submit survey');
    }

    return data;
  } catch (error) {
    console.error('Survey submission error:', error);
    let errorMessage = error.message;
    if (errorMessage.includes('<html>') || errorMessage.includes('<!DOCTYPE')) {
      errorMessage = 'Server error occurred. Please try again later.';
    }
    throw new Error(errorMessage);
  }
};
