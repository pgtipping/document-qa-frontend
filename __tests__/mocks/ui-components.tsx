// UI component mocks for testing
import React from "react";

// Create a basic function to generate UI component mocks
const createMockComponent = (name: string) => {
  const Component = ({ children, ...props }: any) => {
    return (
      <div data-testid={`mock-${name}`} {...props}>
        {children}
      </div>
    );
  };
  Component.displayName = name;
  return Component;
};

// Mock shadcn/ui components
export const Button = createMockComponent("Button");
export const Card = createMockComponent("Card");
export const CardHeader = createMockComponent("CardHeader");
export const CardContent = createMockComponent("CardContent");
export const CardFooter = createMockComponent("CardFooter");
export const CardTitle = createMockComponent("CardTitle");
export const CardDescription = createMockComponent("CardDescription");
export const Tabs = createMockComponent("Tabs");
export const TabsContent = createMockComponent("TabsContent");
export const TabsList = createMockComponent("TabsList");
export const TabsTrigger = createMockComponent("TabsTrigger");

// Enhanced Badge component with better variant support
export const Badge = ({
  children,
  variant = "default",
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
  className?: string;
}) => {
  return (
    <span
      data-testid={`mock-badge-${variant}`}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};

export const Switch = createMockComponent("Switch");
export const Label = createMockComponent("Label");
export const Accordion = createMockComponent("Accordion");
export const AccordionContent = createMockComponent("AccordionContent");
export const AccordionItem = createMockComponent("AccordionItem");
export const AccordionTrigger = createMockComponent("AccordionTrigger");
export const AlertDialog = createMockComponent("AlertDialog");
export const AlertDialogAction = createMockComponent("AlertDialogAction");
export const AlertDialogCancel = createMockComponent("AlertDialogCancel");
export const AlertDialogContent = createMockComponent("AlertDialogContent");
export const AlertDialogDescription = createMockComponent(
  "AlertDialogDescription"
);
export const AlertDialogFooter = createMockComponent("AlertDialogFooter");
export const AlertDialogHeader = createMockComponent("AlertDialogHeader");
export const AlertDialogTitle = createMockComponent("AlertDialogTitle");
export const AlertDialogTrigger = createMockComponent("AlertDialogTrigger");

// Mock Lucide icons
export const ClipboardCopy = createMockComponent("ClipboardCopy");
export const Share2 = createMockComponent("Share2");
export const Check = createMockComponent("Check");
export const X = createMockComponent("X");
export const Clock = createMockComponent("Clock");
export const Award = createMockComponent("Award");
export const Zap = createMockComponent("Zap");
export const Trophy = createMockComponent("Trophy");
export const BadgeIcon = createMockComponent("BadgeIcon");
export const AlertCircle = createMockComponent("AlertCircle");
export const ArrowLeft = createMockComponent("ArrowLeft");
export const ArrowRight = createMockComponent("ArrowRight");
export const Flag = createMockComponent("Flag");
