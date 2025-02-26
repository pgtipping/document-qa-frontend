// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://88c77db9a841e80677cfeb5f2cc543b2@o4508558239924224.ingest.us.sentry.io/4508875831640064",

  // Enable performance monitoring
  tracesSampleRate: 1.0,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Capture failed requests
      networkDetailAllowUrls: [
        typeof window !== "undefined" ? window.location.origin : "",
      ],
      // Capture console logs
      maskAllText: false,
    }),
  ],

  // Define how likely Replay events are sampled
  replaysSessionSampleRate: 1.0, // 100% while in development
  replaysOnErrorSampleRate: 1.0,

  // Configure error handling
  beforeSend(event) {
    // Check if the error is a chunk loading error
    if (event.exception?.values?.[0]) {
      const error = event.exception.values[0];
      if (error.type === "ChunkLoadError") {
        // Add additional context for chunk loading errors
        event.tags = {
          ...event.tags,
          errorType: "ChunkLoadError",
          chunkName:
            error.value?.match?.(/Loading chunk (.*) failed/)?.[1] || "unknown",
        };
      }
    }
    return event;
  },
});
