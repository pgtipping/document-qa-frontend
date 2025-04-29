import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";

const HowToUsePage: React.FC = () => {
  return (
    <>
      <SEO
        title="How to Use InQDoc"
        description="Learn how to effectively use InQDoc to upload documents and ask questions about their content."
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          How to Use InQDoc
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Welcome to InQDoc! This guide will walk you through the main
              features and how to get the most out of the application.
            </p>
            <p>
              The core functionality revolves around uploading your documents
              and then asking questions based on their content.
            </p>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full mb-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              Step 1: Registering and Logging In
            </AccordionTrigger>
            <AccordionContent>
              Before you can upload documents, you need an account. Click on the
              &amp;quot;Register&amp;quot; button in the navigation bar and fill
              out the required information. Once registered, use the
              &amp;quot;Login&amp;quot; button to access your account.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Step 2: Uploading Documents</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Navigate to the &amp;quot;Chat&amp;quot; page. You&amp;apos;ll
                find the document management section, likely presented as a list
                or tab.
              </p>
              <p className="mb-2">
                Click the &amp;quot;Upload&amp;quot; button or drag and drop
                your files (PDF, DOCX, TXT) onto the designated area.
              </p>
              <p>
                Your uploaded documents will appear in the
                &amp;quot;Documents&amp;quot; list once processed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Step 3: Managing Documents</AccordionTrigger>
            <AccordionContent>
              In the &amp;quot;Documents&amp;quot; list on the
              &amp;quot;Chat&amp;quot; page, you can see all your uploaded
              files. You can select one or multiple documents using the
              checkboxes to specify the context for your questions. You can also
              delete documents you no longer need using the delete icon next to
              each file.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Step 4: Asking Questions</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                On the &amp;quot;Chat&amp;quot; page, ensure the documents you
                want to query are selected in the &amp;quot;Documents&amp;quot;
                list (or leave all unselected to use all active documents).
              </p>
              <p className="mb-2">
                Type your question into the chat input field at the bottom and
                press Enter or click the send button.
              </p>
              <p>
                The AI will analyze the content of the selected document(s) and
                provide an answer based on the information found within them.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Q&A Mode (Generating Questions)</AccordionTrigger>
            <AccordionContent>
              Not sure what to ask? Use the &amp;quot;Generate
              Question&amp;quot; feature (look for an icon like sparkles or a
              lightbulb near the chat input). This will prompt the AI to suggest
              a relevant question based on the selected document context. You
              can then send this suggested question or edit it first.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Ensure your uploaded documents have clear, searchable text.
              </li>
              <li>
                For multi-document queries, select only the relevant documents
                to improve focus and accuracy.
              </li>
              <li>
                Ask specific questions. Instead of &amp;quot;Tell me about the
                project,&amp;quot; ask &amp;quot;What were the key deliverables
                for the Q1 project?&amp;quot;
              </li>
              <li>
                If you get an unexpected answer, try rephrasing your question or
                checking the selected documents.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HowToUsePage;
