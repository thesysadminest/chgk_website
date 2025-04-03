import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {  // Только добавляем заголовок, если токен есть
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    // Если токена нет - не делаем ничего (перенаправление будет в компоненте)
    return config;
  },
  (error) => Promise.reject(error)
);  

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh_token: refreshToken });

        localStorage.setItem("access_token", res.data.access);
        error.config.headers["Authorization"] = `Bearer ${res.data.access}`;

        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error("������ ���������� ������:", refreshError);
        localStorage.clear();
        window.location.href = "/authorization";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
