"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { getRecommendedTemplates, getAllTemplates, } from "@/lib/quiz-templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card";
import { BadgeHelp, Book, GraduationCap, Code, BarChart, BookOpen, } from "lucide-react";
// Dynamic icon mapping based on template icon field
const iconMap = {
    Book: _jsx(Book, { className: "h-5 w-5" }),
    GraduationCap: _jsx(GraduationCap, { className: "h-5 w-5" }),
    Code: _jsx(Code, { className: "h-5 w-5" }),
    BarChart: _jsx(BarChart, { className: "h-5 w-5" }),
    BookOpen: _jsx(BookOpen, { className: "h-5 w-5" }),
};
export default function TemplateSelector({ documentFilename, onTemplateSelect, selectedTemplateId = "general", disabled = false, }) {
    const [recommendedTemplates, setRecommendedTemplates] = useState([]);
    const [otherTemplates, setOtherTemplates] = useState([]);
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    useEffect(() => {
        if (documentFilename) {
            const recommended = getRecommendedTemplates(documentFilename);
            const all = getAllTemplates();
            // Filter out the recommended ones from all templates
            const recommendedIds = new Set(recommended.map((t) => t.id));
            const others = all.filter((t) => !recommendedIds.has(t.id));
            setRecommendedTemplates(recommended);
            setOtherTemplates(others);
            // If no template is selected yet, select the first recommended one
            if (!selectedTemplateId && recommended.length > 0) {
                onTemplateSelect(recommended[0].id);
            }
        }
    }, [documentFilename, selectedTemplateId, onTemplateSelect]);
    const renderTemplateCard = (template) => (_jsx("div", { className: "relative", children: _jsxs(HoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsx("div", { className: "cursor-pointer", children: _jsxs(Card, { className: `h-full transition-all ${selectedTemplateId === template.id
                                ? "border-2 border-primary shadow-md"
                                : "hover:border-gray-300"}`, onClick: () => !disabled && onTemplateSelect(template.id), children: [_jsx(CardHeader, { className: "p-4 pb-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "rounded-full bg-primary/10 p-2", children: iconMap[template.icon] || _jsx(Book, { className: "h-5 w-5" }) }), _jsx(CardTitle, { className: "text-lg", children: template.name })] }), _jsx(RadioGroupItem, { value: template.id, id: `template-${template.id}`, checked: selectedTemplateId === template.id, className: "mt-0", disabled: disabled })] }) }), _jsxs(CardContent, { className: "p-4 pt-2", children: [_jsx(CardDescription, { className: "mb-2", children: template.description }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [template.focusAreas.slice(0, 3).map((area) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: area }, area))), template.focusAreas.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", template.focusAreas.length - 3, " more"] }))] })] })] }) }) }), _jsx(HoverCardContent, { className: "w-80", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-semibold", children: template.name }), _jsx("p", { className: "text-sm", children: template.description }), _jsxs("div", { className: "pt-2", children: [_jsx("h5", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Focus Areas:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: template.focusAreas.map((area) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: area }, area))) })] }), _jsxs("div", { className: "pt-2", children: [_jsx("h5", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Example Questions:" }), _jsx("ul", { className: "text-sm space-y-1 list-disc pl-4", children: template.exampleQuestions.map((q, i) => (_jsx("li", { children: q }, i))) })] })] }) })] }) }, template.id));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Label, { className: "mr-2 text-base font-medium", children: "Quiz Template" }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(BadgeHelp, { className: "h-4 w-4 text-muted-foreground cursor-help" }) }), _jsx(TooltipContent, { children: _jsx("p", { className: "w-[250px] text-sm", children: "Select a template that best matches your document type. Templates customize the quiz generation to focus on relevant aspects." }) })] }) })] }), otherTemplates.length > 0 && (_jsx(Button, { variant: "link", size: "sm", onClick: () => setShowAllTemplates(!showAllTemplates), disabled: disabled, children: showAllTemplates ? "Show Recommended" : "Show All Templates" }))] }), _jsxs(RadioGroup, { value: selectedTemplateId, onValueChange: onTemplateSelect, className: "space-y-4", disabled: disabled, children: [recommendedTemplates.length > 0 && !showAllTemplates && (_jsxs(_Fragment, { children: [recommendedTemplates.length > 1 && (_jsxs(Label, { className: "text-sm text-muted-foreground mb-2", children: ["Recommended for \"", documentFilename, "\""] })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: recommendedTemplates.map(renderTemplateCard) })] })), showAllTemplates && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [...recommendedTemplates, ...otherTemplates].map(renderTemplateCard) }))] })] }));
}
