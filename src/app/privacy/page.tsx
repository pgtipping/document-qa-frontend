import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          At InqDoc, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our document Q&A service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Information We Collect
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Documents you upload for analysis</li>
          <li className="mb-2">
            Questions and interactions with our Q&A system
          </li>
          <li className="mb-2">Usage data and analytics</li>
          <li className="mb-2">
            Technical information about your device and connection
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">To provide and maintain our Q&A service</li>
          <li className="mb-2">To improve our service and user experience</li>
          <li className="mb-2">
            To analyze usage patterns and optimize performance
          </li>
          <li className="mb-2">To detect and prevent technical issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to
          protect your data. Documents are processed securely and are not
          permanently stored unless explicitly requested.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Access your data</li>
          <li className="mb-2">Request deletion of your data</li>
          <li className="mb-2">Object to processing of your data</li>
          <li className="mb-2">Export your data</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us
          at:
          <br />
          Email: privacy@synthalyst.com
        </p>
      </section>

      <footer className="text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
