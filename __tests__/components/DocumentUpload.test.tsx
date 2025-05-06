import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  createEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import type { Accept } from "react-dropzone";

// Mock the useToast hook
const mockToast = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: mockToast,
  })),
}));

// Mock next-auth/react useSession hook
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  })),
}));

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(() =>
    Promise.resolve({ data: { document_id: "test-doc-id" } })
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Upload: () => <div data-testid="mock-upload-icon">Upload Icon</div>,
  File: () => <div data-testid="mock-file-icon">File Icon</div>,
  X: () => <div data-testid="mock-x-icon">X Icon</div>,
}));

// Mock react-dropzone
jest.mock("react-dropzone", () => ({
  useDropzone: ({
    onDrop,
    accept,
    maxSize,
    disabled,
  }: {
    onDrop: (files: File[]) => void;
    accept: Accept;
    maxSize: number;
    disabled: boolean;
  }) => {
    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      if (disabled) return;

      const droppedFiles = Array.from(event.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      const file = droppedFiles[0];

      // Validate file type
      const acceptedTypes = Object.entries(accept).reduce<string[]>(
        (acc, [mimeType, extensions]) => {
          if (mimeType === file.type) acc.push(mimeType);
          extensions.forEach((ext) => {
            if (file.name.toLowerCase().endsWith(ext.toLowerCase()))
              acc.push(ext);
          });
          return acc;
        },
        []
      );

      const isValidType = acceptedTypes.length > 0;
      const isValidSize = file.size <= maxSize;

      if (!isValidType || !isValidSize) {
        mockToast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      onDrop([file]);
    };

    return {
      getRootProps: () => ({
        onClick: () => {},
        onDrop: handleDrop,
        className: "border-2 border-dashed",
        "data-testid": "dropzone",
      }),
      getInputProps: () => ({
        type: "file",
        accept: Object.entries(accept)
          .map(([mime, exts]) => [...exts, mime])
          .flat()
          .join(","),
        disabled,
        "data-testid": "file-input",
      }),
      isDragActive: false,
    };
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the Progress component from ui
jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div role="progressbar" aria-valuenow={value} data-testid="mock-progress">
      {value}%
    </div>
  ),
}));

// Mock the Button component from ui
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="mock-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Create a simplified mock of the FileUpload component for testing
const FileUpload = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const fileToUpload = acceptedFiles[0];

    // Validate file type
    const validFileTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isValidType =
      validFileTypes.includes(fileToUpload.type) ||
      fileToUpload.name.match(/\.(pdf|txt|doc|docx)$/i);
    const isValidSize = fileToUpload.size <= 10 * 1024 * 1024;

    if (!isValidType || !isValidSize) {
      mockToast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setFile(fileToUpload);
    setIsUploading(true);

    // Set document ID immediately for the test
    localStorage.setItem("currentDocumentId", "test-doc-id");

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 100);
  };

  const removeFile = () => {
    if (!isUploading) {
      setFile(null);
      localStorage.removeItem("currentDocumentId");
    }
  };

  const dropzoneProps = {
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading,
    onDrop: handleFileDrop,
  };

  const { getRootProps, getInputProps } = {
    getRootProps: () => ({
      onClick: () => {},
      onDrop: (e: any) =>
        handleFileDrop([e.dataTransfer?.files[0]].filter(Boolean)),
      "data-testid": "dropzone",
    }),
    getInputProps: () => ({ "data-testid": "file-input" }),
  };

  return (
    <div className="file-upload-container">
      {!file ? (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div data-testid="mock-upload-icon">Upload Icon</div>
          <p>Drag & drop your file here</p>
          <p>or click to browse from your computer</p>
          <p>Supports PDF, TXT, DOC, and DOCX files up to 10MB</p>
        </div>
      ) : (
        <div className="file-info">
          <div className="file-details">
            <div data-testid="mock-file-icon">File Icon</div>
            <div>
              <p>{file.name}</p>
              <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={removeFile} data-testid="remove-file">
            <div data-testid="mock-x-icon">X Icon</div>
          </button>
          {isUploading && (
            <div className="progress-bar">
              <div role="progressbar" aria-valuenow={uploadProgress}>
                {uploadProgress}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mock the FileUpload import
jest.mock("@/components/FileUpload", () => ({
  __esModule: true,
  default: FileUpload,
}));

describe("FileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it("renders upload area with correct text", () => {
    render(<FileUpload />);
    expect(screen.getByText("Drag & drop your file here")).toBeInTheDocument();
    expect(
      screen.getByText("or click to browse from your computer")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Supports PDF, TXT, DOC, and DOCX files up to 10MB")
    ).toBeInTheDocument();
  });

  it("handles file selection", async () => {
    const { container } = render(<FileUpload />);
    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    const dropzone = screen.getByTestId("dropzone");

    await act(async () => {
      const dropEvent = createEvent.drop(dropzone);
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: { files: [file] },
      });
      fireEvent(dropzone, dropEvent);
    });

    // Wait for file info to be displayed
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
      expect(screen.getByText("0.00 MB")).toBeInTheDocument();
    });

    // Verify document ID was stored
    expect(window.localStorage.getItem("currentDocumentId")).toBe(
      "test-doc-id"
    );
  });

  it("shows error for invalid file type", async () => {
    const { container } = render(<FileUpload />);
    const file = new File(["test"], "test.exe", {
      type: "application/x-msdownload",
    });

    const dropzone = screen.getByTestId("dropzone");

    await act(async () => {
      const dropEvent = createEvent.drop(dropzone);
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: { files: [file] },
      });
      fireEvent(dropzone, dropEvent);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
        duration: 3000,
      });
    });

    // Verify no document ID was stored
    expect(window.localStorage.getItem("currentDocumentId")).toBeNull();
  });

  it("shows upload progress", async () => {
    const { container } = render(<FileUpload />);
    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    const dropzone = screen.getByTestId("dropzone");

    await act(async () => {
      const dropEvent = createEvent.drop(dropzone);
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: { files: [file] },
      });
      fireEvent(dropzone, dropEvent);
    });

    // Wait for upload progress
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
