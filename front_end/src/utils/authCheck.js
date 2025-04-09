export async function verifyToken(token) {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/user/me/', {
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
}

export async function checkAuth() {
  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return { isAuthorized: false, user: null };
    }

    const userData = await verifyToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { isAuthorized: true, user: userData };
  } catch (error) {
    // если токен невалидный, очищаем хранилище
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return { isAuthorized: false, user: null };
  }
}
