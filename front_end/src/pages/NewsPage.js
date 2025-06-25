import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
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
  Collapse
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
  const [currentUser, setCurrentUser] = useState(getUserData());

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.message === "Network Error") {
          setError("Проблемы с подключением к серверу");
          setForumLoading(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Проверка авторизации при загрузке
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        if (!isAuthorized) {
          setAuthAlert(true);
        } else {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Ошибка проверки авторизации:", err);
      }
    };
    verifyAuth();
  }, []);

  // Загрузка тем форума
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setForumLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/threads/`, {
          timeout: 5000
        });
        setThreads(response.data || []);
      } catch (err) {
        console.error("Ошибка при загрузке тем форума:", err);
        setError("Ошибка при загрузке тем форума");
        setThreads([]);
      } finally {
        setForumLoading(false);
      }
    };

    fetchThreads();
  }, []);

  // Загрузка сообщений при выборе темы

useEffect(() => {
  if (activeThread) {
    const fetchMessages = async () => {
  try {
    setForumLoading(true);
    const response = await axios.get(
      `${API_BASE_URL}/api/threads/${activeThread.id}/messages/`,
      { 
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      }
    );
    
    setMessages(prev => ({ 
      ...prev, 
      [activeThread.id]: response.data 
    }));
    
  } catch (err) {
    console.error("Ошибка при загрузке сообщений:", err);
    setError(err.message || "Ошибка при загрузке сообщений");
  } finally {
    setForumLoading(false);
  }
};

    fetchMessages();
  }
}, [activeThread]);

  const handleAuthRedirect = () => {
    setAuthAlert(true);
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
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      throw new Error('CSRF token not found');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/threads/`,
      { title: newThreadTitle },
      {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 5000
      }
    );

    setThreads([...threads, response.data]);
    setNewThreadTitle("");
    setShowThreadForm(false);
    setActiveThread(response.data);
  } catch (err) {
    console.error("Ошибка при создании темы:", err);
    
    // Enhanced error handling
    if (err.response?.data) {
      const errorData = err.response.data;
      if (typeof errorData === 'object') {
        setError(`Ошибка: ${JSON.stringify(errorData)}`);
      } else {
        setError(`Ошибка: ${errorData}`);
      }
    } else {
      setError(err.message || "Ошибка при создании темы");
    }
    
    if (err.response?.status === 401) {
      clearAuthTokens();
      handleAuthRedirect();
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
    
    const csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      throw new Error('CSRF token not found');
    }

    const postData = {
      content: newMessage.trim()
    };
    
    if (replyTo?.id) {
      postData.parent_message = replyTo.id;
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/threads/${activeThread.id}/messages/create/`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 5000
      }
    );

    // Обработка успешного ответа
    const normalizedResponse = {
      ...response.data,
      author: typeof response.data.author === 'string' 
        ? { username: response.data.author } 
        : response.data.author,
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
    
    // Улучшенная обработка ошибок
    if (err.response?.data) {
      const errorData = err.response.data;
    } else {
      setError(err.message || "Ошибка при отправке сообщения");
    }
    
    if (err.response?.status === 401) {
      clearAuthTokens();
      handleAuthRedirect();
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
    cacheVote(messageId, voteValue);
    try {
      const csrfToken = getCookie('csrftoken');
      if (!csrfToken) throw new Error('CSRF token not found');

      setVotingStates(prev => ({ ...prev, [messageId]: voteValue }));

      const response = await axios.post(
        `${API_BASE_URL}/api/messages/${messageId}/vote/`,
        { vote: voteValue },
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
        ml: depth > 0 ? 4 : 0, // Сдвиг для вложенных сообщений
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
        <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.default.black5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              bgcolor: theme.palette.primary.hover
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
              <ThumbUp fontSize="small" sx={{color: isUpvoted ? theme.palette.primary.hover : theme.palette.text.dark}}/>
              <Badge 
                badgeContent={message.upvotes_count || 0} 
                sx={{ ml: 2, color: isUpvoted ? theme.palette.primary.hover : theme.palette.text.dark }}
              />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={() => handleVote(message.id, -1)}
            >
              <ThumbDown fontSize="small" sx={{color: isDownvoted ? theme.palette.primary.hover : theme.palette.text.dark}} />
              <Badge 
                badgeContent={message.downvotes_count || 0} 
                sx={{ ml: 2, color: isDownvoted ? theme.palette.primary.hover : theme.palette.text.dark}}
              />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleReply(message)}
              sx={{ ml: 'auto' }}
            >
              <Reply fontSize="small" sx={{ color: theme.palette.text.dark }} />
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

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.window,
      p: 3,
      position: 'fixed',
      right: 20,
      width: expanded ? '80vw' : '350px',
      height: '87vh',
      top: 80,
      zIndex: 1000,
      boxShadow: 3,
      transition: 'width 0.3s ease',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1
      }}>
          <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
            ЧГК Форум
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

      </Box>

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
                <Box sx={{ mb: 3, p: 2, borderRadius: 1 }}>
                  <TextField
                    fullWidth
                    label="Название темы"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    sx={{ mb: 1, backgroundColor: theme.palette.background.white, '& .MuiInputBase-input': {
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
              
              <List sx={{ backgroundColor: theme.palette.background.white, borderRadius: 2 }}>
                {threads.map(thread => (
                  <React.Fragment key={thread.id}>
                    <ListItem 
                      button 
                      onClick={() => setActiveThread(thread)}
                      sx={{
                        color: theme.palette.text.dark,
                        '&:hover': { backgroundColor: theme.palette.action.hover }
                      }}
                    >
                      <ListItemText 
                        primary={thread.title}
                        secondary={`Создано: ${new Date(thread.created_at).toLocaleDateString()}\n` +
                        `Обновлено: ${new Date(thread.updated_at).toLocaleDateString()}`}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }} // ключевое свойство
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}>
                <Typography variant="h6" sx={{ color: theme.palette.text.dark }}>
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
                <Box sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.text.dark, borderRadius: 1 }}>
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
                backdroundColor: theme.palette.background.disabled
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
              
              <Box sx={{ borderRadius: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={replyTo ? `Ответ ${replyTo.author.username}` : "Ваше сообщение..."}
                  sx={{ 
                    mb: 1, 
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
                >
                  {forumLoading ? 'Отправка...' : 'Отправить'}
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default NewsPage;
