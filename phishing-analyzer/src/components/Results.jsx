import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeleteIcon from "@mui/icons-material/Delete";
import phishingAttempts from "../data/phishingAttempts.json";

const Results = () => {
  const navigate = useNavigate();
  const results = JSON.parse(
    localStorage.getItem("phishingActivityResponses") || "[]"
  );

  const calculateOverallStats = () => {
    if (results.length === 0) {
      return {
        totalAttempts: 0,
        totalRedFlags: 0,
        correctlyIdentified: 0,
        incorrectlyFlagged: 0,
        missedFlags: 0,
        accuracy: 0,
      };
    }

    const totalAttempts = results.length;
    let totalRedFlags = 0;
    let correctlyIdentified = 0;
    let incorrectlyFlagged = 0;
    let missedFlags = 0;

    results.forEach((result) => {
      const attempt = phishingAttempts.attempts.find(
        (a) => a.id === result.attemptId
      );
      if (attempt) {
        totalRedFlags += attempt.redFlags.length;
        correctlyIdentified += result.truePositives;
        incorrectlyFlagged += result.falsePositives;
        missedFlags += result.falseNegatives;
      }
    });

    const accuracy =
      results.reduce((sum, result) => sum + result.accuracy, 0) /
        results.length || 0;

    return {
      totalAttempts,
      totalRedFlags,
      correctlyIdentified,
      incorrectlyFlagged,
      missedFlags,
      accuracy,
    };
  };

  const calculateAttemptAccuracy = (result) => {
    const attempt = phishingAttempts.attempts.find(
      (a) => a.id === result.attemptId
    );
    if (!attempt) return 0;

    return result.accuracy;
  };

  const stats = calculateOverallStats();

  const handleStartNewAttempt = () => {
    localStorage.removeItem("phishingActivityResponses");
    navigate("/");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <BarChartIcon />
          <Typography variant="h4">Your Phishing Analysis Results</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Overall Performance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: "#e3f2fd", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Accuracy
                    </Typography>
                    <Typography variant="h4">
                      {stats.accuracy.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption">
                      average accuracy across all attempts
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                    <Typography variant="body2" color="text.secondary">
                      Correctly Identified Flags
                    </Typography>
                    <Typography variant="h4">
                      {stats.correctlyIdentified}
                    </Typography>
                    <Typography variant="caption">
                      suspicious items found
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: "#ffebee" }}>
                    <Typography variant="body2" color="text.secondary">
                      Missed Red Flags
                    </Typography>
                    <Typography variant="h4">{stats.missedFlags}</Typography>
                    <Typography variant="caption">
                      potential threats missed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Attempt Details
              </Typography>
              <List>
                {results.length > 0 ? (
                  results.map((result, index) => {
                    const attempt = phishingAttempts.attempts.find(
                      (a) => a.id === result.attemptId
                    );
                    const accuracy = calculateAttemptAccuracy(result);

                    return (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">
                                Attempt {index + 1}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  bgcolor:
                                    attempt.type === "email"
                                      ? "primary.main"
                                      : "secondary.main",
                                  color: "white",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  textTransform: "uppercase",
                                }}
                              >
                                {attempt.type}
                              </Typography>
                              {attempt.isLegitimate && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: "success.main",
                                    color: "white",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                  }}
                                >
                                  Legitimate
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Accuracy: {accuracy.toFixed(1)}%
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {result.correctLineCount} out of{" "}
                                {result.totalLines} lines correct
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {result.truePositives > 0 ||
                                result.falseNegatives > 0 ||
                                result.falsePositives > 0
                                  ? `Correct: ${result.truePositives} | Missed: ${result.falseNegatives} | Incorrect: ${result.falsePositives}`
                                  : "No flags identified"}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="No attempts completed yet" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleStartNewAttempt}
            color="error"
            sx={{ mr: 2 }}
          >
            Clear Results
          </Button>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Results;
