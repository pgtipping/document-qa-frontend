"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, BadgeHelp, Zap, Trophy, ChevronDown, ChevronUp, } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TemplateSelector from "./quiz/TemplateSelector";
import TemplatePreview from "./quiz/TemplatePreview";
import { getTemplateById } from "@/lib/quiz-templates";
export default function QuizGenerator({ documents, onGenerateStart, onGenerateComplete, }) {
    const router = useRouter();
    const [selectedDocumentId, setSelectedDocumentId] = useState("");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [quizSize, setQuizSize] = useState(5);
    const [difficulty, setDifficulty] = useState("medium");
    const [templateId, setTemplateId] = useState("general");
    const [showPreview, setShowPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [generatedQuizId, setGeneratedQuizId] = useState(null);
    // Update selected document when ID changes
    const handleDocumentSelect = (docId) => {
        setSelectedDocumentId(docId);
        const doc = documents.find((d) => d.id === docId) || null;
        setSelectedDocument(doc);
        // Auto-recommend template based on document filename if available
        if (doc && doc.filename) {
            // Template recommendation logic handled in TemplateSelector component
        }
    };
    // Handle quiz generation
    const handleGenerateQuiz = async () => {
        if (!selectedDocumentId) {
            setError("Please select a document for the quiz");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setSuccess(null);
        if (onGenerateStart) {
            onGenerateStart();
        }
        try {
            // Get the template info to include in the request
            const template = getTemplateById(templateId);
            const response = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId: selectedDocumentId,
                    quizSize,
                    difficulty,
                    templateId,
                    templateInfo: template
                        ? {
                            name: template.name,
                            focusAreas: template.focusAreas,
                            questionTypes: template.questionTypes,
                            promptModifier: template.promptModifier,
                        }
                        : null,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate quiz");
            }
            const data = await response.json();
            setSuccess(`Quiz "${data.title}" generated successfully with ${data.questionCount} questions!`);
            setGeneratedQuizId(data.id);
            if (onGenerateComplete) {
                onGenerateComplete(data.id);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleOpenQuiz = () => {
        if (generatedQuizId) {
            router.push(`/quiz/${generatedQuizId}`);
        }
    };
    // Get color and icon for difficulty
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "easy":
                return "bg-green-100 text-green-700 hover:bg-green-200";
            case "medium":
                return "bg-amber-100 text-amber-700 hover:bg-amber-200";
            case "hard":
                return "bg-red-100 text-red-700 hover:bg-red-200";
            default:
                return "";
        }
    };
    const getDifficultyIcon = (diff) => {
        switch (diff) {
            case "easy":
                return _jsx(Zap, { className: "h-4 w-4 mr-2" });
            case "medium":
                return _jsx(Badge, { className: "h-4 w-4 mr-2" });
            case "hard":
                return _jsx(Trophy, { className: "h-4 w-4 mr-2" });
            default:
                return null;
        }
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Generate Quiz" }), _jsx(CardDescription, { children: "Create a quiz from your documents to test understanding" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "document-select", children: "Select Document" }), _jsxs(Select, { value: selectedDocumentId, onValueChange: handleDocumentSelect, disabled: isGenerating, children: [_jsx(SelectTrigger, { id: "document-select", children: _jsx(SelectValue, { placeholder: "Select a document" }) }), _jsx(SelectContent, { children: documents.length === 0 ? (_jsx(SelectItem, { value: "no-docs", disabled: true, children: "No documents available" })) : (documents.map((doc) => (_jsx(SelectItem, { value: doc.id, children: doc.filename }, doc.id)))) })] })] }), selectedDocumentId && (_jsxs(_Fragment, { children: [_jsx(Separator, { className: "my-4" }), _jsx(TemplateSelector, { documentFilename: selectedDocument?.filename || "", onTemplateSelect: setTemplateId, selectedTemplateId: templateId, disabled: isGenerating }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "See how this template affects question generation" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowPreview(!showPreview), className: "text-xs flex items-center", disabled: isGenerating, children: showPreview ? (_jsxs(_Fragment, { children: ["Hide Preview ", _jsx(ChevronUp, { className: "ml-1 h-4 w-4" })] })) : (_jsxs(_Fragment, { children: ["Show Preview ", _jsx(ChevronDown, { className: "ml-1 h-4 w-4" })] })) })] }), showPreview && (_jsx("div", { className: "mt-2", children: _jsx(TemplatePreview, { templateId: templateId }) })), _jsx(Separator, { className: "my-4" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-between", children: _jsxs(Label, { htmlFor: "quiz-size", children: ["Number of Questions: ", quizSize] }) }), _jsx(Slider, { id: "quiz-size", defaultValue: [5], min: 3, max: 10, step: 1, onValueChange: (values) => setQuizSize(values[0]), disabled: isGenerating })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Label, { htmlFor: "difficulty-select", className: "mr-2", children: "Difficulty" }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(BadgeHelp, { className: "h-4 w-4 text-muted-foreground cursor-help" }) }), _jsx(TooltipContent, { children: _jsx("p", { className: "w-[220px] text-sm", children: "Select the overall difficulty of your quiz. The AI will generate questions matching this level." }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs(HoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: `flex justify-start items-center ${difficulty === "easy" ? getDifficultyColor("easy") : ""} ${difficulty === "easy" ? "border-2 border-green-500" : ""}`, onClick: () => setDifficulty("easy"), disabled: isGenerating, children: [getDifficultyIcon("easy"), "Easy"] }) }), _jsx(HoverCardContent, { className: "w-80", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-semibold", children: "Easy Difficulty" }), _jsx("p", { className: "text-sm", children: "Basic recall and comprehension questions. Ideal for beginners or initial assessment of document understanding." })] }) })] }), _jsxs(HoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: `flex justify-start items-center ${difficulty === "medium"
                                                                ? getDifficultyColor("medium")
                                                                : ""} ${difficulty === "medium"
                                                                ? "border-2 border-amber-500"
                                                                : ""}`, onClick: () => setDifficulty("medium"), disabled: isGenerating, children: [getDifficultyIcon("medium"), "Medium"] }) }), _jsx(HoverCardContent, { className: "w-80", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-semibold", children: "Medium Difficulty" }), _jsx("p", { className: "text-sm", children: "Application and analysis questions requiring deeper understanding of concepts covered in the document." })] }) })] }), _jsxs(HoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: `flex justify-start items-center ${difficulty === "hard" ? getDifficultyColor("hard") : ""} ${difficulty === "hard" ? "border-2 border-red-500" : ""}`, onClick: () => setDifficulty("hard"), disabled: isGenerating, children: [getDifficultyIcon("hard"), "Hard"] }) }), _jsx(HoverCardContent, { className: "w-80", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-semibold", children: "Hard Difficulty" }), _jsx("p", { className: "text-sm", children: "Evaluation and synthesis questions requiring deep understanding and connection between concepts in the document." })] }) })] })] })] })] })), error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: error })] })), success && (_jsxs(Alert, { variant: "default", className: "bg-green-50 text-green-800 border-green-200", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { children: "Success" }), _jsx(AlertDescription, { children: success })] }))] }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => {
                            setSelectedDocumentId("");
                            setSelectedDocument(null);
                            setQuizSize(5);
                            setDifficulty("medium");
                            setTemplateId("general");
                            setShowPreview(false);
                            setError(null);
                            setSuccess(null);
                            setGeneratedQuizId(null);
                        }, disabled: isGenerating, children: "Reset" }), _jsxs("div", { className: "space-x-2", children: [generatedQuizId && (_jsx(Button, { onClick: handleOpenQuiz, children: "Open Quiz" })), _jsx(Button, { onClick: handleGenerateQuiz, disabled: isGenerating || !selectedDocumentId, children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx(Skeleton, { className: "h-4 w-4 rounded-full mr-2" }), "Generating..."] })) : ("Generate Quiz") })] })] })] }));
}
