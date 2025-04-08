import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const VerifySubmit = () => {
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate("/results");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            You've completed all phishing attempts in the activity. Your
            responses have been saved and analyzed.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BarChartIcon />}
            onClick={handleViewResults}
          >
            View Results
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifySubmit;
