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

    return data;
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

export const getAllSurveys = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/beelsurvey`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch surveys');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

export const submitSurvey = async (surveyData, token) => {
  try {
    const payload = {
      ...surveyData,
      land_area: surveyData.land_area !== undefined ? String(surveyData.land_area) : '',
      water_depth_monsoon: surveyData.water_depth_monsoon !== undefined ? String(surveyData.water_depth_monsoon) : '',
      water_depth_summer: surveyData.water_depth_summer !== undefined ? String(surveyData.water_depth_summer) : '',
      distance_hq: surveyData.distance_hq !== undefined ? String(surveyData.distance_hq) : '',
      no_village: surveyData.no_village !== undefined ? String(surveyData.no_village) : '',
      no_household: surveyData.no_household !== undefined ? String(surveyData.no_household) : '',
      nos_active_fishermen: surveyData.nos_active_fishermen !== undefined ? String(surveyData.nos_active_fishermen) : '',
      district_id: surveyData.district_id !== undefined ? String(surveyData.district_id) : '',
      block_id: surveyData.block_id !== undefined ? String(surveyData.block_id) : ''
    };

    const response = await fetch(`${BASE_URL}/beelsurvey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      if (text.startsWith('<!DOCTYPE html') || text.startsWith('<html')) {
        throw new Error('Server returned HTML response. Please check the API endpoint.');
      }
      throw new Error(text || 'Invalid server response');
    }

    if (!response.ok) {
      let errorMessage = 'Validation failed';
      
      if (data.errors) {
        errorMessage = Object.entries(data.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      } else if (data.message) {
        errorMessage = data.message;
        if (data.exception) {
          errorMessage += ` (${data.exception})`;
        }
      } else if (text) {
        errorMessage = text.length > 100 ? 'Server error occurred' : text;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Submission error:', {
      message: error.message,
      stack: error.stack,
      surveyData: surveyData
    });
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error.message.includes('HTML response')) {
      throw new Error('Server error. Please contact support.');
    }
    
    throw error;
  }
};

export const updateSurvey = async (surveyData, token) => {
  try {
    const payload = {
      ...surveyData,
      land_area: surveyData.land_area !== undefined ? String(surveyData.land_area) : '',
      water_depth_monsoon: surveyData.water_depth_monsoon !== undefined ? String(surveyData.water_depth_monsoon) : '',
      water_depth_summer: surveyData.water_depth_summer !== undefined ? String(surveyData.water_depth_summer) : '',
      distance_hq: surveyData.distance_hq !== undefined ? String(surveyData.distance_hq) : '',
      no_village: surveyData.no_village !== undefined ? String(surveyData.no_village) : '',
      no_household: surveyData.no_household !== undefined ? String(surveyData.no_household) : '',
      nos_active_fishermen: surveyData.nos_active_fishermen !== undefined ? String(surveyData.nos_active_fishermen) : '',
      district_id: surveyData.district_id !== undefined ? String(surveyData.district_id) : '',
      block_id: surveyData.block_id !== undefined ? String(surveyData.block_id) : ''
    };

    const response = await fetch(`${BASE_URL}/beelsurvey/${surveyData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      if (text.startsWith('<!DOCTYPE html') || text.startsWith('<html')) {
        throw new Error('Server returned HTML response. Please check the API endpoint.');
      }
      throw new Error(text || 'Invalid server response');
    }

    if (!response.ok) {
      let errorMessage = 'Validation failed';
      
      if (data.errors) {
        errorMessage = Object.entries(data.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
      } else if (data.message) {
        errorMessage = data.message;
        if (data.exception) {
          errorMessage += ` (${data.exception})`;
        }
      } else if (text) {
        errorMessage = text.length > 100 ? 'Server error occurred' : text;
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Update error:', {
      message: error.message,
      stack: error.stack,
      surveyData: surveyData
    });
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error.message.includes('HTML response')) {
      throw new Error('Server error. Please contact support.');
    }
    
    throw error;
  }
};

export const uploadImage = async (uri, name, type, token) => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    name,
    type: type || 'image/jpeg'
  });

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload image');
  }
  return data.url; 
};