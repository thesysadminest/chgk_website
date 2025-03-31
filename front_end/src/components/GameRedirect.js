import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../components/axiosInstance";

const GameRedirect = () => {
  const { packId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startGame = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("Токен отсутствует. Перенаправляем на авторизацию.");
          navigate("/authorization");
        }

        const response = await axiosInstance.get(`http://127.0.0.1:8000/api/game/${packId}/start/`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
          }
        );
        console.log("Ответ API:", response.data);  // 🔍 Проверяем ответ от сервера

        const firstQuestionId = response.data?.first_question_id;
        if (firstQuestionId) {
          navigate(`/game/${packId}/${firstQuestionId}`);
        } else {
          console.error("Ошибка: Нет вопросов в паке!");
          navigate("/packs");  // Если нет вопросов, возвращаем на выбор квизов
        }
      } catch (error) {
        console.error("Ошибка загрузки первого вопроса:", error);
        navigate("/packs");  // Если сервер не отвечает, возвращаем на выбор квизов
      }
    };

    startGame();
  }, [packId, navigate]);

  return <p>Загрузка игры...</p>;
};

export default GameRedirect;
