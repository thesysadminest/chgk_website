import { alpha, getContrastRatio, createTheme } from '@mui/material/styles';

const black1 = '#0B070B';
const black2 = '#251D26';
const black3 = '#29232A'; // graphitebackground
const black4 = '#382E3A'; // advertisementBackground
const black5 = '#4E4450';

const red1 = '#450911';
const red2 = '#780C1B';
const red3 = '#9A0E0E';
const red4 = '#E62727';
const red5 = '#F88E81';

const white1 = '#DBB8BB';
const white2 = '#EDD9DB';
const white3 = '#F5EAEA'; 
const white4 = '#FFFFFF'; // pure white 
const white5 = '#D9D9D9'; // grey

const grey1 = '#999999';

const graphiteBackground = '#29232A';
const inactiveTableBackground = '#4A4A4A';
const advertisementBackground = '#382E3A';

const disabledText = '#BDBDBD';
const disabledBackground = '#F5F5F5';

const greyButton = '#808080';

const inactiveBorderColor = '#E0E0E0';
const activeBorderColor = '#FF0000';

const darkTheme = createTheme({
  palette: {
    default: {
      black1: black1, black2: black2, black3: black3, black4: black4, black5: black5,
      red1: red1, red2: red2, red3: red3, red4: red4, red5: red5,
      white1: white1, white2: white2, white3: white3, white4: white4, white5: white5,
      greyButton: greyButton,
    },
    primary: {
      main: red3,
      light: white3,
      dark: red3,
      hover: red4,
      menu: greyButton,
      contrastText: getContrastRatio(red3, white4) > 4.5 ? white4 : '#000',
    },
    secondary: {
      main: red4,
      light: alpha(red4, 0.5),
      dark: alpha(red4, 0.9),
    },
    background: {
      default: graphiteBackground,
      paper: alpha(graphiteBackground, 0.9),
      window: white5,
      disabled: disabledBackground,
      light: advertisementBackground,
      white: white4,
    },
    text: {
      dark: black2,
      primary: white4,
      secondary: grey1,
      gray: inactiveTableBackground,
      visited: grey1,
      disabled: disabledText,
      light: white5, 
    },
    border: {
      default: activeBorderColor,
      disabled: inactiveBorderColor,
    },
    chevron: {
      default: 'transparent',
      hover: red3,
    },
  },
  typography: {
    fontFamily: [
      '"Roboto"', 
      '"Arial"',
      'sans-serif',
    ].join(","),
  },

  drawers: {
    drawerWidth: 240,
    drawerHeight: 63.8,
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
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          color: white4,
          boxShadow: "0px 0px 20px 5px rgba(0,0,0,0.14)",
          '& .MuiDataGrid-columnHeaders': {},
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: black4,
            color: white3,
            border: 'none',
            '&:hover': {
              backgroundColor: alpha(red3, 0.3),
            },
            '&.MuiDataGrid-columnHeader--sorted': {
              backgroundColor: alpha(red3, 0.3),
            },
            '&.MuiDataGrid-columnHeader--sortable': {
              border: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            border: 'none',
            '&:focus': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-row': {
            border: 'none',
            backgroundColor: black2,
            '&:hover': {
              backgroundColor: red2,
            },
            '&.highlighted-row': {
              backgroundColor: `${red1} !important`,
              '&:hover': {
                backgroundColor: `${red2} !important`,
              }
            },
            '&.Mui-selected': {
              backgroundColor: red2,
              '&:hover': {
                backgroundColor: red2,
              }
            }
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: black4,
          },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: black4,
            padding: '8px 16px',
          },
          '& .MuiDataGrid-menuIcon': {
            color: white4,
          },
          '& .MuiDataGrid-sortIcon': {
            color: white4,
          },
          '& .MuiDataGrid-filterIcon': {
            color: white4,
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-filler': {
            display: 'none',
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: black2,
          },
          '& .MuiRating-root': {
            margin: "0.8rem 0px",
            display: "flex",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: red3,
          color: white4,
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
            color: white5,
          },
        },
        {
          props: { variant: 'outlined-grey' },
          style: {
            color: greyButton,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: greyButton,
            '&:hover': {
              color: red4,
              borderColor: red4,
            },
          },
        },
        {
          props: { variant: 'red' },
          style: {
            backgroundColor: red3,
            color: white4,
            '&:hover': {
              backgroundColor: red4,
            },
            '&:active': {
              backgroundColor: white3,
              color: red3,
            },
            '& .MuiTouchRipple-root': {
              '& .MuiTouchRipple-child': {
                display: 'none',
              }
            },

            '&.Mui-disabled': {
              backgroundColor: grey1,
              color: white5,
              '& .MuiTouchRipple-root': {
                '& .MuiTouchRipple-child': {
                  display: 'none',
                }
              }
            }
          },
        },
        {
          props: { variant: 'lightRed' },
          style: {
            backgroundColor: red4,
            color: white4,
            '&:hover': {
              backgroundColor: red5,
            },
            '&:active': {
              backgroundColor: white4,
              color: red4,
            },
            '& .MuiTouchRipple-root': {
              '& .MuiTouchRipple-child': {
                display: 'none',
              }
            }
          },
        },
        {
          props: { variant: 'disabled-dark' },
          style: {
            '&.Mui-disabled': {
              backgroundColor: black2,
              color: black5,
              '& .MuiTouchRipple-root': {
                '& .MuiTouchRipple-child': {
                  display: 'none',
                }
              }
            }
          },
        },
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
          borderRadius: 10,
        },
      },
      variants: [
        {
          props: { variant: 'grey' },
          style: {
            color: getContrastRatio(red3, white4) > 4.5 ? white4 : '#000',
            backgroundColor: 'transparent',
            '&:hover': {
              transition: 'box-shadow 0.1s ease',
              boxShadow: `inset 0 0 0 2px ${black5}`,
            },
          },
        },
        {
          props: { variant: 'red' },
          style: {
            color: white4,
            backgroundColor: red3,
            '&:hover': {
              transition: 'box-shadow 0.1s ease',
              backgroundColor: red3,
              boxShadow: `inset 0 0 0 2px ${red4}`,
            },
          },
        }
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: black4,
          color: white4,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
      // IMPORTANT!
      // use "variant_p" instead of "variant"
      variants: [
        {
          props: { variant_p: "chip" },
          style: {
            display: 'flex',
            justifyContent: 'center',
            color: greyButton,
            fontSize: "medium",
            borderColor: greyButton,
            borderStyle: "ridge",
            borderRadius: "15px",
            borderWidth: "1px",
            padding: "4px 8px 4px 8px",
          },
        },
      ],
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: graphiteBackground,
          color: white4,
          '& ::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: white4,
          '&:hover': {
            backgroundColor: alpha(red3, 0.1),
          },
          '& .MuiSvgIcon-root': {
            color: white4,
          },
        },
      },
      
    },

    MuiTextField: {
      // IMPORTANT!
      // don't ask me why, but use "variant_tf" instead of "variant"
      variants: [
        {
          props: { variant_tf: "light" },
          style: {
            "& .MuiInputLabel-root": {
              color: black5,
            },
            "& .MuiOutlinedInput-root": {
              "& .MuiOutlinedInput-input": {
                color: black2,
              },
              
              "& fieldset": {
                borderColor: black5,
              },
              // "&:hover fieldset": {
              //   borderColor: white1,
              // }
            }
          },
        },
        {
          props: { variant_tf: "dark" },
          style: {
            "& .MuiInputLabel-root": {
              color: greyButton,
            },
            "& .MuiOutlinedInput-root": {
              "& .MuiOutlinedInput-input": {
                color: white4,
              },
              
              "& fieldset": {
                borderColor: black5,
              },
              // "&:hover fieldset": {
              //   borderColor: white1,
              // }
            }
          },
        },
      ],
    },

    MuiRating: {
      styleOverrides: {
        root: {
          color: red4,
          '& .MuiRating-iconEmpty': {
            color: alpha(white3, 1),
          },
          '& .MuiRating-iconFilled': {
            color: red4, 
          },
        },
        icon: {
          fontSize: '1.2rem',
        },
        iconEmpty: {
          color: alpha(white4, 0.3), 
        },
        iconFilled: {
          color: red3,
        },
      },
    }
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: 'none',
      },
    },
  },
});

export default darkTheme;
