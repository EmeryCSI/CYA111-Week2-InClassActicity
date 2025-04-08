import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeleteIcon from "@mui/icons-material/Delete";
import phishingAttempts from "../data/phishingAttempts.json";

const PhishingResults = ({ open, onClose, results }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      console.log("Results Data:", results);
      console.log("Attempts Data:", phishingAttempts.attempts);
    }
  }, [open, results]);

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
    //go through results and get the average of the sum of the accuracy property
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BarChartIcon />
          <Typography variant="h6">Your Phishing Analysis Results</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Message Types Summary
              </Typography>
              <Box display="flex" gap={2}>
                <Typography variant="body2">
                  Emails:{" "}
                  {
                    results.filter(
                      (r) =>
                        phishingAttempts.attempts.find(
                          (a) => a.id === r.attemptId
                        )?.type === "email"
                    ).length
                  }
                </Typography>
                <Typography variant="body2">
                  SMS:{" "}
                  {
                    results.filter(
                      (r) =>
                        phishingAttempts.attempts.find(
                          (a) => a.id === r.attemptId
                        )?.type === "sms"
                    ).length
                  }
                </Typography>
                <Typography variant="body2">
                  Legitimate Messages:{" "}
                  {
                    results.filter(
                      (r) =>
                        phishingAttempts.attempts.find(
                          (a) => a.id === r.attemptId
                        )?.isLegitimate
                    ).length
                  }
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Overall Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Accuracy
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.accuracy}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body1" align="right">
                  {stats.accuracy.toFixed(1)}%
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                    <Typography variant="body2" color="text.secondary">
                      Correctly Identified
                    </Typography>
                    <Typography variant="h4">
                      {stats.correctlyIdentified}
                    </Typography>
                    <Typography variant="caption">
                      {stats.totalRedFlags > 0
                        ? `out of ${stats.totalRedFlags} red flags`
                        : "No red flags identified"}
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
                      {stats.missedFlags === 1
                        ? "potential threat missed"
                        : "potential threats missed"}
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
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => {
            localStorage.removeItem("phishingActivityResponses");
            onClose();
            navigate("/");
          }}
          color="error"
        >
          Clear Results
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhishingResults;
