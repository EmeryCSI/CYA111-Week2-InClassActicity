import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Home = () => {
  const navigate = useNavigate();

  const handleStartActivity = () => {
    console.log("LocalStorage Contents:", localStorage);
    localStorage.clear();
    navigate("/activity");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Welcome to Phishing Analyzer
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Test your skills in identifying phishing attempts in emails and SMS
            messages. Learn to spot the red flags and protect yourself from
            online scams. On the following screens CLICK THE FLAG icon on any
            lines which might indicate that a message is a phish attempt.
          </Typography>
          <Button
            onClick={handleStartActivity}
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            Start Activity
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
