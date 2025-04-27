import React from "react";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using InqDoc's document Q&A service, you accept and
          agree to be bound by these Terms of Service. If you do not agree to
          these terms, please do not use our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
        <p className="mb-4">
          InqDoc provides an AI-powered document Q&A platform that allows users
          to upload documents and ask questions about their content. The service
          processes documents temporarily to provide accurate, context-aware
          responses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. User Responsibilities
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">
            You must provide accurate information when using our service
          </li>
          <li className="mb-2">
            You are responsible for maintaining the confidentiality of your
            account
          </li>
          <li className="mb-2">
            You must not upload any illegal or unauthorized content
          </li>
          <li className="mb-2">
            You must not use the service for any unlawful purpose
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Intellectual Property
        </h2>
        <p className="mb-4">
          You retain all rights to your documents. By using our service, you
          grant us a limited license to process your documents solely for the
          purpose of providing the Q&A service. We do not claim ownership of
          your content.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          5. Limitations of Liability
        </h2>
        <p className="mb-4">
          Our service is provided "as is" without any warranties. We are not
          liable for any damages arising from your use of our service or any
          inaccuracies in the responses provided by our AI system.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes. Continued use of the service after
          changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
        <p className="mb-4">
          We reserve the right to terminate or suspend access to our service
          immediately, without prior notice, for any violation of these terms or
          for any other reason we deem appropriate.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p className="mb-4">
          For any questions about these Terms of Service, please contact us at:
          <br />
          Email: legal@synthalyst.com
        </p>
      </section>

      <footer className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

export default TermsOfService;
