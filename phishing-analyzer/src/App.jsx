import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import Home from "./components/Home";
import PhishingActivity from "./components/PhishingActivity";
import Results from "./components/Results";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/activity" element={<PhishingActivity />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
