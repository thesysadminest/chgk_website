import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../components/axiosInstance";

const GameRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startGame = async () => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        navigate("/login");
        return;
      }
  
      try {
        const response = await axiosInstance.get("/game/${id}/start/");
        const firstQuestionId = response.data?.first_question_id;
        
        if (firstQuestionId) {
          navigate("/game/${id}/questions/${firstQuestionId}");
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
  }, [id, navigate]);

  return <p>�������� ����...</p>;
};

export default GameRedirect;