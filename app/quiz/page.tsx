"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type QuizData = {
  question: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
};

interface UserInfo {
  name: string;
  email: string;
}

export default function Quiz() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [cheater, setCheater] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [quizData, setQuizData] = useState<QuizData[]>([]);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      router.push("/");
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "https://api.jsonbin.io/v3/b/675a8dafacd3cb34a8b8497f",
          {
            headers: {
              "X-Master-Key":
                "$2a$10$Rusziepf2wXA6TC6ngVL4uxfLWmKDTYM2l/DaRaQ7e5wGGV/cwSm6",
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheater(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    setQuizData((prevData) => [
      ...prevData,
      {
        question: questions[currentQuestionIndex].question,
        selectedAnswer,
        correctAnswer: questions[currentQuestionIndex].answer,
        isCorrect: selectedAnswer === questions[currentQuestionIndex].answer,
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsQuizFinished(true);
      sendResultsToEmail();
    }
  };

  const sendResultsToEmail = async () => {
    if (!userInfo) return;

    const formData = new FormData();
    formData.append("name", userInfo.name);
    formData.append("email", userInfo.email);
    formData.append("score", score.toString());
    formData.append("totalQuestions", questions.length.toString());
    formData.append("cheater", cheater ? "Yes" : "No");

    quizData.forEach((data, index) => {
      formData.append(`question${index + 1}`, data.question);
      formData.append(`answer${index + 1}`, data.selectedAnswer || "");
      formData.append(`correctAnswer${index + 1}`, data.correctAnswer);
      formData.append(`isCorrect${index + 1}`, data.isCorrect ? "Yes" : "No");
    });

    formData.append("access_key", "b356b3b3-d5d9-494b-a082-a6420a2acbc3");

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
                    className={`my-2 p-3 rounded-lg cursor-pointer ${
                      selectedAnswer === option
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
              <Button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="mt-4"
              >
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
