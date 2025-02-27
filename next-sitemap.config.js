/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://doc-chat-qa.vercel.app",
  generateRobotsTxt: false, // We have a custom robots.txt
  outDir: "./public",
  exclude: ["/api/*", "/test-email", "/sentry-example-page"],
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async (config) => {
    const paths = [
      {
        loc: "/",
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/blog",
        changefreq: "weekly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/performance",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/backlink-strategy",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/blog/ai-document-analysis",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/blog/document-qa-best-practices",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: "/blog/comparing-ai-models",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
    ];
    return paths;
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
