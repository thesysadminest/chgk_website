import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../components/axiosInstance";

const GameRedirect = () => {
  const { id } = useParams(); // Изменено с packId на id, чтобы соответствовать Route path="/game/:id"
  const navigate = useNavigate();

  useEffect(() => {
    const startGame = async () => {
      try {
        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
          console.error("Токен отсутствует. Перенаправляем на авторизацию.");
          navigate("/authorization");
          return; // Добавлен return для прекращения выполнения функции
        }

        const response = await axiosInstance.get(`http://127.0.0.1:8000/api/game/${id}/start/`, {
          headers: {
            "Authorization": `Bearer ${access_token}` // Используем уже полученный token
          }
        });

        const firstQuestionId = response.data?.first_question_id;
        if (firstQuestionId) {
          navigate(`/game/${id}/${firstQuestionId}`); // Перенаправляем на страницу игры
        } else {
          console.error("Ошибка: Нет вопросов в паке!");
          navigate("/packs");
        }
      } catch (error) {
        console.error("Ошибка загрузки первого вопроса:", error);
        navigate("/packs");
      }
    };

    startGame();
  }, [id, navigate]);

  return <p>Загрузка игры...</p>;
};

export default GameRedirect;