import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const black1 = '#0B070B';
const black2 = '#251D26';
const black3 = '#29232A'; // graphitebackground
const black4 = '#382E3A'; // advertisementBackground
const black5 = '#4E4450';

const red1 = '#450911';
const red2 = '#780C1B';
const red3 = '#9A0E0E'; // burgundyBase
const red4 = '#E62727';
const red5 = '#F88E81';

const white1 = '#DBB8BB';
const white2 = '#EDD9DB';
const white3 = '#F5EAEA'; // burgundyClicked
const white4 = '#FFFFFF'; // pure white  // graphiteText
const white5 = '#D9D9D9'; // grey    // windowBackground

const burgundyBase = '#9A0E0E';
const burgundyHover = '#CD2626';
const burgundyClicked = "#F5EAEA";
const lightGrey = '#D3D3D3';

const graphiteBackground = '#29232A';
const windowBackground = '#D9D9D9';
const inactiveTableBackground = '#4A4A4A';
const advertisementBackground = '#382E3A';

const graphiteText = '#FFFFFF';
const disabledText = '#BDBDBD';
const disabledBackground = '#F5F5F5';

const greyButton = '#808080';

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
      menu: greyButton,
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
      white: white4,
    },
    text: {
      primary: graphiteText,
      secondary: alpha(graphiteText, 0.7),
      gray: inactiveTableBackground,
      visited: 'grey',
      disabled: disabledText,
      light: lightGrey, 
    },
    button: {
      grey: {
        main: greyButton,
        light: lightGrey,
        contrastText: graphiteText,
      },
      red: {
        main: burgundyBase,
        light: burgundyClicked,
        hover: burgundyHover,
        contrastText: graphiteText,
      }
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
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
        body: {
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
        "*": {
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          overflowX: 'hidden',
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
    // Стили для DataGrid
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          color: graphiteText,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: black4,
            borderBottom: `1px solid ${activeBorderColor}`,
          },
          '& .MuiDataGrid-columnHeader': {
            '&:hover': {
              backgroundColor: alpha(burgundyBase, 0.2),
            },
            '&.MuiDataGrid-columnHeader--sorted': {
              backgroundColor: alpha(burgundyBase, 0.3),
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(inactiveBorderColor, 0.5)}`,
            '&:focus': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: alpha(burgundyBase, 0.1),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(burgundyBase, 0.2),
              '&:hover': {
                backgroundColor: alpha(burgundyBase, 0.3),
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${activeBorderColor}`,
            backgroundColor: black4,
          },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: black4,
            padding: '8px 16px',
          },
          '& .MuiDataGrid-menuIcon': {
            color: graphiteText,
          },
          '& .MuiDataGrid-sortIcon': {
            color: graphiteText,
          },
          '& .MuiDataGrid-filterIcon': {
            color: graphiteText,
          },
          '& .MuiDataGrid-columnSeparator': {
            color: inactiveBorderColor,
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: alpha(graphiteBackground, 0.8),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: burgundyBase,
          color: graphiteText,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'grey' },
          style: {
            backgroundColor: greyButton,
            color: graphiteText,
            '&:hover': {
              backgroundColor: lightGrey,
              color: graphiteText,
            },
          },
        },
        {
          props: { variant: 'red' },
          style: {
            backgroundColor: burgundyBase,
            color: graphiteText,
            '&:hover': {
              backgroundColor: burgundyClicked,
              color: burgundyBase,
            },
          },
        }
      ],
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          py: 1.5,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.MuiListItemButton-grey': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: lightGrey,
            },
          },
          '&.MuiListItemButton-red': {
            backgroundColor: burgundyBase,
            '&:hover': {
              backgroundColor: burgundyClicked,
              color: burgundyBase,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(graphiteBackground, 0.8),
          color: graphiteText,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: graphiteBackground,
          color: graphiteText,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: graphiteText,
            '& fieldset': {
              borderColor: activeBorderColor, 
            },
            '&:hover fieldset': {
              borderColor: graphiteText, 
            },
          },
        },
      },
    },
  },
});

export default darkTheme;