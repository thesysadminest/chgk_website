import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Popover, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, Link } from "react-router-dom";
import { Person, PersonAdd } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const UserMenuItem = styled(Button)(({ theme }) => ({
  height: "100px",
  textAlign: "center",
  fontFamily: theme.typography.fontFamily,
}));

const UserMenu = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const fontSize = "2vh";

  let user;
  try {
    user = JSON.parse(localStorage.getItem("user")) || { username: null, id: null };
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? "simple-popover" : undefined;

  return (
    <>
      {user.username ? (
        <UserMenuItem onClick={handleClick}>
          <Typography variant="h6" sx={{ mr: 1, color: theme.palette.text.primary }}>
            Вы зашли как {user.username}
          </Typography>
          <Person sx={{ color: theme.palette.text.primary }} />

          <Popover
            sx={{ 
              mt: 2, 
              ml: 2, 
              mr: 3,
              "& .MuiPaper-root": {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                opacity: 1, 
              }
            }}
            id={id}
            open={openPopover}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                width: "260px",
                height: "350px",
              },
            }}>
            <Box sx={{ p: 2 }}>
              <List>
                {[
                  ["Профиль", "/myprofile"],
                  ["Настройки", "/settings"],
                  ["Мой рейтинг", "/myrating"],
                  ["Моя команда", "/myteam"],
                ].map(([text, path]) => (
                  <ListItem disablePadding key={text} sx={{ display: "block", pb: 2 }}>
                    <ListItemButton
                      component={Link}
                      to={path}
                      onClick={handleClose}
                      sx={{
                        justifyContent: "center",
                        px: 2.5,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}>
                      <ListItemText
                        primary={text}
                        sx={{
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          fontSize: fontSize,
                          color: theme.palette.text.primary,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                sx={{
                  justifyContent: "center",
                  backgroundColor: theme.palette.primary.light, 
                  color: theme.palette.getContrastText(theme.palette.primary.light),
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main, 
                  },
                }}
                onClick={handleLogout}>
                <Typography variant="h6">
                  ВЫЙТИ
                </Typography>
              </Button>
            </Box>
          </Popover>
        </UserMenuItem>
      ) : (
        <UserMenuItem 
          component={Link} 
          to="/login"
          sx={{ color: theme.palette.text.primary }}>
            <PersonAdd sx={{ color: theme.palette.text.primary }} />
        </UserMenuItem>
      )}
    </>
  );
};

export default UserMenu;