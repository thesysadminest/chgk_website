import API_BASE_URL from '../config';
export const setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

/**
 * �������� access ����� �� localStorage
 * @returns {string|null} Access ����� ��� null, ���� �� ������
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * �������� refresh ����� �� localStorage
 * @returns {string|null} Refresh ����� ��� null, ���� �� ������
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * ������� ������ �������������� �� localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * ���������, ����������� �� ������������
 * @returns {boolean} true ���� ������������ �����������, ����� false
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * ��������� ������ ������������ � localStorage
 * @param {Object} userData - ������ ������������
 */
export const setUserData = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * �������� ������ ������������ �� localStorage
 * @returns {Object|null} ������ ������������ ��� null, ���� �� �������
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * ��������� access ����� � ������� refresh ������
 * @param {string} refreshToken - Refresh �����
 * @returns {Promise<Object>} ������ � ������ ��������
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch('${API_BASE_URL}/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * ��������� ���������� ������ �� �������
 * @param {string} token - ����� ��� ��������
 * @returns {Promise<Object>} ������ ������������, ���� ����� �������
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch('${API_BASE_URL}/api/user/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * ��������� ����������� ������������
 * @returns {Promise<Object>} ������ � ������ ����������� � ������� ������������
 */
export const checkAuth = async () => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return { isAuthorized: false, user: null };
    }

    const userData = await verifyToken(accessToken);
    setUserData(userData);
    
    return { isAuthorized: true, user: userData };
  } catch (error) {
    // ���� ����� ����������, ������� ���������
    clearAuthTokens();
    return { isAuthorized: false, user: null };
  }
};

export const cacheVote = (messageId, vote) => {
  const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
  votes[messageId] = vote;
  localStorage.setItem('user_votes', JSON.stringify(votes));
  return;
};

export const getCachedVote = (messageId) => {
  const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
  return votes[messageId] || 0;
};
