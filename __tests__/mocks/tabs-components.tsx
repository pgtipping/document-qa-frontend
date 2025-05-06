import React from "react";

// This is a complete rewrite of the tabs mock components to properly handle ARIA roles
// The main issues were:
// 1. TabsList must contain at least one TabsTrigger (tab role)
// 2. TabsTrigger (tab role) must be contained within a TabsList (tablist role)
// 3. ARIA attributes must use string literals not expressions

// Simple wrapper that just renders children
export const Tabs = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} data-testid="mock-tabs">
    {children}
  </div>
);

// Mock TabsContent with proper ARIA attributes
export const TabsContent = ({
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => (
  <div
    {...props}
    data-testid={`mock-tabs-content-${value}`}
    role="tabpanel"
    id={`panel-${value}`}
    aria-labelledby={`tab-${value}`}
  >
    {children}
  </div>
);

// Simple TabsList component
export const TabsList = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} data-testid="mock-tabs-list" role="tablist">
      {/* Always render at least one child with tab role */}
      {React.Children.count(children) === 0 ? (
        <TabsTrigger value="placeholder" data-selected="false">
          Placeholder Tab
        </TabsTrigger>
      ) : (
        children
      )}
    </div>
  );
};

// Mock TabsTrigger with proper ARIA role - using two separate components
export const TabsTrigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    "data-selected"?: string; // Using data attribute instead of aria for component differentiation
  }
> = ({ children, value, onClick, "data-selected": selected, ...props }) => {
  // Render two different components to avoid using expressions for aria-selected
  if (selected === "true") {
    return (
      <button
        {...props}
        role="tab"
        data-testid={`mock-tabs-trigger-${value}`}
        id={`tab-${value}`}
        aria-controls={`panel-${value}`}
        aria-selected="true"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      {...props}
      role="tab"
      data-testid={`mock-tabs-trigger-${value}`}
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      aria-selected="false"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Properly structured tabs for testing
export const MockTabsWithRoles = ({
  children,
  defaultValue = "tab1",
  ...props
}: {
  children: React.ReactNode;
  defaultValue?: string;
}) => {
  return (
    <div {...props} data-testid="mock-complete-tabs">
      <TabsList>
        <TabsTrigger
          value="tab1"
          data-selected={defaultValue === "tab1" ? "true" : "false"}
        >
          Tab 1
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          data-selected={defaultValue === "tab2" ? "true" : "false"}
        >
          Tab 2
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for Tab 1</TabsContent>
      <TabsContent value="tab2">Content for Tab 2</TabsContent>
    </div>
  );
};

// Helper function to mock tabs in tests
export const mockTabsComponents = () => {
  jest.mock("@/components/ui/tabs", () => ({
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  }));
};
