import React, {useRef} from "react";
import {Box, Stack, ButtonBase, TextField, Typography} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from "react-router-dom";

const Item = styled(ButtonBase)(({ dp_theme }) => ({ 
    height: '100',
    textAlign: 'center',
    //fontSize: 'h6',
    fontFamily: 'Roboto, sans-serif',
    color: "#FFFFFF"
}));

const Me = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  let user = Object.create(
      Object.getPrototypeOf({ username: null }), 
      Object.getOwnPropertyDescriptors(JSON.parse(localStorage.getItem('user')) || {}) 
  );

  const inputUsernameRef = useRef('');
  const inputPasswordRef = useRef('');

  if (!user.username) {
    return (
      <Box sx={{ width: '50vw', ml: '15vh', mt: '15vh', mb: '25vh', flexGrow: 0 }}>
        <Stack spacing='5vh'>
          <TextField inputRef={inputUsernameRef} label="Имя пользователя" variant="filled" />
          <TextField inputRef={inputPasswordRef} label="Пароль" variant="filled" />
          
          <Item 
            onClick={() => {
              user.username = inputUsernameRef.current.value;
              localStorage.setItem("user", JSON.stringify(user));
              navigate(from, { replace: true });
            }}> 
            <Typography variant="h6" sx={{ mr: 1 }}>
              Войти
            </Typography>
          </Item>
        </Stack>
      </Box>
    );
  } else {
    return (
      <Box sx={{ width: '50vw', ml: '15vh', mt: '15vh', mb: '25vh', flexGrow: 0 }}>
        <Typography variant="h6" sx={{ mr: 1, textAlign: 'center' }}>
          Добрый день, {user.username}! Прекрасно выглядите!
        </Typography> 
        
        <Item sx={{ width: '50vw'}} 
          onClick={() => {
            user.username = null;     
            localStorage.setItem("user", JSON.stringify(user));
            window.location.reload(false);
          }}> 
          <Typography variant="h6" sx={{ mr: 1 }}>
            Выйти
          </Typography>
        </Item>
      </Box>
    );
  }
};

export default Me;
