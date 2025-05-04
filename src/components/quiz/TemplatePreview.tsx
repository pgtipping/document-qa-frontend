"use client";

import { useState, useEffect } from "react";
import { QuizTemplate, getTemplateById } from "@/lib/quiz-templates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircleHelp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Zap,
  Trophy,
  BadgeIcon,
} from "lucide-react";

interface TemplatePreviewProps {
  templateId: string;
}

export default function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const [template, setTemplate] = useState<QuizTemplate | null>(null);

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
  const getQuestionTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "multiple_choice":
        return <CircleHelp className="h-4 w-4 text-blue-500" />;
      case "true_false":
        return (
          <div className="flex space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        );
      case "short_answer":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <CircleHelp className="h-4 w-4" />;
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
  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "easy":
        return <Zap className="h-4 w-4 text-green-500" />;
      case "medium":
        return <BadgeIcon className="h-4 w-4 text-amber-500" />;
      case "hard":
        return <Trophy className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Template Preview: {template.name}
        </CardTitle>
        <CardDescription>
          This is how questions will be generated based on your document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Distribution of question types */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Question Type Distribution
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${template.questionTypes.multipleChoice}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-center">
                  Multiple Choice: {template.questionTypes.multipleChoice}%
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${template.questionTypes.trueFalse}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center">
                  True/False: {template.questionTypes.trueFalse}%
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{ width: `${template.questionTypes.shortAnswer}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center">
                  Short Answer: {template.questionTypes.shortAnswer}%
                </p>
              </div>
            </div>
          </div>

          {/* Focus areas */}
          <div>
            <h4 className="text-sm font-medium mb-2">Focus Areas</h4>
            <div className="flex flex-wrap gap-1">
              {template.focusAreas.map((area) => (
                <Badge key={area} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Example Questions */}
          <div>
            <h4 className="text-sm font-medium mb-2">Example Questions</h4>
            <div className="space-y-3">
              {template.exampleQuestions.map((question, idx) => {
                const questionTypes = getQuestionTypes();
                const questionType = questionTypes[idx % questionTypes.length];
                const difficulty = ["easy", "medium", "hard"][idx % 3];

                return (
                  <div key={idx} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        {getQuestionTypeIcon(questionType)}
                        <span className="text-xs font-medium capitalize">
                          {questionType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDifficultyIcon(difficulty)}
                        <span className="text-xs capitalize">{difficulty}</span>
                      </div>
                    </div>
                    <p className="text-sm">{question}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
