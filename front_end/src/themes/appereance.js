import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const violetBase = '#6633CC';
const violetMain = alpha(violetBase, 1);

const purpleTheme = createTheme({
  palette: {
    primary: {
      main: violetMain,
      light: alpha(violetBase, 0.3),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 5 ? '#fff' : '#111',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: violetMain,
          borderRadius: 10,
          '&:hover': {
            backgroundColor: alpha(violetBase, 0.8),
          },
          
          '&.navbar-button, &.usermenu-button': {
            backgroundColor: violetMain,
            '&:hover': {
              backgroundColor: alpha(violetBase, 0.8),
            },
          },
          '&.datagrid-button': {
            backgroundColor: 'inherit',
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'inherit',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            backgroundColor: 'inherit',
          },
          '& .MuiDataGrid-columnHeader .MuiButtonBase-root': {
            backgroundColor: 'inherit',
          },
          '& .MuiDataGrid-cell': {
            backgroundColor: 'inherit',
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'inherit',
          borderRadius: 10,
          '&.navbar-button, &.usermenu-button': {
            backgroundColor: violetMain,
            '&:hover': {
              backgroundColor: alpha(violetBase, 0.8),
            },
          },
          '&.datagrid-button': {
            backgroundColor: 'inherit',
         
           
          },
        },
      },
    },
  },
});

export default purpleTheme;
