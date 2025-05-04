"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { CountdownTimer } from "@/ui/CountdownTimer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Zap, Trophy, Badge as BadgeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export default function QuizDisplay({ quizId, onComplete }) {
    const router = useRouter();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    // Helper function to get difficulty badge styles and icon
    const getDifficultyBadge = (difficulty) => {
        let color = "";
        let icon = null;
        switch (difficulty) {
            case "easy":
                color = "bg-green-100 text-green-700 hover:bg-green-100";
                icon = _jsx(Zap, { className: "h-3 w-3 mr-1" });
                break;
            case "medium":
                color = "bg-amber-100 text-amber-700 hover:bg-amber-100";
                icon = _jsx(BadgeIcon, { className: "h-3 w-3 mr-1" });
                break;
            case "hard":
                color = "bg-red-100 text-red-700 hover:bg-red-100";
                icon = _jsx(Trophy, { className: "h-3 w-3 mr-1" });
                break;
            default:
                color = "bg-slate-100 text-slate-700";
                break;
        }
        return { color, icon };
    };
    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`/api/quiz/${quizId}`);
                if (!response.ok) {
                    throw new Error("Failed to load quiz");
                }
                const data = await response.json();
                setQuiz(data);
                // Initialize user answers
                const initialAnswers = data.questions.map((q) => ({
                    questionId: q.id,
                    userAnswer: "",
                }));
                setUserAnswers(initialAnswers);
                // Set timer if quiz has a time limit
                if (data.timeLimit) {
                    setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
                }
                setStartTime(Date.now());
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            }
            finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);
    // Handle timer completion
    const handleTimerComplete = () => {
        submitQuiz();
    };
    // Handle time warning
    const handleTimeWarning = () => {
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000); // Hide after 5 seconds
    };
    // Handle answer change
    const handleAnswerChange = (answer) => {
        if (!quiz)
            return;
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = {
            questionId: quiz.questions[currentQuestionIndex].id,
            userAnswer: answer,
        };
        setUserAnswers(newAnswers);
    };
    // Navigation
    const goToNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };
    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    // Submit quiz
    const submitQuiz = async () => {
        if (!quiz || submitting)
            return;
        setSubmitting(true);
        try {
            // Calculate time taken
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            const response = await fetch(`/api/quiz/${quizId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    answers: userAnswers,
                    timeTaken,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to submit quiz");
            }
            const result = await response.json();
            // Call onComplete callback with the result ID
            if (onComplete) {
                onComplete(result.resultId);
            }
            else {
                // Navigate to results page
                router.push(`/quiz/${quizId}/results?resultId=${result.resultId}`);
            }
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "An error occurred during submission");
            setSubmitting(false);
        }
    };
    // Loading state
    if (loading) {
        return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Loading Quiz..." }), _jsx(CardDescription, { children: "Please wait while we load your quiz" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-4 w-full bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-20 w-full bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-12 w-full bg-gray-200 rounded animate-pulse" })] }) })] }));
    }
    // Error state
    if (error || !quiz) {
        return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Error" }), _jsx(CardDescription, { children: "There was a problem loading the quiz" })] }), _jsx(CardContent, { children: _jsx("p", { className: "text-red-500", children: error || "Quiz data not available" }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", onClick: () => router.back(), children: "Go Back" }) })] }));
    }
    // Current question
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex]?.userAnswer || "";
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: quiz.title }), timeRemaining !== null && (_jsx(CountdownTimer, { initialSeconds: timeRemaining, onComplete: handleTimerComplete, warningThreshold: 120, dangerThreshold: 60, size: "lg", onWarningThreshold: () => handleTimeWarning() }))] }), _jsx(CardDescription, { children: quiz.description }), showTimeWarning && (_jsxs(Alert, { className: "mt-2 bg-amber-50 text-amber-800 border-amber-200", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Time is running out!" }), _jsx(AlertDescription, { children: "You have less than 2 minutes remaining to complete this quiz." })] })), _jsxs("div", { className: "pt-2", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsxs("span", { children: ["Question ", currentQuestionIndex + 1, " of ", quiz.questions.length] }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), _jsx(Progress, { value: progress })] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-medium", children: currentQuestion.questionText }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsxs("span", { children: [currentQuestion.points, " point", currentQuestion.points !== 1 ? "s" : ""] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: currentQuestion.answerType === "multiple_choice"
                                            ? "Choose one option"
                                            : currentQuestion.answerType === "true_false"
                                                ? "Select True or False"
                                                : "Enter your answer" }), _jsx("span", { children: "\u2022" }), currentQuestion.difficulty && (_jsxs(Badge, { variant: "outline", className: `${getDifficultyBadge(currentQuestion.difficulty).color} flex items-center`, children: [getDifficultyBadge(currentQuestion.difficulty).icon, currentQuestion.difficulty.charAt(0).toUpperCase() +
                                                currentQuestion.difficulty.slice(1)] }))] })] }), currentQuestion.answerType === "multiple_choice" && (_jsx(RadioGroup, { value: currentAnswer, onValueChange: handleAnswerChange, children: _jsx("div", { className: "space-y-3", children: currentQuestion.options?.map((option, i) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: option, id: `option-${i}` }), _jsx(Label, { htmlFor: `option-${i}`, className: "cursor-pointer", children: option })] }, i))) }) })), currentQuestion.answerType === "true_false" && (_jsx(RadioGroup, { value: currentAnswer, onValueChange: handleAnswerChange, children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "True", id: "true" }), _jsx(Label, { htmlFor: "true", className: "cursor-pointer", children: "True" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "False", id: "false" }), _jsx(Label, { htmlFor: "false", className: "cursor-pointer", children: "False" })] })] }) })), currentQuestion.answerType === "short_answer" && (_jsx(Textarea, { placeholder: "Enter your answer here...", value: currentAnswer, onChange: (e) => handleAnswerChange(e.target.value), rows: 4 }))] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsxs(Button, { variant: "outline", onClick: goToPreviousQuestion, disabled: currentQuestionIndex === 0, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Previous"] }), currentQuestionIndex < quiz.questions.length - 1 ? (_jsxs(Button, { onClick: goToNextQuestion, children: ["Next", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })) : (_jsxs(Button, { onClick: submitQuiz, disabled: submitting, className: "bg-green-600 hover:bg-green-700", children: [_jsx(Flag, { className: "mr-2 h-4 w-4" }), submitting ? "Submitting..." : "Submit Quiz"] }))] })] }));
}
