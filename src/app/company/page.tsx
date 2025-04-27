import React from "react";
import Link from "next/link";

const CompanyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Company</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* About Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">About InqDoc</h2>
          <p className="text-gray-600 mb-4">
            InqDoc is a powerful document Q&A platform that enables users to
            have natural conversations about their documents. Our AI-powered
            system provides accurate, context-aware responses while maintaining
            the highest standards of privacy and security.
          </p>
        </section>

        {/* Resources Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Resources</h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/docs"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">📚</span>
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="/api-docs"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">🔧</span>
                API Documentation
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">📝</span>
                Blog
              </Link>
            </li>
          </ul>
        </section>

        {/* Legal Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Legal</h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">🔒</span>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">📋</span>
                Terms of Service
              </Link>
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="space-y-3">
            <p className="flex items-center">
              <span className="mr-2">📧</span>
              <a
                href="mailto:contact@synthalyst.com"
                className="text-blue-600 hover:text-blue-800"
              >
                contact@synthalyst.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="mr-2">🌐</span>
              <a
                href="https://synthalyst.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                synthalyst.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompanyPage;
