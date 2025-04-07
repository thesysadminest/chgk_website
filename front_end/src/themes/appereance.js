import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const burgundyBase = '#9A0E0E';
const burgundyHover = '#CD2626';
const burgundyClicked = "#F5EAEA";

const graphiteBackground = '#29232A';
const windowBackground = '#D9D9D9';   //to be deleted later
const inactiveTableBackground = '#4A4A4A';
const advertisementBackground = '#382E3A';

const graphiteText = '#FFFFFF';
const disabledText = '#BDBDBD';
const disabledBackground = '#F5F5F5';

const inactiveBorderColor = '#E0E0E0';
const activeBorderColor = '#FF0000';

const activeChevronColor = '#C0C0C0';

const darkTheme = createTheme({
  palette: {
    primary: {
      main: burgundyBase,
      light: burgundyClicked,
      dark: burgundyBase,
      hover: burgundyHover,
      contrastText: getContrastRatio(burgundyBase, graphiteText) > 4.5 ? graphiteText : '#000',
    },
    secondary: {
      main: burgundyHover,
      light: alpha(burgundyHover, 0.5),
      dark: alpha(burgundyHover, 0.9),
    },
    background: {
      default: graphiteBackground,
      paper: alpha(graphiteBackground, 0.9),
      window: windowBackground,
      disabled: disabledBackground,
      light: advertisementBackground,
    },
    text: {
      primary: graphiteText,
      secondary: alpha(graphiteText, 0.7),
      gray: inactiveTableBackground,
      visited: 'grey',
      disabled: disabledText,
    },
    border: {
      default: activeBorderColor,
      disabled: inactiveBorderColor,
    },
    chevron: {
      default: 'transparent',
      hover: activeChevronColor,
    },
  },
  typography: {
    fontFamily: [
      '"Roboto"', 
      '"Arial"',
      'sans-serif',
    ].join(","),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        },
        body: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        },
        "*": {
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          py: 1.5,
        },
        main_button: {
          backgroundColor: burgundyBase,
          color: graphiteText,
          '&:hover': {
            backgroundColor: alpha(burgundyBase, 0.8),
          },
          '&.Mui-disabled': {
            backgroundColor: disabledBackground,
            color: disabledText,
            border: `1px solid ${inactiveBorderColor}`,
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
              backgroundColor: inactiveTableBackground,
            },
            '&.visited-row': {
              backgroundColor: graphiteBackground,
              color: 'grey',
            },
            '&:hover': {
              backgroundColor: alpha(burgundyBase, 0.1),
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: `1px solid ${activeBorderColor}`,
          },
        },
        columnHeaderTitle: {
          fontWeight: 'bold',
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
    MuiLink: {
      styleOverrides: {
        root: {
          '&:hover': {
            textDecoration: 'underline',
          }
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: graphiteText,
            '& fieldset': {
              borderColor: activeBorderColor, // Corrected property
            },
            '&:hover fieldset': {
              borderColor: graphiteText, // Corrected property
            },
          },
        },
      },
    },
  },
});

export default darkTheme;
