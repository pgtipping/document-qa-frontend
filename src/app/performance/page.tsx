import { Metadata } from "next";
import WebVitals from "@/components/WebVitals";

export const metadata: Metadata = {
  title: "Performance Monitoring - Document Q&A",
  description:
    "Monitor the performance of Document Q&A with Core Web Vitals tracking.",
  keywords:
    "performance monitoring, core web vitals, web performance, document Q&A, page speed, user experience",
  openGraph: {
    title: "Performance Monitoring - Document Q&A",
    description:
      "Monitor the performance of Document Q&A with Core Web Vitals tracking.",
    url: "https://doc-chat-qa.vercel.app/performance",
    siteName: "Document Q&A",
    images: [
      {
        url: "https://doc-chat-qa.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Document Q&A Performance Monitoring",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Performance Monitoring - Document Q&A",
    description:
      "Monitor the performance of Document Q&A with Core Web Vitals tracking.",
    images: ["https://doc-chat-qa.vercel.app/og-image.png"],
  },
};

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Performance Monitoring</h1>

        <div className="prose dark:prose-invert mb-10">
          <p className="text-xl">
            We continuously monitor our application performance to ensure the
            best user experience. Below are the real-time Core Web Vitals
            metrics for this page.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <WebVitals />
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold">Why Performance Matters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-medium mb-3">User Experience</h3>
              <p className="text-muted-foreground">
                Fast-loading pages create a smooth, enjoyable experience for
                your users. Studies show that 53% of mobile site visits are
                abandoned if pages take longer than 3 seconds to load.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-medium mb-3">SEO Impact</h3>
              <p className="text-muted-foreground">
                Core Web Vitals are a key ranking factor for Google. Better
                performance metrics can lead to higher search rankings and
                increased visibility.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-medium mb-3">Conversion Rates</h3>
              <p className="text-muted-foreground">
                Every 100ms decrease in page load time can increase conversion
                rates by 1%. Faster sites convert more visitors into customers.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-medium mb-3">Accessibility</h3>
              <p className="text-muted-foreground">
                Performance optimization often goes hand-in-hand with
                accessibility improvements, making your site more usable for
                everyone, including those with disabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
