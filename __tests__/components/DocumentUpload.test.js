import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor, act, createEvent, } from "@testing-library/react";
import FileUpload from "@/components/FileUpload";
import "@testing-library/jest-dom";
// Mock the useToast hook
const mockToast = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
    useToast: jest.fn(() => ({
        toast: mockToast,
    })),
}));
// Mock axios
jest.mock("axios", () => ({
    post: jest.fn(() => Promise.resolve({ data: { document_id: "test-doc-id" } })),
}));
// Mock react-dropzone
jest.mock("react-dropzone", () => ({
    useDropzone: ({ onDrop, accept, maxSize, disabled, }) => {
        const handleDrop = (event) => {
            event.preventDefault();
            if (disabled)
                return;
            const droppedFiles = Array.from(event.dataTransfer.files);
            if (droppedFiles.length === 0)
                return;
            const file = droppedFiles[0];
            // Validate file type
            const acceptedTypes = Object.entries(accept).reduce((acc, [mimeType, extensions]) => {
                if (mimeType === file.type)
                    acc.push(mimeType);
                extensions.forEach((ext) => {
                    if (file.name.toLowerCase().endsWith(ext.toLowerCase()))
                        acc.push(ext);
                });
                return acc;
            }, []);
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
                onClick: () => { },
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
describe("FileUpload", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear localStorage before each test
        window.localStorage.clear();
    });
    it("renders upload area with correct text", () => {
        render(_jsx(FileUpload, {}));
        expect(screen.getByText("Drag & drop your file here")).toBeInTheDocument();
        expect(screen.getByText("or click to browse from your computer")).toBeInTheDocument();
        expect(screen.getByText("Supports PDF, TXT, DOC, and DOCX files up to 10MB")).toBeInTheDocument();
    });
    it("handles file selection", async () => {
        const { container } = render(_jsx(FileUpload, {}));
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
        expect(window.localStorage.getItem("currentDocumentId")).toBe("test-doc-id");
    });
    it("shows error for invalid file type", async () => {
        const { container } = render(_jsx(FileUpload, {}));
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
        const { container } = render(_jsx(FileUpload, {}));
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
            const progressBar = screen.getByRole("progressbar");
            expect(progressBar).toBeInTheDocument();
        });
    });
});
