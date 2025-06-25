const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'http://82.202.139.37';

export default API_BASE_URL;
