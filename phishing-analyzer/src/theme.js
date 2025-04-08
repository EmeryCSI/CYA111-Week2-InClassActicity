import { createTheme } from "@mui/material/styles";

const rtcColors = {
  blue: "#002d56",
  maroon: "#98002e",
  tan: "#b9ab97",
  gray: "#717073",
  cream: "#e9e3dc",
};

export const theme = createTheme({
  palette: {
    primary: {
      main: rtcColors.blue,
    },
    secondary: {
      main: rtcColors.maroon,
    },
    background: {
      default: rtcColors.cream,
      paper: "#ffffff",
    },
    text: {
      primary: rtcColors.blue,
      secondary: rtcColors.gray,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: rtcColors.blue,
    },
    h2: {
      fontWeight: 600,
      color: rtcColors.blue,
    },
    body1: {
      color: rtcColors.gray,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});
