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
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Person, PersonAdd } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { clearAuthTokens, getUserData } from "../utils/AuthUtils";

const UserMenuItem = styled(Button)(({ theme }) => ({
  textAlign: "center",
  fontFamily: theme.typography.fontFamily,
}));

const UserMenu = ({ onLogout }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fontSize = "2vh";

  const user = getUserData() || { username: null, id: null };

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuthTokens();
    handleClose();
    
    if (onLogout) {
      onLogout();
    }
    
    navigate("/");
    window.location.reload();
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? "simple-popover" : undefined;

  return (
    <>
      {user?.username ? (
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
                height: "300px",
              },
            }}>
            <Box sx={{ p: 2 }}>
              <List>
                {[
                  ["Мой профиль", "/myprofile"],
                  ["Мои команды", "/myteams"],
                  ["Мои приглашения", "/invitations"],
                 
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
          state={{ redirect: location }}
          sx={{ color: theme.palette.text.primary }}>
            <PersonAdd sx={{ color: theme.palette.text.primary }} />
        </UserMenuItem>
      )}
    </>
  );
};

export default UserMenu;