import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentUpload } from "@/components/DocumentUpload";
import "@testing-library/jest-dom";

describe("DocumentUpload", () => {
  it("renders upload button", () => {
    render(<DocumentUpload onUploadComplete={() => {}} />);
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
  });

  it("handles file selection", async () => {
    const mockOnUploadComplete = jest.fn();
    render(<DocumentUpload onUploadComplete={mockOnUploadComplete} />);

    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText(/upload/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid file type", async () => {
    render(<DocumentUpload onUploadComplete={() => {}} />);

    const file = new File(["test"], "test.exe", {
      type: "application/x-msdownload",
    });
    const input = screen.getByLabelText(/upload/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it("shows error for files exceeding size limit", async () => {
    render(<DocumentUpload onUploadComplete={() => {}} />);

    // Create a file larger than 10MB
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText(/upload/i);

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds limit/i)).toBeInTheDocument();
    });
  });
});
