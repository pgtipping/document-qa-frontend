import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Backlink Strategy - Document Q&A",
  description:
    "Learn about our backlink strategy for Document Q&A and how to partner with us for mutual SEO benefits.",
  keywords:
    "backlink strategy, SEO, document analysis, link building, digital marketing, document Q&A, partnerships",
  openGraph: {
    title: "Backlink Strategy - Document Q&A",
    description:
      "Learn about our backlink strategy for Document Q&A and how to partner with us for mutual SEO benefits.",
    url: "https://doc-chat-qa.vercel.app/backlink-strategy",
    siteName: "Document Q&A",
    images: [
      {
        url: "https://doc-chat-qa.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Document Q&A Backlink Strategy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backlink Strategy - Document Q&A",
    description:
      "Learn about our backlink strategy for Document Q&A and how to partner with us for mutual SEO benefits.",
    images: ["https://doc-chat-qa.vercel.app/og-image.png"],
  },
};

export default function BacklinkStrategyPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Backlink Strategy</h1>

        <div className="prose dark:prose-invert mb-10">
          <p className="text-xl mb-6">
            Building a strong backlink profile is essential for improving our
            search engine rankings and driving organic traffic to Document Q&A.
          </p>

          <p className="mb-4">
            Our backlink strategy focuses on creating high-quality, relevant
            connections with authoritative websites in the document analysis,
            AI, and productivity spaces. We believe in ethical link building
            that provides value to users and partner websites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Our Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Create valuable, shareable content that naturally attracts
                    backlinks
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Develop strategic partnerships with complementary businesses
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Guest posting on industry-leading blogs and publications
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Participate in relevant online communities and forums
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Leverage social media to amplify content reach</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partnership Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Access to our growing user base of document analysis
                    professionals
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Co-marketing opportunities for complementary products
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Shared content creation and cross-promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>
                    Mutual SEO benefits through relevant, high-quality backlinks
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Potential for integration partnerships</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-sm border mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Target Industries for Backlinks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Legal Tech</h3>
              <p className="text-sm text-muted-foreground">
                Law firms, legal research platforms, contract management tools
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Academic Research</h3>
              <p className="text-sm text-muted-foreground">
                Universities, research institutions, academic journals
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">AI & Machine Learning</h3>
              <p className="text-sm text-muted-foreground">
                AI platforms, ML tools, NLP resources
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Business Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Data analysis tools, business reporting platforms
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Knowledge Management</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise knowledge bases, information management systems
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Productivity Tools</h3>
              <p className="text-sm text-muted-foreground">
                Document management, workflow automation, collaboration
                platforms
              </p>
            </div>
          </div>
        </div>

        <div className="text-center p-8 bg-primary/5 rounded-lg border border-primary/20">
          <h2 className="text-2xl font-semibold mb-4">Partner With Us</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Interested in exploring partnership opportunities with Document Q&A?
            We're always looking for strategic partners who share our vision for
            intelligent document analysis.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/contact">Contact Our Partnership Team</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
