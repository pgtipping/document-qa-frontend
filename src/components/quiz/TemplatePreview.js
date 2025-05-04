"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { getTemplateById } from "@/lib/quiz-templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleHelp, CheckCircle, XCircle, MessageSquare, Zap, Trophy, BadgeIcon, } from "lucide-react";
export default function TemplatePreview({ templateId }) {
    const [template, setTemplate] = useState(null);
    useEffect(() => {
        if (templateId) {
            const templateData = getTemplateById(templateId);
            setTemplate(templateData);
        }
    }, [templateId]);
    if (!template) {
        return null;
    }
    // Generate appropriate icon based on answer type
    const getQuestionTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case "multiple_choice":
                return _jsx(CircleHelp, { className: "h-4 w-4 text-blue-500" });
            case "true_false":
                return (_jsxs("div", { className: "flex space-x-1", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" }), _jsx(XCircle, { className: "h-4 w-4 text-red-500" })] }));
            case "short_answer":
                return _jsx(MessageSquare, { className: "h-4 w-4 text-purple-500" });
            default:
                return _jsx(CircleHelp, { className: "h-4 w-4" });
        }
    };
    // Based on the template's question type distribution, show appropriate examples
    const getQuestionTypes = () => {
        const types = [];
        if (template.questionTypes.multipleChoice > 0) {
            types.push("multiple_choice");
        }
        if (template.questionTypes.trueFalse > 0) {
            types.push("true_false");
        }
        if (template.questionTypes.shortAnswer > 0) {
            types.push("short_answer");
        }
        return types;
    };
    // Get difficulty icon
    const getDifficultyIcon = (diff) => {
        switch (diff) {
            case "easy":
                return _jsx(Zap, { className: "h-4 w-4 text-green-500" });
            case "medium":
                return _jsx(BadgeIcon, { className: "h-4 w-4 text-amber-500" });
            case "hard":
                return _jsx(Trophy, { className: "h-4 w-4 text-red-500" });
            default:
                return null;
        }
    };
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsxs(CardTitle, { className: "text-base", children: ["Template Preview: ", template.name] }), _jsx(CardDescription, { children: "This is how questions will be generated based on your document" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Question Type Distribution" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mb-1", children: _jsx("div", { className: "bg-blue-500 h-2.5 rounded-full", style: {
                                                            width: `${template.questionTypes.multipleChoice}%`,
                                                        } }) }), _jsxs("p", { className: "text-xs text-center", children: ["Multiple Choice: ", template.questionTypes.multipleChoice, "%"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mb-1", children: _jsx("div", { className: "bg-green-500 h-2.5 rounded-full", style: { width: `${template.questionTypes.trueFalse}%` } }) }), _jsxs("p", { className: "text-xs text-center", children: ["True/False: ", template.questionTypes.trueFalse, "%"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mb-1", children: _jsx("div", { className: "bg-purple-500 h-2.5 rounded-full", style: { width: `${template.questionTypes.shortAnswer}%` } }) }), _jsxs("p", { className: "text-xs text-center", children: ["Short Answer: ", template.questionTypes.shortAnswer, "%"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Focus Areas" }), _jsx("div", { className: "flex flex-wrap gap-1", children: template.focusAreas.map((area) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: area }, area))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Example Questions" }), _jsx("div", { className: "space-y-3", children: template.exampleQuestions.map((question, idx) => {
                                        const questionTypes = getQuestionTypes();
                                        const questionType = questionTypes[idx % questionTypes.length];
                                        const difficulty = ["easy", "medium", "hard"][idx % 3];
                                        return (_jsxs("div", { className: "border rounded-md p-3 bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [getQuestionTypeIcon(questionType), _jsx("span", { className: "text-xs font-medium capitalize", children: questionType.replace("_", " ") })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [getDifficultyIcon(difficulty), _jsx("span", { className: "text-xs capitalize", children: difficulty })] })] }), _jsx("p", { className: "text-sm", children: question })] }, idx));
                                    }) })] })] }) })] }));
}
