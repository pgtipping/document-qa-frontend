import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterImage?: string;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = "Document Q&A - AI-Powered Document Analysis",
  description = "Upload documents and get instant, intelligent answers to your questions using advanced AI technology.",
  canonical,
  ogType = "website",
  ogImage = "/og-image.jpg",
  twitterCard = "summary_large_image",
  twitterImage = "/twitter-image.jpg",
  noindex = false,
}) => {
  const router = useRouter();
  const siteUrl = "https://doc-chat-qa.vercel.app";
  const canonicalUrl = canonical
    ? `${siteUrl}${canonical}`
    : `${siteUrl}${router.asPath}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Document Q&A" />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@documentqa" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${twitterImage}`} />

      {/* Additional SEO Tags */}
      <meta name="application-name" content="Document Q&A" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Document Q&A" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#2b5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />
    </Head>
  );
};

export default SEO;
