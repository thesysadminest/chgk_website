import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 🔧 добавить
import axiosInstance from "../components/axiosInstance";

const GameRedirect = () => {
  const { pack_id } = useParams();
  const navigate = useNavigate();
  const hasRedirected = useRef(false); // 🔒

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    const startGame = async () => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axiosInstance.get(`/game/${pack_id}/start/`);
        const firstQuestionId = response.data?.first_question_id;

        if (firstQuestionId) {
          navigate(`/game/${pack_id}/questions/${firstQuestionId}`);
        } else {
          navigate("/packs");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          navigate("/packs");
        }
      }
    };

    startGame();
  }, [pack_id, navigate]);

  return <p>Загрузка игры...</p>;
};

export default GameRedirect;
