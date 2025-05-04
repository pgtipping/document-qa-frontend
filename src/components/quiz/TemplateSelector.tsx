"use client";

import { useState, useEffect } from "react";
import {
  QuizTemplate,
  getRecommendedTemplates,
  getAllTemplates,
} from "@/lib/quiz-templates";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  BadgeHelp,
  Book,
  GraduationCap,
  Code,
  BarChart,
  BookOpen,
} from "lucide-react";

// Dynamic icon mapping based on template icon field
const iconMap: Record<string, React.ReactNode> = {
  Book: <Book className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  BarChart: <BarChart className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
};

interface TemplateSelectorProps {
  documentFilename: string;
  onTemplateSelect: (templateId: string) => void;
  selectedTemplateId?: string;
  disabled?: boolean;
}

export default function TemplateSelector({
  documentFilename,
  onTemplateSelect,
  selectedTemplateId = "general",
  disabled = false,
}: TemplateSelectorProps) {
  const [recommendedTemplates, setRecommendedTemplates] = useState<
    QuizTemplate[]
  >([]);
  const [otherTemplates, setOtherTemplates] = useState<QuizTemplate[]>([]);
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

  const renderTemplateCard = (template: QuizTemplate) => (
    <div key={template.id} className="relative">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-pointer">
            <Card
              className={`h-full transition-all ${
                selectedTemplateId === template.id
                  ? "border-2 border-primary shadow-md"
                  : "hover:border-gray-300"
              }`}
              onClick={() => !disabled && onTemplateSelect(template.id)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      {iconMap[template.icon] || <Book className="h-5 w-5" />}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <RadioGroupItem
                    value={template.id}
                    id={`template-${template.id}`}
                    checked={selectedTemplateId === template.id}
                    className="mt-0"
                    disabled={disabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <CardDescription className="mb-2">
                  {template.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1">
                  {template.focusAreas.slice(0, 3).map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {template.focusAreas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.focusAreas.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{template.name}</h4>
            <p className="text-sm">{template.description}</p>
            <div className="pt-2">
              <h5 className="text-xs font-medium text-muted-foreground mb-1">
                Focus Areas:
              </h5>
              <div className="flex flex-wrap gap-1">
                {template.focusAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <h5 className="text-xs font-medium text-muted-foreground mb-1">
                Example Questions:
              </h5>
              <ul className="text-sm space-y-1 list-disc pl-4">
                {template.exampleQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Label className="mr-2 text-base font-medium">Quiz Template</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeHelp className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[250px] text-sm">
                  Select a template that best matches your document type.
                  Templates customize the quiz generation to focus on relevant
                  aspects.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {otherTemplates.length > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowAllTemplates(!showAllTemplates)}
            disabled={disabled}
          >
            {showAllTemplates ? "Show Recommended" : "Show All Templates"}
          </Button>
        )}
      </div>

      <RadioGroup
        value={selectedTemplateId}
        onValueChange={onTemplateSelect}
        className="space-y-4"
        disabled={disabled}
      >
        {recommendedTemplates.length > 0 && !showAllTemplates && (
          <>
            {recommendedTemplates.length > 1 && (
              <Label className="text-sm text-muted-foreground mb-2">
                Recommended for "{documentFilename}"
              </Label>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedTemplates.map(renderTemplateCard)}
            </div>
          </>
        )}

        {showAllTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...recommendedTemplates, ...otherTemplates].map(
              renderTemplateCard
            )}
          </div>
        )}
      </RadioGroup>
    </div>
  );
}
