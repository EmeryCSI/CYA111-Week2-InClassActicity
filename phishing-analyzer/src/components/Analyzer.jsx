import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Analyzer = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Phishing Analysis
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
            }}
          >
            This is where the analysis will take place.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 4,
              py: 1.5,
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Analyzer;
