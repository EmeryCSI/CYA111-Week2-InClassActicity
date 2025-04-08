import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  Alert,
  Container,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeleteIcon from "@mui/icons-material/Delete";
import phishingAttempts from "../data/phishingAttempts.json";
import { useNavigate } from "react-router-dom";

const PhishingActivity = () => {
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [selectedLines, setSelectedLines] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [studentResponses, setStudentResponses] = useState(() => {
    // Load from localStorage or initialize empty array
    const saved = localStorage.getItem("phishingActivityResponses");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (currentAttempt === 0 && studentResponses.length === 0) {
      localStorage.removeItem("phishingActivityResponses");
    } else {
      localStorage.setItem(
        "phishingActivityResponses",
        JSON.stringify(studentResponses)
      );
    }
  }, [studentResponses, currentAttempt]);

  const handleLineToggle = (lineIndex) => {
    setSelectedLines((prev) => {
      if (prev.includes(lineIndex)) {
        return prev.filter((num) => num !== lineIndex);
      } else {
        return [...prev, lineIndex];
      }
    });
  };

  const handleSubmit = () => {
    const attempt = phishingAttempts.attempts[currentAttempt];
    const isLegitimate = attempt.isLegitimate;
    const totalLines = attempt.content.length;

    // For each line, determine if it was correctly handled
    const correctLines = attempt.content.reduce((count, _, lineIndex) => {
      const isRedFlag = attempt.redFlags.some(
        (flag) => flag.lineIndex === lineIndex
      );
      const isSelected = selectedLines.includes(lineIndex);

      // Line is correct if:
      // - It's a red flag and was selected, OR
      // - It's not a red flag and wasn't selected
      if ((isRedFlag && isSelected) || (!isRedFlag && !isSelected)) {
        return count + 1;
      }
      return count;
    }, 0);

    // Calculate score
    const score = {
      attemptId: attempt.id,
      selectedLines,
      correctLines: attempt.redFlags.map((flag) => flag.lineIndex),
      isLegitimate,
      timestamp: new Date().toISOString(),
      totalLines,
      correctLineCount: correctLines,
      accuracy: (correctLines / totalLines) * 100,
      // Keep these for detailed feedback
      truePositives: selectedLines.filter((line) =>
        attempt.redFlags.some((flag) => flag.lineIndex === line)
      ).length,
      falsePositives: selectedLines.filter(
        (line) => !attempt.redFlags.some((flag) => flag.lineIndex === line)
      ).length,
      falseNegatives: attempt.redFlags.filter(
        (flag) => !selectedLines.includes(flag.lineIndex)
      ).length,
      correctlyIdentifiedLegitimate: isLegitimate && selectedLines.length === 0,
    };

    setStudentResponses((prev) => [...prev, score]);
    setShowFeedback(true);
  };

  const handleMarkAsValid = () => {
    const attempt = phishingAttempts.attempts[currentAttempt];
    const isLegitimate = attempt.isLegitimate;
    const totalLines = attempt.content.length;

    // If marked as valid, count lines as correct if they shouldn't have been flagged
    const correctLines = attempt.content.reduce((count, _, lineIndex) => {
      const isRedFlag = attempt.redFlags.some(
        (flag) => flag.lineIndex === lineIndex
      );
      // Line is correct if it's not a red flag (since we're marking as valid)
      return count + (isRedFlag ? 0 : 1);
    }, 0);

    const score = {
      attemptId: attempt.id,
      selectedLines: [],
      correctLines: attempt.redFlags.map((flag) => flag.lineIndex),
      isLegitimate,
      timestamp: new Date().toISOString(),
      totalLines,
      correctLineCount: correctLines,
      accuracy: (correctLines / totalLines) * 100,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: attempt.redFlags.length,
      correctlyIdentifiedLegitimate: isLegitimate,
    };

    setStudentResponses((prev) => [...prev, score]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentAttempt + 1 < phishingAttempts.attempts.length) {
      setCurrentAttempt(currentAttempt + 1);
      setSelectedLines([]);
      setShowFeedback(false);
      console.log("LocalStorage after attempt:", localStorage);
    } else {
      navigate("/verify");
    }
  };

  const currentMessage = phishingAttempts.attempts[currentAttempt];

  const calculateResults = () => {
    // Calculate total lines across all attempts
    const totalLines = phishingAttempts.attempts.reduce(
      (sum, attempt) => sum + attempt.content.length,
      0
    );

    // Calculate total correctly handled lines
    const totalCorrectLines = studentResponses.reduce(
      (sum, response) => sum + response.correctLineCount,
      0
    );

    const overallAccuracy = (totalCorrectLines / totalLines) * 100;

    return {
      totalAttempts: studentResponses.length,
      totalLines,
      correctLines: totalCorrectLines,
      overallAccuracy,
      // Keep these for detailed feedback
      correctlyIdentified: studentResponses.reduce((sum, response) => {
        const attempt = phishingAttempts.attempts.find(
          (a) => a.id === response.attemptId
        );
        if (attempt.isLegitimate) {
          return sum + (response.correctlyIdentifiedLegitimate ? 1 : 0);
        }
        return sum + response.truePositives;
      }, 0),
      missedRedFlags: studentResponses.reduce((sum, response) => {
        const attempt = phishingAttempts.attempts.find(
          (a) => a.id === response.attemptId
        );
        if (attempt.isLegitimate) {
          return sum + (response.correctlyIdentifiedLegitimate ? 0 : 1);
        }
        return sum + response.falseNegatives;
      }, 0),
    };
  };

  const renderResults = () => {
    const results = calculateResults();

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Phishing Analysis Results
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overall Performance
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle1">Overall Accuracy</Typography>
                <Typography variant="h4">
                  {results.overallAccuracy.toFixed(1)}%
                </Typography>
                <Typography variant="caption">
                  {results.correctLines} out of {results.totalLines} lines
                  correct
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle1">
                  Correctly Identified
                </Typography>
                <Typography variant="h4">
                  {results.correctlyIdentified}
                </Typography>
                <Typography variant="caption">
                  suspicious items found
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle1">Missed Red Flags</Typography>
                <Typography variant="h4">{results.missedRedFlags}</Typography>
                <Typography variant="caption">
                  potential threats missed
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Attempt Details
        </Typography>
        {studentResponses.map((response, index) => {
          const attempt = phishingAttempts.attempts.find(
            (a) => a.id === response.attemptId
          );

          return (
            <Paper key={response.attemptId} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">Attempt {index + 1}</Typography>
              <Typography variant="body1">
                Accuracy: {response.accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {response.correctLineCount} out of {response.totalLines} lines
                correct
              </Typography>
              {attempt.isLegitimate ? (
                <Typography
                  variant="body2"
                  color={
                    response.correctlyIdentifiedLegitimate
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {response.correctlyIdentifiedLegitimate
                    ? "Correctly identified as legitimate"
                    : "Incorrectly flagged as suspicious"}
                </Typography>
              ) : (
                <Typography variant="body2">
                  Correct: {response.truePositives} | Missed:{" "}
                  {response.falseNegatives} | Incorrect:{" "}
                  {response.falsePositives}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
    );
  };

  if (!currentMessage) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Activity Complete!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You have completed all phishing attempts. Your responses have been
            saved.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCurrentAttempt(0);
              setStudentResponses([]);
            }}
          >
            Start Over
          </Button>
          <Button
            variant="outlined"
            startIcon={<BarChartIcon />}
            onClick={() => setShowResults(true)}
            sx={{ ml: 2 }}
          >
            View Results
          </Button>
        </Paper>
      </Container>
    );
  }

  const renderLine = (content, lineIndex) => {
    const isSelected = selectedLines.includes(lineIndex);
    const isCorrect = currentMessage.redFlags.some(
      (flag) => flag.lineIndex === lineIndex
    );
    const showFeedbackIcon = showFeedback && (isSelected || isCorrect);
    const redFlag = currentMessage.redFlags.find(
      (flag) => flag.lineIndex === lineIndex
    );

    // Determine the feedback state
    let feedbackState = "none";
    if (showFeedback) {
      if (isCorrect && isSelected) {
        feedbackState = "correct";
      } else if (isCorrect && !isSelected) {
        feedbackState = "missed";
      } else if (!isCorrect && isSelected) {
        feedbackState = "incorrect";
      }
    }

    return (
      <Box
        key={lineIndex}
        sx={{
          display: "flex",
          flexDirection: "column",
          mb: 1,
          backgroundColor: isSelected
            ? "rgba(255, 235, 59, 0.3)"
            : "transparent",
          p: 1,
          borderRadius: 1,
          border: showFeedback
            ? `2px solid ${
                feedbackState === "correct"
                  ? "#4caf50"
                  : feedbackState === "missed"
                  ? "#f44336"
                  : feedbackState === "incorrect"
                  ? "#ff9800"
                  : "transparent"
              }`
            : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Typography
            variant="body2"
            sx={{
              minWidth: "30px",
              color: "text.secondary",
              mr: 2,
            }}
          >
            {lineIndex + 1}
          </Typography>
          <Typography variant="body1" sx={{ flex: 1 }}>
            {content}
          </Typography>
          {!showFeedback && (
            <Tooltip title={isSelected ? "Remove flag" : "Mark as suspicious"}>
              <IconButton
                size="small"
                onClick={() => handleLineToggle(lineIndex)}
                color={isSelected ? "primary" : "default"}
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
          )}
          {showFeedbackIcon && (
            <Tooltip
              title={
                feedbackState === "correct"
                  ? "Correctly identified"
                  : feedbackState === "missed"
                  ? "Missed red flag"
                  : feedbackState === "incorrect"
                  ? "Incorrectly flagged"
                  : ""
              }
            >
              {feedbackState === "correct" ? (
                <CheckCircleIcon color="success" />
              ) : feedbackState === "missed" ? (
                <CancelIcon color="error" />
              ) : feedbackState === "incorrect" ? (
                <CancelIcon color="warning" />
              ) : null}
            </Tooltip>
          )}
        </Box>
        {showFeedback && redFlag && (
          <Box
            sx={{
              mt: 1,
              ml: "38px",
              p: 1,
              bgcolor:
                feedbackState === "missed"
                  ? "error.light"
                  : feedbackState === "incorrect"
                  ? "warning.light"
                  : "info.light",
              borderRadius: 1,
              color:
                feedbackState === "missed"
                  ? "error.contrastText"
                  : feedbackState === "incorrect"
                  ? "warning.contrastText"
                  : "info.contrastText",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {feedbackState === "missed"
                ? "Missed Red Flag: "
                : feedbackState === "incorrect"
                ? "Incorrectly Flagged: "
                : "Red Flag: "}
              {redFlag.description}
            </Typography>
            <Typography variant="caption">{redFlag.details}</Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderFeedback = () => {
    const lastResponse = studentResponses[studentResponses.length - 1];
    const attempt = phishingAttempts.attempts[currentAttempt];
    const isLegitimate = attempt.isLegitimate;

    // Calculate accuracy for this attempt
    let accuracy;
    if (isLegitimate) {
      // If it's legitimate and correctly identified (no flags), accuracy is 100%
      accuracy = lastResponse.correctlyIdentifiedLegitimate ? 100 : 0;
    } else {
      const totalFlags =
        lastResponse.truePositives +
        lastResponse.falsePositives +
        lastResponse.falseNegatives;
      accuracy =
        totalFlags > 0 ? (lastResponse.truePositives / totalFlags) * 100 : 0;
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Results
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Accuracy: {accuracy.toFixed(1)}%
          </Typography>
          {isLegitimate ? (
            <List>
              <ListItem>
                <ListItemText
                  primary={
                    lastResponse.correctlyIdentifiedLegitimate
                      ? "Correctly identified as legitimate message"
                      : "Incorrectly flagged as suspicious"
                  }
                  secondary={
                    lastResponse.correctlyIdentifiedLegitimate
                      ? "Good job! You correctly identified this as a legitimate message."
                      : "This was actually a legitimate message. Look for more specific red flags in the future."
                  }
                />
              </ListItem>
            </List>
          ) : (
            <List>
              <ListItem>
                <ListItemText
                  primary="Correctly identified red flags"
                  secondary={lastResponse.truePositives}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Missed red flags"
                  secondary={lastResponse.falseNegatives}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Incorrectly flagged lines"
                  secondary={lastResponse.falsePositives}
                />
              </ListItem>
            </List>
          )}
        </Paper>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          sx={{ mt: 2 }}
        >
          {currentAttempt + 1 < phishingAttempts.attempts.length
            ? "Next Attempt"
            : "View Results"}
        </Button>
      </Box>
    );
  };
  //UI Starts Here
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="h4">
            Click the Flag Icon next to any lines that could indicate the
            message is a Phishing Attempt
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="h5">
            Message {currentAttempt + 1} of {phishingAttempts.attempts.length}
          </Typography>{" "}
          <Typography
            variant="subtitle1"
            sx={{
              bgcolor:
                currentMessage.type === "email"
                  ? "primary.main"
                  : "secondary.main",
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              textTransform: "uppercase",
            }}
          >
            {currentMessage.type}
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ mt: 2 }}>
            {currentMessage.content.map((line, index) =>
              renderLine(line, index)
            )}
          </Box>
        </Paper>

        {!showFeedback ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={selectedLines.length === 0}
            >
              Submit Analysis
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={handleMarkAsValid}
            >
              Mark as Valid Message
            </Button>
          </Box>
        ) : (
          renderFeedback()
        )}
      </Paper>
    </Container>
  );
};

export default PhishingActivity;
