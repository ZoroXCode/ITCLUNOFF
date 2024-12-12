"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Quiz() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [cheater, setCheater] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [quizData, setQuizData] = useState([]);

  // Fetch user info from localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      router.push("/"); // Redirect to home page if no user info
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));

    // Fetch quiz data from JsonBin
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "https://api.jsonbin.io/v3/b/675a8dafacd3cb34a8b8497f", // Replace with your JsonBin API URL
          {
            headers: {
              "X-Master-Key":
                "$2a$10$Rusziepf2wXA6TC6ngVL4uxfLWmKDTYM2l/DaRaQ7e5wGGV/cwSm6", // Replace with your JsonBin master key
            },
          }
        );
        setQuestions(response.data.record);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [router]);

  // Track tab visibility changes (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheater(true); // If the tab is hidden, mark as cheater
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // Next question logic
  const nextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    setQuizData([
      ...quizData,
      {
        question: questions[currentQuestionIndex].question,
        selectedAnswer: selectedAnswer,
        correctAnswer: questions[currentQuestionIndex].answer,
        isCorrect: selectedAnswer === questions[currentQuestionIndex].answer,
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); // Reset selected answer for next question
    } else {
      setIsQuizFinished(true);
      sendResultsToEmail();
    }
  };

  const sendResultsToEmail = async () => {
    const formData = new FormData();
    formData.append("name", userInfo.name);
    formData.append("email", userInfo.email);
    formData.append("score", score);
    formData.append("totalQuestions", questions.length);
    formData.append("cheater", cheater ? "Yes" : "No");

    quizData.forEach((data, index) => {
      formData.append(`question${index + 1}`, data.question);
      formData.append(`answer${index + 1}`, data.selectedAnswer);
      formData.append(`correctAnswer${index + 1}`, data.correctAnswer);
      formData.append(`isCorrect${index + 1}`, data.isCorrect ? "Yes" : "No");
    });

    formData.append("access_key", "b356b3b3-d5d9-494b-a082-a6420a2acbc3"); // API key here

    try {
      const response = await axios.post(
        "https://api.web3forms.com/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Your quiz results have been sent!");
      } else {
        alert("Failed to send results. Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending data to Web3Forms:", error);
      alert("Error sending data. Please try again later.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!questions.length || !userInfo) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="min-w-[400px] w-full p-4 lg:max-w-[600px]">
        <CardTitle className="text-2xl text-center mb-6">Quiz</CardTitle>
        <CardContent>
          {!isQuizFinished ? (
            <>
              <h3>{currentQuestion?.question}</h3>
              <div className="flex flex-col gap-2">
                {currentQuestion?.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className="my-2 bg-accent p-3 rounded-lg"
                  >
                    {option}
                  </div>
                ))}
              </div>
              <Button onClick={nextQuestion} disabled={!selectedAnswer}>
                Next
              </Button>
            </>
          ) : (
            <div>
              <h2>Quiz Finished!</h2>
              <p>
                Your score: {score} / {questions.length}
              </p>
              <p>Cheater: {cheater ? "Yes" : "No"}</p>
              <p>Name: {userInfo.name}</p>
              <p>Email: {userInfo.email}</p>
              <p>Correct Answers: {score}</p>
              <p>Incorrect Answers: {questions.length - score}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
