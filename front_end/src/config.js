const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? `http://127.0.0.1:8000`
  : `http://82.202.139.37`;

export default API_BASE_URL;
