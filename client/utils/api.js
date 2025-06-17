// client/utils/api.js

export const loginOfficer = async (email, password) => {
  if (email === 'admin@gmail.com' && password === 'admin@123') {
    return {
      success: true,
      token: 'mock-token-123',
      user: {
        id: 1,
        name: 'Arias Society',
        email: 'admin@gmail.com',
        designation: 'SPD'
      }
    };
  } else {
    return { success: false, message: 'Invalid credentials' };
  }
};

export const getProfile = async (userId, token) => {
  return {
    data: {
      id: userId,
      name: 'Arias Society',
      email: 'admin@gmail.com',
      designation: 'SPD'
    }
  };
};

export const getBeelList = async (token) => {
  return {
    data: [
      { id: 1, name: 'Beel A', district_name: 'District 1', water_area: 150 },
      { id: 2, name: 'Beel B', district_name: 'District 2', water_area: 200 },
    ]
  };
};