import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const violetBase = '#7F00FF';
const violetMain = alpha(violetBase, 1);

const purpleTheme = createTheme({
  palette: {
    primary: {
      main: violetMain,
      light: alpha(violetBase, 0.3),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
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
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-columnHeader': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
          '& .MuiDataGrid-columnHeader:focus': {
            backgroundColor: 'inherit',
          },
          '& .MuiDataGrid-columnHeader .MuiButtonBase-root': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
          '& .MuiDataGrid-cell': {
            '&:hover': {
              backgroundColor: 'inherit',
            },
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          backgroundColor: violetMain,
          borderRadius: 10,
          '&:hover': {
            backgroundColor: 'inherit',
          },
        },
      },
    },
  },
});

export default purpleTheme;
