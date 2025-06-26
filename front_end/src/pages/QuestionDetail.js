import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken, getUserData } from "../utils/AuthUtils";
import { Box, Typography, TextField, Button, Stack, Paper, Link as MuiLink, Alert, CircularProgress, Tooltip } from "@mui/material";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { RotateLeft, Edit, Delete, DeleteForever, Done, Close, Face, Event, AddPhotoAlternate, HideImage, Undo, Visibility, VisibilityOff, Check } from "@mui/icons-material";

const QuestionDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    id: useParams().id,
    author_q: "",
    author_id: "",
    pub_date_q: "",
    image_attached: "",
    question_text: "",
    answer_text: "",
    question_note: ""
  });
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : { username: null };
  });

  const myName = getUserData()?.username || null;
  const [isMyQuestion, setIsMyQuestion] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/question/${question.id}/`)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log("Полученные данные вопроса:", data); // Добавим лог для отладки
        
        // Определяем имя автора вопроса
        let authorName = "Неизвестно";
        if (data.author_q) {
          if (typeof data.author_q === 'object' && data.author_q.username) {
            authorName = data.author_q.username;
          } else if (typeof data.author_q === 'string') {
            authorName = data.author_q;
          } else if (typeof data.author_q === 'number') {
            // Если приходит только ID автора, можно сделать дополнительный запрос
            authorName = `ID: ${data.author_q}`;
          }
        }

        setQuestion({
          id: data.id,
          question_text: data.question_text || "Неизвестно",
          answer_text: data.answer_text || "",
          author_q: authorName, // Используем обработанное имя автора
          image_attached: data.image_attached || false,
          question_note: data.question_note,
          author_id: data.author_q?.id || "Неизвестно",
          pub_date_q: data.pub_date_q || "Неизвестно"
        });

        setIsMyQuestion(data.author_q?.username === myName);
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, [question.id, myName]);

  const handleShowHideAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const [questionTextEdit, setQuestionTextEdit] = useState("");
  const [questionAnsEdit, setQuestionAnsEdit] = useState("");

  const [buttonsPending, setButtonsPending] = useState(false);
  const [buttonsEdit, setButtonsEdit] = useState(false);
  const [buttonsDelete, setButtonsDelete] = useState(false);
  
  const [newImage, setNewImage] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [deleteImage, setDeleteImage] = useState(false);

  const [finalImageUrl, setFinalImageUrl] = useState("");

  const [goodState, setGoodState] = useState("");
  const [errState, setErrState] = useState("");
  const [deletedState, setDeletedState] = useState(false);

  const editIsValid = questionTextEdit.trim() && questionAnsEdit.trim();

  const handleEditButton = () => {
    setQuestionTextEdit(question.question_text);
    setQuestionAnsEdit(question.answer_text);
    setButtonsEdit(true);
    
    setGoodState("");
    setErrState("");
    setDeletedState(false);
  };

  const handleDeleteButton = () => {
    setButtonsDelete(true);
  };

  const handleCloseButton = () => {
    if (buttonsPending) return;
    setButtonsEdit(false);
    setButtonsDelete(false);
    setNewImage("");
    setDeleteImage(false);
    setNewImageUrl("");
  };

  const handleImgEditButton = () => {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*";

    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      setNewImage(file);

      const imageUrl = URL.createObjectURL(file);
      setNewImageUrl(imageUrl);
    }

    
    input.click();
    // setButtonsImgEdit(true);
  };

  const handleImgDeleteButton = () => {
    setDeleteImage(true);
  };

  const handleImgUndoButton = () => {
    setNewImage("");
    setNewImageUrl("");
    setDeleteImage(false);
  };

  const handleEditQuestion = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const questionResponse = await axios.put(
        `${API_BASE_URL}/api/question/update/${question.id}/`,
        {
          question_text: questionTextEdit.trim(),
          answer_text: questionAnsEdit.trim()
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (questionResponse.status !== 200) {
        throw new Error("Ошибка при редактировании вопроса");
      }

      if (deleteImage) {
        const imgDeleteResponse = await axios.delete(
          `${API_BASE_URL}/api/question/delete/${question.id}/?image=true`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (imgDeleteResponse.status !== 204) {
          throw new Error("Ошибка при удалении изображения");
        }

        question.image_attached = false;
      }

      if (newImage) {
        const formData = new FormData();
        formData.append('image', newImage);

        const imgReplaceResponse = await axios.put(
          `${API_BASE_URL}/api/question/update/${question.id}/?image=true`, formData,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
          });

        if (imgReplaceResponse.status !== 200) {
          throw new Error("Ошибка при редактировании изображения");
        }

        question.image_attached = true;
      }

      question.question_text = questionTextEdit.trim();
      question.answer_text = questionAnsEdit.trim();
      setGoodState("Информация обновлена!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при редактировании вопроса")
    } finally {
      setButtonsPending(false);
      handleRetry();
      handleCloseButton();

      setDeleteImage(false);
      setFinalImageUrl("");
      if (newImage) {
        setFinalImageUrl(newImageUrl);
        setNewImage("");
        setNewImageUrl("");
      }
    }
  };
  
  const handleDeleteQuestion = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const questionResponse = await axios.delete(
        `${API_BASE_URL}/api/question/delete/${question.id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (questionResponse.status !== 204) {
        throw new Error("Ошибка при удалении вопроса");
      }

      setQuestion({
        id: question.id,
      });

      setDeletedState(true);
      setGoodState("Вопрос удалён!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при удалении вопроса")
    } finally {
      setButtonsPending(false);
      handleRetry();
      handleCloseButton();
    }
  };

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (user.username) {
      if (answer.trim().toLowerCase() === question.answer_text.toLowerCase()) {
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    } else {
      navigate("/login");
    }
  };

  const handleRetry = () => {
    setAnswer("");
    setShowAnswer(false);
    setFeedback("");
  };

  const [drawerWidth, setDrawerWidth] = useState('240px');
  const [drawerDuration, setDrawerDuration] = useState('255ms');

  useEffect(() => {
    const drawer = document.getElementById('drawer');
    if (drawer) {
      const width = window.getComputedStyle(drawer).width;
      setDrawerWidth(width);
    }
    
    document.getElementById('drawer').addEventListener("drawerEvent", (e) => {(e.detail.open) ? setDrawerDuration("255ms") : setDrawerDuration("195ms")});
    document.getElementById('drawer').addEventListener("drawerEvent", (e) => {(e.detail.open) ? setDrawerWidth("240px") : setDrawerWidth("65px")});
  }, []);

  return (
    <>
      {errState.trim() &&
       <Alert severity="error" sx={{ mb: 3 }}>
         {errState}
       </Alert>
      }
      {goodState.trim() &&
       <Alert severity="success" sx={{ mb: 3 }}>
         {goodState}
       </Alert>
      }
      {deletedState &&
       <Button variant="outlined-grey" component={Link} to={`/questions`}>
         Назад к вопросам
       </Button>
      }

      {!deletedState && (
        <>
          <Stack 
            direction="row" 
            sx={{ 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2,
              flexWrap: 'wrap-reverse',
              gap: 2
            }}
          >
            <Paper variant_p="chip">
              <Face/>
              <MuiLink component={Link} to={`/user/${question.author_id}`} color="inherit" sx={{ ml: "4px" }}>
                {question.author_q}
              </MuiLink>

              <Event sx={{ ml: 2 }}/>
              <Typography sx={{ ml: "4px" }}>
                {question.pub_date_q !== "Неизвестно" 
                 ? new Date(question.pub_date_q).toLocaleDateString("ru-RU") 
                 : "----"}
              </Typography>
            </Paper>
            
            {isMyQuestion && (
              <Stack spacing={2} direction="row" >
                {!(buttonsEdit || buttonsDelete) && (
                  <>
                    <Button onClick={handleEditButton} variant="outlined-grey"> 
                      <Edit />
                    </Button>
                    <Button onClick={handleDeleteButton} variant="outlined-grey">
                      <Delete />
                    </Button>
                  </>
                )}
              {buttonsEdit && (
                <>
                  <Button
                    variant={editIsValid ? "outlined-grey" : "disabled-dark"}
                    disabled={!editIsValid}
                    onClick={handleEditQuestion}>
                    {buttonsPending ? <CircularProgress size={24} color="inherit"/> : <Done /> }
                  </Button>
                  <Button variant="outlined-grey" onClick={handleCloseButton}>
                    <Close />
                  </Button>
                </>
              )}
              {buttonsDelete && (
                <>
                  <Button variant="red" onClick={handleDeleteQuestion}>
                    {buttonsPending ? <CircularProgress color="inherit"/> : <DeleteForever /> }
                  </Button>
                  <Button variant="outlined-grey" onClick={handleCloseButton}>
                    <Close />
                  </Button>
                </>
              )}
              </Stack>
            )}
        </Stack>

        <Stack
          direction="row" 
          sx={{ 
            mb: 2,
            gap: 4
          }}
        >
          {question.author_id && (
            <Box sx={{position: "relative"}}>
              <img
                src={deleteImage ? "/side_owl.jpg"
                     : (newImageUrl ? newImageUrl
                        : (finalImageUrl ? finalImageUrl
                           : (question.image_attached ? `${API_BASE_URL}/api/question/${question.id}/?image=true` : "/side_owl.jpg")))}
                style={{
                  maxHeight: "50vh", maxWidth: "25vw",
                  borderRadius: "20px",
                  filter: buttonsEdit ? "blur(5px) brightness(60%)" : "blur(0px) brightness(100%)",
                  transition: "filter 0.3s ease-in-out"}}
                alt="Раздатка"
              />
              <Stack spacing={2} direction="row" sx={{position: "absolute", top: "16px", left: "16px"}}>
                {buttonsEdit && (
                  <>
                    {!(newImage || deleteImage) && (
                      <>
                        <Button onClick={handleImgEditButton} variant="grey"> 
                          <AddPhotoAlternate />
                        </Button>

                        <Button onClick={handleImgDeleteButton} variant="grey" disabled={!question.image_attached}>
                          <HideImage />
                        </Button>
                      </>
                    )}

                    {(newImage || deleteImage) && (
                      <Button onClick={handleImgUndoButton} variant="grey">
                        <Undo />
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          )}

          {!(buttonsEdit) && (
            <Typography variant="h5" gutterBottom>
              Текст вопроса: {question.question_text}
            </Typography>
          )}
          
          {buttonsEdit && (          
            <Box>
              <TextField
                label="Текст вопроса *"
                variant_tf="dark"
                fullWidth
                disabled={buttonsPending}
                defaultValue={question.question_text}
                onChange={(e) => setQuestionTextEdit(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Правильный ответ *"
                variant_tf="dark"
                fullWidth
                disabled={buttonsPending}
                defaultValue={question.answer_text}
                onChange={(e) => setQuestionAnsEdit(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </Stack>
        </>
      )}

    {!(buttonsEdit || deletedState) && (
      <>
        {feedback && (
          <Paper elevation={3}
                 sx={{
                   padding: '24px',
                   borderRadius: '12px',
                   backgroundColor: (feedback === "correct" ? 'success.dark' : 'error.dark'),
                   mb: "16px"
                 }}>
            <Box display="flex" alignItems="center">
              {feedback === "correct" ? (
                <Check sx={{ color: 'inherit', fontSize: '2rem', mr: 2 }} />
              ) : (
                <Close sx={{ color: 'inherit', fontSize: '2rem', mr: 2 }} />
              )}
              <Typography variant="h5" sx={{ 
                            fontWeight: 'bold',
                            color: 'inherit',
                            mr: "16px"
                          }}>
                {feedback === "correct" ? 'Правильно!' : 'Неправильно!'}
              </Typography>
              {feedback === "incorrect" && (
                <Button
                  onClick={handleShowHideAnswer}
                  sx={{backgroundColor: 'default.red2',
                       color: 'default.white3'}}
                >
                  {showAnswer ? (<VisibilityOff sx={{ mr: 1 }} />) : (<Visibility sx={{ mr: 1 }} />)}
                  {showAnswer ? "Спрятать ответ" : "Узнать ответ"}
                </Button>
              )}
            </Box>

            {(feedback === "correct" || showAnswer) && (
              <>
                <Box mb={3} mt={3}>
                  <Typography variant="h6" color="inherit" mb={1}>
                    Ваш ответ:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                                fontWeight: 500,
                                color: 'inherit',
                                wordBreak: 'break-word'
                              }}>
                    {answer || '—'}
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Typography variant="h6" color="inherit" mb={1}>
                    Правильный ответ:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                                fontWeight: 500,
                                color: 'inherit',
                                wordBreak: 'break-word'
                              }}>
                    {question.answer_text}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="inherit" mb={1}>
                    Комментарий автора:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                                color: 'inherit',
                                wordBreak: 'break-word'
                              }}>
                    {question.question_note ? question.question_note : "Автор не оставил комментариев"}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        )}
        
        <Tooltip disableHoverListener={user.username} disableFocusListener disableTouchListener title={
                   <Typography variant="h6">
                     Для ввода и проверки ответа необходимо{" "}
                     <Link component={Link} to="/login" state={{ redirect: location }}>
                       авторизоваться
                     </Link>.
                   </Typography>
                 }>
          <span>
            <TextField
              disabled={!user.username}
              label="Ваш ответ"
              value={answer}
              onChange={handleAnswerChange}
              variant_tf="dark"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                disabled={!user.username}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mr: 2 }}
              >
                Отправить ответ
              </Button>
              {feedback  && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleRetry}
                  sx={{ mr: 2 }}
                >
                  <RotateLeft />
                </Button>
              )}
            </Box>
          </span>
        </Tooltip>
      </>
    )}

    <Box
      sx={{
        pointerEvents: "none",
        position: "fixed", width: `calc(100vw - ${drawerWidth})`, height: `calc(100vh - 64px)`, top: "64px", left: drawerWidth,
        boxShadow: (feedback === "correct" ? "0px 0px 80px 1px green inset" : (feedback === "incorrect" ? "0px 0px 80px 1px red inset" : "")),
        transition: `box-shadow 1s ease-in-out, ${drawerDuration} cubic-bezier(0.4, 0, 0.6, 1) 0ms`}}>
    </Box>
    </>
  );
};

export default QuestionDetail;
