import { PostHog } from "posthog-node";

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !host) {
    client = null;
    return null;
  }

  client = new PostHog(apiKey, { host });
  return client;
}

export function captureServerException(
  error: unknown,
  properties?: Record<string, unknown>,
) {
  const ph = getClient();
  if (!ph) return;

  ph.captureException(error, "server", { properties });
}
