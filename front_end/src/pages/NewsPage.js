import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Avatar,
  Badge,
  alpha,
  Tooltip,
  Collapse,
  Link
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Send,
  Reply,
  Fullscreen,
  FullscreenExit
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  getAccessToken,
  isAuthenticated,
  clearAuthTokens,
  getUserData,
  checkAuth,
  cacheVote,
  getCachedVote
} from "../utils/AuthUtils";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const NewsPage = () => {
  const theme = useTheme();
  const [error, setError] = useState(null);
  const [authAlert, setAuthAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [forumLoading, setForumLoading] = useState(true);
  const [votingStates, setVotingStates] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        if (!isAuthorized) {
          setAuthAlert(true);
        }
        setCurrentUser(user || null);
      } catch (err) {
        console.error("Auth check error:", err);
        setAuthAlert(true);
      }
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.message === "Network Error") {
          setError("Проблемы с подключением к серверу");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const getAuthHeaders = () => {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Token not found");
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    return headers;
  };

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setForumLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/threads/`, {
          timeout: 5000
        });
        setThreads(response.data || []);
      } catch (err) {
        console.error("Threads load error:", err);
        setError(err.message || "Ошибка загрузки тем");
      } finally {
        setForumLoading(false);
      }
    };

    fetchThreads();
  }, []);

  useEffect(() => {
    if (!activeThread) return;

    const fetchMessages = async () => {
      try {
        setForumLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/threads/${activeThread.id}/messages/`,
          {
            timeout: 5000,
            headers: getAuthHeaders()
          }
        );

        setMessages(prev => ({
          ...prev,
          [activeThread.id]: response.data
        }));
      } catch (err) {
        console.error("Messages load error:", err);
        if (err.message === "Token not found" || err.response?.status === 401) {
          handleAuthRedirect();
        } else {
          setError(err.message || "Ошибка загрузки сообщений");
        }
      } finally {
        setForumLoading(false);
      }
    };

    fetchMessages();
  }, [activeThread]);

  const handleAuthRedirect = () => {
    setAuthAlert(true);
    clearAuthTokens();
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  const handleCreateThread = async () => {
    if (!isAuthenticated()) {
      handleAuthRedirect();
      return;
    }

    try {
      setForumLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/threads/`,
        { title: newThreadTitle },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
          timeout: 5000
        }
      );

      setThreads([...threads, response.data]);
      setNewThreadTitle("");
      setShowThreadForm(false);
      setActiveThread(response.data);
    } catch (err) {
      console.error("Thread create error:", err);
      if (err.message === "Token not found" || err.response?.status === 401) {
        handleAuthRedirect();
      } else {
        setError(err.response?.data || err.message || "Ошибка создания темы");
      }
    } finally {
      setForumLoading(false);
    }
  };

  const handleReply = (message) => {
    if (!isAuthenticated()) {
      handleAuthRedirect();
      return;
    }
    setReplyTo(message);
    setNewMessage(`@${message.author?.username || 
                     (typeof message.author === 'string' ? message.author : 'Anonymous')}, `);
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated()) {
      handleAuthRedirect();
      return;
    }

    if (!newMessage.trim()) return;

    try {
      setForumLoading(true);
      const token = getAccessToken();
      if (!token) {
        throw new Error('Токен не найден');
      }

      const postData = {
        content: newMessage.trim()
      };

      if (replyTo?.id) {
        postData.parent_message = replyTo.id;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/threads/${activeThread.id}/messages/create/`,
        postData,
        {
          headers,
          withCredentials: true,
          timeout: 5000
        }
      );

      const normalizedResponse = {
        ...response.data,
        author: {
          username: currentUser.username
        },
        parent_message: replyTo?.id || null
      };

      setMessages(prev => {
        const threadMessages = prev[activeThread.id] || [];

        if (replyTo) {
          const updateReplies = (messages) => {
            return messages.map(msg => {
              if (msg.id === replyTo.id) {
                return {
                  ...msg,
                  replies: [...(msg.replies || []), normalizedResponse]
                };
              }
              if (msg.replies?.length > 0) {
                return {
                  ...msg,
                  replies: updateReplies(msg.replies)
                };
              }
              return msg;
            });
          };

          return {
            ...prev,
            [activeThread.id]: updateReplies(threadMessages)
          };
        } else {
          return {
            ...prev,
            [activeThread.id]: [...threadMessages, normalizedResponse]
          };
        }
      });

      setNewMessage("");
      setReplyTo(null);

    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);

      if (err.response?.status === 401) {
        clearAuthTokens();
        handleAuthRedirect();
      } else {
        setError(err.response?.data?.message || err.message || "Ошибка при отправке сообщения");
      }
    } finally {
      setForumLoading(false);
    }
  };

 const handleVote = async (messageId, voteValue) => {
  if (!isAuthenticated()) {
    handleAuthRedirect();
    return;
  }

  try {
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) throw new Error('CSRF token not found');

    // Получаем текущий голос пользователя
    const currentVote = getCachedVote(messageId) || 0;
    
    // Если повторное нажатие на ту же кнопку - снимаем голос
    const newVoteValue = currentVote === voteValue ? 0 : voteValue;

    setVotingStates(prev => ({ ...prev, [messageId]: newVoteValue }));
    cacheVote(messageId, newVoteValue);

    const response = await axios.post(
      `${API_BASE_URL}/api/messages/${messageId}/vote/`,
      { vote: newVoteValue },
      {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
        timeout: 5000
      }
    );

    const updateMessageVote = (messages) => {
      return messages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            rating: response.data.current_rating,
            user_vote: response.data.vote,
            upvotes_count: response.data.upvotes_count,
            downvotes_count: response.data.downvotes_count
          };
        }
        if (msg.replies && msg.replies.length > 0) {
          return {
            ...msg,
            replies: updateMessageVote(msg.replies)
          };
        }
        return msg;
      });
    };

    setMessages(prev => ({
      ...prev,
      [activeThread.id]: updateMessageVote(prev[activeThread.id])
    }));
  } catch (err) {
    if (err.response?.status === 401) {
      clearAuthTokens();
      handleAuthRedirect();
    } else {
      console.error('Vote error:', err);
      setError(err.message || "Vote failed. Please try again.");
    }
  } finally {
    setVotingStates(prev => ({ ...prev, [messageId]: null }));
  }
};

  const MessageTree = ({ message, depth = 0 }) => {
    const theme = useTheme();
  
    const userVote = message.user_vote || getCachedVote(message.id) || 0;
    const isUpvoted = userVote === 1;
    const isDownvoted = userVote === -1;

    const authorName = message.author?.username || 
                     (typeof message.author === 'string' ? message.author : 'Anonymous');
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
      <Box sx={{ 
        ml: depth > 0 ? 4 : 0,
        mt: 1,
        position: 'relative',
        '&:before': depth > 0 ? {
          content: '""',
          position: 'absolute',
          left: -16,
          top: 0,
          bottom: 0,
          width: '2px',
        } : null
      }}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.background.default }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              bgcolor: theme.palette.primary.main
            }}>
              {authorInitial}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {authorName}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {message.content || ''}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1}}>
            <IconButton
              size="small"
              onClick={() => handleVote(message.id, 1)}
            >
              <ThumbUp fontSize="small" sx={{color: isUpvoted ? theme.palette.primary.main : theme.palette.default.black5}}/>
              <Badge 
                badgeContent={message.upvotes_count || 0} 
                sx={{ ml: 2, color: isUpvoted ? theme.palette.primary.main : theme.palette.default.black5 }}
              />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={() => handleVote(message.id, -1)}
            >
              <ThumbDown fontSize="small" sx={{color: isDownvoted ? theme.palette.primary.main : theme.palette.default.black5}} />
              <Badge 
                badgeContent={message.downvotes_count || 0} 
                sx={{ ml: 2, color: isDownvoted ? theme.palette.primary.main : theme.palette.default.black5}}
              />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleReply(message)}
              sx={{ ml: 'auto' }}
            >
              <Reply fontSize="small" sx={{ color: theme.palette.default.black5 }} />
            </IconButton>
          </Box>
        </Paper>
        
        {message.replies && message.replies.length > 0 && (
          <Box>
            {message.replies.map(reply => (
              <MessageTree 
                key={reply.id} 
                message={reply} 
                depth={depth + 1} 
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (authAlert) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Требуется авторизация. Перенаправляем на страницу входа...
        </Alert>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {!isAuthenticated() ? (
        <>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2, textAlign: 'center' }}>
            Для просмотра страницы необходимо авторизоваться
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              href="/login"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Войти
            </Button>
          </Box>
        </>
      ) : (
        <>
          {currentUser && (
            <Box sx={{ 
              textAlign: 'center', 
              mb: 2,
              backgroundColor: theme.palette.background.paper,
              p: 2,
              borderRadius: 1,
              maxWidth: '70vw',
              mx: 'auto'
            }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                Добро пожаловать, {currentUser.username}!
              </Typography>

              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                Играйте, соревнуйтесь и общайтесь
              </Typography>
            </Box>
          )}
         <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}> 
          <Box sx={{ 
            backgroundColor: theme.palette.background.light,
            p: 4,
           
            width: '70vw',
            top: currentUser ? 150 : 80,
            zIndex: 1000,
            boxShadow: 3,
            overflow: 'auto',
            borderRadius: 2,
            maxHeight: 'calc(100vh - 200px)',
            justifyContent: 'center',
            
          }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
              ЧГК Форум
            </Typography>
            
            {forumLoading && !activeThread ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!activeThread ? (
                  <>
                    <Button 
                      variant="contained" 
                      sx={{ mb: 2 }}
                      onClick={() => setShowThreadForm(true)}
                    >
                      Новая тема
                    </Button>
                    
                    {showThreadForm && (
                      <Box sx={{ mb: 3, borderRadius: 1 }}>
                        <TextField
                          fullWidth
                          label="Название темы"
                          value={newThreadTitle}
                          onChange={(e) => setNewThreadTitle(e.target.value)}
                          sx={{ mb: 1, borderRadius: 1, backgroundColor: theme.palette.background.white, '& .MuiInputBase-input': {
              color: theme.palette.text.dark
            } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => setShowThreadForm(false)}
                          >
                            Отмена
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={handleCreateThread}
                            disabled={!newThreadTitle.trim() || forumLoading}
                          >
                            {forumLoading ? <CircularProgress size={24} /> : 'Создать'}
                          </Button>
                        </Box>
                      </Box>
                    )}
                    
                    {threads.length === 0 ? (
                      <Box sx={{ 
                        p: 3, 
                        textAlign: 'center',
            
                      }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          На форуме пока нет ни одной темы
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                          Будьте первым, кто создаст новую тему для обсуждения!
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ backgroundColor: theme.palette.background.default, borderRadius: 1  }}>
                        {threads.map(thread => (
                          <React.Fragment key={thread.id}>
                            <ListItem 
                              button 
                              onClick={() => setActiveThread(thread)}
                              sx={{
                              
                                '&:hover': { backgroundColor: theme.palette.action.hover }
                              }}
                            >
                              <ListItemText 
                                primary={thread.title}
                                secondary={`Создано: ${new Date(thread.created_at).toLocaleDateString()}\n` +
                                `Обновлено: ${new Date(thread.updated_at).toLocaleDateString()}`}
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                                secondaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }}
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <>
                    <Box sx={{ 
                      display: 'column', 
                      alignItems: 'center',
                      mb: 1,
                      p: 2
                    }}>
                    <Box sx={{display: 'flex', mb: 1, justifyContent: 'space-between'}}>
                      <Typography variant="h6" sx={{ color: theme.palette.background.white }}>
                        {activeThread.title}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setActiveThread(null)}
                        disabled={forumLoading}
                      >
                        Назад к темам
                      </Button>
                    </Box>
                   
                    
                    {replyTo && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.4), borderRadius: 1 }}>
                        <Typography variant="body2">
                          Ответ на сообщение от {replyTo.author?.username || 
                            (typeof replyTo.author === 'string' ? replyTo.author : 'Anonymous')}
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => setReplyTo(null)}
                          sx={{ mt: 1 }}
                        >
                          Отменить ответ
                        </Button>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      maxHeight: '50vh', 
                      overflow: 'auto',
                      mb: 2,
                      
                    }}>
                      {forumLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <CircularProgress />
                        </Box>
                      ) : messages[activeThread.id]?.length > 0 ? (
                        messages[activeThread.id].map(message => (
                          message ? <MessageTree key={message.id} message={message} /> : null
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Нет сообщений. Будьте первым!
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ 
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end' // Добавляем выравнивание по правому краю
}}>
  <TextField
    fullWidth
    multiline
    rows={3}
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    placeholder={replyTo ? `Ответ ${replyTo.author.username}` : "Ваше сообщение..."}
    sx={{ 
      mb: 2, 
      borderRadius: 1,

      backgroundColor: theme.palette.background.white,
      '& .MuiInputBase-input': {
        color: theme.palette.text.dark
      }
    }}
    disabled={forumLoading}
  />
  
  <Button 
    variant="contained" 
    onClick={handleSendMessage}
    disabled={!newMessage.trim() || forumLoading}
    endIcon={forumLoading ? <CircularProgress size={24} /> : <Send />}
    size="large"
    sx={{ 
      alignSelf: 'flex-end' // Убедитесь, что кнопка выравнивается по правому краю
    }}
  >
    {forumLoading ? 'Отправка...' : 'Отправить'}
  </Button>

</Box>

                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default NewsPage;