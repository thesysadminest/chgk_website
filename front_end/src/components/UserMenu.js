import React, { useState } from 'react';
import { Box, Typography, Button, Popover, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import { Person, PersonAdd } from '@mui/icons-material';

const Item = styled(Button)(({ theme }) => ({
  height: '100',
  textAlign: 'center',
  fontFamily: 'Roboto, sans-serif',
}));

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const fontSize = '2vh';

  let user;
  try {
    user = JSON.parse(localStorage.getItem('user')) || { username: null, id: null };
  } catch (e) {
    console.error("Error parsing user data from localStorage:", e);
    user = { username: null, id: null };
  }

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'simple-popover' : undefined;

  return (
    <>
      {user.username ? (
        <Item onClick={handleClick}>
          <Typography variant="h6" sx={{ mr: 1, color: '#FFFFFF' }}>
            {user.username}
          </Typography>
          <Person sx={{ color: '#FFFFFF' }} />

          <Popover
            sx={{ 
              mt: 2, 
              ml: 2, 
              mr: 3,
              '& .MuiPaper-root': {
                backgroundColor: '#424242', 
                opacity: 1, 
                color: '#FFFFFF',
              }
            }}
            id={id}
            open={openPopover}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: '260px',
                height: '350px',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <List>
                {[
                  ['Профиль', '/myprofile'],
                  ['Настройки', '/settings'],
                  ['Мой рейтинг', '/myrating'],
                  ['Моя команда', '/myteam'],
                ].map((text, index) => (
                  <ListItem disablePadding key={text[0]} sx={{ display: 'block', pb: 2 }}>
                    <ListItemButton
                      component={Link}
                      to={text[1]}
                      onClick={handleClose}
                      sx={{
                        justifyContent: 'center',
                        px: 2.5,
                        '&:hover': {
                          backgroundColor: '#616161',
                        },
                      }}
                    >
                      <ListItemText
                        primary={text[0]}
                        sx={{
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          fontSize: fontSize,
                          color: '#FFFFFF',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Button
                sx={{
                  justifyContent: 'center',
                  width: '100%',
                  backgroundColor: '#d4d4d4',
                  '&:hover': {
                    backgroundColor: '#FFFFFF',
                  },
                }}
                onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  window.location.reload(false);
                }}
              >
                <Typography variant="h6" sx={{ color: '#2A2A2A' }}>ВЫЙТИ</Typography>
              </Button>
            </Box>
          </Popover>
        </Item>
      ) : (
        <Item component={Link} to="/authorization">
          <Typography variant="h6" noWrap component="div" sx={{ mr: 1 }}>
            Авторизоваться
          </Typography>
          <PersonAdd sx={{ color: '#FFFFFF' }} />
        </Item>
      )}
    </>
  );
};

export default UserMenu;
