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
  // additionalPaths can be used to add paths not automatically discovered,
  // but blog/tutorial pages should be found automatically now.
  // We keep a few key pages here for explicit priority/changefreq control.
  additionalPaths: async (config) => {
    const paths = [
      {
        loc: "/",
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: "/blog", // Main blog index
        changefreq: "weekly",
        priority: 0.8,
      },
      {
        loc: "/tutorials", // Assuming a tutorials index exists or will exist
        changefreq: "weekly",
        priority: 0.8,
      },
      // Add other key static pages if needed
    ];
    // The library automatically adds lastmod based on git history or file modification time
    // when autoLastmod is true (default).
    return paths;
  },
  // The default transform function is usually sufficient when autoLastmod is true.
  // We remove the custom transform to rely on defaults for accurate lastmod.
  // transform: async (config, path) => {
  //   return {
  //     loc: path, // The path
  //     changefreq: config.changefreq, // Default changefreq
  //     priority: config.priority, // Default priority
  //     lastmod: config.autoLastmod ? new Date().toISOString() : undefined, // Default autoLastmod
  //   }
  // },
};
