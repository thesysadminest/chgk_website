import API_BASE_URL from '../config';
export const setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

/**
 * Получает access токен из localStorage
 * @returns {string|null} Access токен или null, если не найден
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Получает refresh токен из localStorage
 * @returns {string|null} Refresh токен или null, если не найден
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * Удаляет токены аутентификации из localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Проверяет, авторизован ли пользователь
 * @returns {boolean} true если пользователь авторизован, иначе false
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Сохраняет данные пользователя в localStorage
 * @param {Object} userData - Данные пользователя
 */
export const setUserData = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * Получает данные пользователя из localStorage
 * @returns {Object|null} Данные пользователя или null, если не найдены
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Обновляет access токен с помощью refresh токена
 * @param {string} refreshToken - Refresh токен
 * @returns {Promise<Object>} Объект с новыми токенами
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
 * Проверяет валидность токена на сервере
 * @param {string} token - Токен для проверки
 * @returns {Promise<Object>} Данные пользователя, если токен валиден
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
 * Проверяет авторизацию пользователя
 * @returns {Promise<Object>} Объект с флагом авторизации и данными пользователя
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
    // Если токен невалидный, очищаем хранилище
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
