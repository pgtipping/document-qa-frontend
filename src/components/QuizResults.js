"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy, Share2, Check, X, Clock, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
export default function QuizResults({ quizId, resultId }) {
    const router = useRouter();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareUrl, setShareUrl] = useState(null);
    const [isShared, setIsShared] = useState(false);
    const [sharingUpdated, setSharingUpdated] = useState(false);
    // Fetch quiz result
    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await fetch(`/api/quiz/${quizId}/results?resultId=${resultId}`);
                if (!response.ok) {
                    throw new Error("Failed to load result");
                }
                const data = await response.json();
                setResult(data);
                setIsShared(data.isShared);
                if (data.isShared && data.shareUrl) {
                    const baseUrl = window.location.origin;
                    setShareUrl(`${baseUrl}/quiz/${quizId}/results?resultId=${resultId}&shareCode=${data.shareUrl}`);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            }
            finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [quizId, resultId]);
    // Update sharing settings
    const handleSharingChange = async (share) => {
        if (!result)
            return;
        try {
            const response = await fetch(`/api/quiz/${quizId}/results`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resultId: result.id,
                    isShared: share,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to update sharing settings");
            }
            const data = await response.json();
            setIsShared(data.isShared);
            if (data.isShared && data.shareUrl) {
                const baseUrl = window.location.origin;
                setShareUrl(`${baseUrl}/quiz/${quizId}/results?resultId=${resultId}&shareCode=${data.shareUrl}`);
            }
            else {
                setShareUrl(null);
            }
            setSharingUpdated(true);
            // Auto-hide confirmation after 3 seconds
            setTimeout(() => {
                setSharingUpdated(false);
            }, 3000);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update sharing settings");
        }
    };
    // Copy share URL to clipboard
    const copyShareUrl = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
        }
    };
    // Format time taken
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins} min${mins !== 1 ? "s" : ""} ${secs} sec${secs !== 1 ? "s" : ""}`;
        }
        return `${secs} second${secs !== 1 ? "s" : ""}`;
    };
    // Loading state
    if (loading) {
        return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Loading Results..." }), _jsx(CardDescription, { children: "Please wait while we load your quiz results" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-4 w-full bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-20 w-full bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-12 w-full bg-gray-200 rounded animate-pulse" })] }) })] }));
    }
    // Error state
    if (error || !result) {
        return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Error" }), _jsx(CardDescription, { children: "There was a problem loading the quiz results" })] }), _jsx(CardContent, { children: _jsx("p", { className: "text-red-500", children: error || "Result data not available" }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", onClick: () => router.back(), children: "Go Back" }) })] }));
    }
    // Calculate counts
    const correctCount = result.responses.filter((r) => r.isCorrect).length;
    const incorrectCount = result.responses.length - correctCount;
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-start gap-4", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-2xl", children: [result.quiz.title, " - Results"] }), _jsxs(CardDescription, { children: ["From document: ", result.quiz.document.filename] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("div", { className: "text-3xl font-bold", children: [result.score.toFixed(1), "%"] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [result.earnedPoints, " / ", result.totalPoints, " points"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-4", children: [_jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-md", children: [_jsx(Check, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-semibold", children: [correctCount, " Correct"] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [((correctCount / result.responses.length) * 100).toFixed(0), "% of answers"] })] })] }), _jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md", children: [_jsx(X, { className: "h-5 w-5 text-red-600" }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-semibold", children: [incorrectCount, " Incorrect"] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [((incorrectCount / result.responses.length) * 100).toFixed(0), "% of answers"] })] })] }), _jsxs("div", { className: "flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md", children: [_jsx(Clock, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: result.timeTaken
                                                    ? formatTime(result.timeTaken)
                                                    : "Time not recorded" }), _jsx("div", { className: "text-xs text-muted-foreground", children: result.timeTaken && result.responses.length
                                                    ? `~${Math.round(result.timeTaken / result.responses.length)}s per question`
                                                    : "" })] })] })] }), _jsx("div", { className: "mt-4 p-4 bg-amber-50 border border-amber-100 rounded-md", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Award, { className: "h-5 w-5 text-amber-600 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: "Feedback" }), _jsx("div", { className: "text-sm", children: result.feedback })] })] }) })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "answers", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "answers", children: "Answers" }), _jsx(TabsTrigger, { value: "summary", children: "Summary" })] }), _jsx(TabsContent, { value: "answers", children: _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: result.responses.map((response, index) => (_jsxs(AccordionItem, { value: `q-${index}`, children: [_jsx(AccordionTrigger, { className: "hover:no-underline py-4", children: _jsxs("div", { className: "flex items-center gap-3 text-left", children: [_jsx(Badge, { variant: response.isCorrect ? "default" : "destructive", className: "shrink-0", children: response.isCorrect ? "Correct" : "Incorrect" }), _jsxs("span", { className: "text-sm font-medium", children: [index + 1, ".", " ", response.questionText.length > 60
                                                                ? `${response.questionText.substring(0, 60)}...`
                                                                : response.questionText] })] }) }), _jsxs(AccordionContent, { className: "border-l-2 pl-4 ml-4 space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: "Question:" }), _jsx("div", { className: "text-sm", children: response.questionText })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-sm font-semibold text-green-700", children: "Correct Answer:" }), _jsx("div", { className: "text-sm p-2 bg-green-50 border border-green-100 rounded", children: response.correctAnswer })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-sm font-semibold text-blue-700", children: "Your Answer:" }), _jsx("div", { className: `text-sm p-2 ${response.isCorrect
                                                                        ? "bg-green-50 border border-green-100"
                                                                        : "bg-red-50 border border-red-100"} rounded`, children: response.userAnswer || "<No answer provided>" })] })] }), response.explanation && (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", children: "Explanation:" }), _jsx("div", { className: "text-sm", children: response.explanation })] }))] })] }, response.id))) }) }), _jsx(TabsContent, { value: "summary", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Score Breakdown" }), _jsx("div", { className: "w-full bg-gray-100 rounded-full h-4 mb-1", children: _jsx("div", { className: "bg-green-600 h-4 rounded-full", style: { width: `${result.score}%` } }) }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "0%" }), _jsxs("span", { children: [result.score.toFixed(1), "%"] }), _jsx("span", { children: "100%" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Completion Time" }), result.timeTaken ? (_jsx("p", { children: formatTime(result.timeTaken) })) : (_jsx("p", { children: "Time not recorded" }))] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Completed At" }), _jsx("p", { children: new Date(result.completedAt).toLocaleString() })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "share-results", children: "Share Results" }), _jsxs("div", { className: "flex items-center gap-2", children: [sharingUpdated && (_jsx("span", { className: "text-xs text-green-600", children: "\u2713 Updated" })), _jsx(Switch, { id: "share-results", checked: isShared, onCheckedChange: handleSharingChange })] })] }), isShared && shareUrl && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 border rounded text-sm", children: [_jsx("div", { className: "truncate flex-1", children: shareUrl }), _jsx(Button, { variant: "outline", size: "sm", onClick: copyShareUrl, children: _jsx(ClipboardCopy, { className: "h-4 w-4" }) })] }))] })] }) })] }) }), _jsxs(CardFooter, { className: "flex justify-between gap-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => router.back(), children: "Go Back" }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Share2, { className: "h-4 w-4 mr-2" }), "Share"] }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Share Your Quiz Results" }), _jsx(AlertDialogDescription, { children: isShared
                                                            ? "Your quiz results are currently shared. Anyone with the link can view them."
                                                            : "Your quiz results are currently private. Enable sharing to get a link." })] }), _jsxs("div", { className: "flex items-center justify-between py-4", children: [_jsx(Label, { htmlFor: "share-dialog-switch", children: "Enable sharing" }), _jsx(Switch, { id: "share-dialog-switch", checked: isShared, onCheckedChange: handleSharingChange })] }), isShared && shareUrl && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 border rounded text-sm", children: [_jsx("div", { className: "truncate flex-1", children: shareUrl }), _jsx(Button, { variant: "outline", size: "sm", onClick: copyShareUrl, children: _jsx(ClipboardCopy, { className: "h-4 w-4" }) })] })), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Close" }), isShared && shareUrl && (_jsx(AlertDialogAction, { asChild: true, children: _jsx(Button, { onClick: copyShareUrl, children: "Copy Link" }) }))] })] })] })] }), _jsx(Button, { variant: "default", onClick: () => router.push(`/quiz/new?documentId=${result.quiz.document.id}`), children: "Create New Quiz" })] })] }));
}
