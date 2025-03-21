import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const burgundyBase = '#7E0001';
const burgundyLight = '#CD2626';
const graphiteBackground = '#2A2A2A';
const graphiteText = '#FFFFFF';
const lightGray = '#4A4A4A';

const burgundyTheme = createTheme({
  palette: {
    primary: {
      main: burgundyBase,
      light: alpha(burgundyBase, 0.5),
      dark: alpha(burgundyBase, 0.9),
      contrastText: getContrastRatio(burgundyBase, graphiteText) > 4.5 ? graphiteText : '#000',
    },
    secondary: {
      main: burgundyLight,
      light: alpha(burgundyLight, 0.5),
      dark: alpha(burgundyLight, 0.9),
    },
    background: {
      default: graphiteBackground,
      paper: alpha(graphiteBackground, 0.9),
    },
    text: {
      primary: graphiteText,
      secondary: alpha(graphiteText, 0.7),
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: burgundyBase,
          borderRadius: 10,
          color: graphiteText,
          '&:hover': {
            backgroundColor: alpha(burgundyBase, 0.8),
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: graphiteBackground,
          color: graphiteText,
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: alpha(graphiteBackground, 0.9),
            color: graphiteText,
            '& .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible',
            },
          },
          '& .MuiDataGrid-columnHeader:focus': {
            backgroundColor: alpha(graphiteBackground, 0.9),
          },
          '& .MuiDataGrid-columnHeader .MuiButtonBase-root': {
            backgroundColor: 'inherit',
            color: graphiteText,
          },
          '& .MuiDataGrid-cell': {
            backgroundColor: 'inherit',
            color: graphiteText,
          },
          '& .MuiDataGrid-row': {
            '&:not(.visited-row)': {
              backgroundColor: lightGray,
            },
            '&.visited-row': {
              backgroundColor: graphiteBackground,
            },
            '&:hover': {
              backgroundColor: alpha(burgundyBase, 0.1),
            },
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'inherit',
          borderRadius: 10,
          color: graphiteText,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(graphiteBackground, 0.8),
          color: graphiteText,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: graphiteBackground,
          color: graphiteText,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: graphiteText,
          '&:hover': {
            backgroundColor: alpha(burgundyBase, 0.1),
          },
          '& .MuiSvgIcon-root': {
            color: graphiteText,
          },
        },
      },
    },
  },
});

export default burgundyTheme;