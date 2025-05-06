import "@testing-library/jest-dom";

// This extends the Jest types with testing-library custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      // DOM-based matchers from @testing-library/jest-dom
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeEmpty(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(css: string | object): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: object): R;
      toHaveTextContent(
        text: string | RegExp,
        options?: { normalizeWhitespace: boolean }
      ): R;
      toHaveValue(value?: string | string[] | number | null): R;
      toBeNull(): R;
      toHaveDescription(text?: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toContain(item: any): R;
      toContainEqual(item: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveReturned(): R;
    }

    // For the objectContaining and stringContaining helpers
    interface ExpectStatic {
      objectContaining<T extends object>(expected: T): T;
      stringContaining(expected: string): string;
      stringMatching(expected: string | RegExp): string;
    }
  }
}

// Global TS definition extension
interface Window {
  IntersectionObserver: any;
  ResizeObserver: any;
  matchMedia: any;
}

declare namespace NodeJS {
  interface Global {
    expect: jest.Expect;
  }
}

// This ensures the file is treated as a module
export {};
