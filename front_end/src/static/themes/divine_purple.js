
import { alpha, getContrastRatio } from '@mui/material/styles';

const violetBase = '#7F00FF';
const violetMain = alpha(violetBase, 0.7);

const purpleTheme = {
  palette: {
    primary: {
      main: violetMain,
      light: alpha(violetBase, 0.3),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },

  components: {
      MuiButtonBase: {
          styleOverrides: {
              root: {
                  backgroundColor: violetMain,
                  borderRadius: 10,
                  variants: 
                  [ 
                      {
                         props: 
                          { variant: 'accent' }, 
                          style: ({ theme }) => ({ 
                              backgroundColor: theme.palette.primary.light, 
                          }) 
                      }, 
                      { 
                          props: 
                      { variant: 'default' }, 
                      }, 
                  ]
              }
          }
      }
  },
}

export default purpleTheme;