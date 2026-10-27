import "server-only";
import { z } from "zod";

const schema = z.object({
  API_INTERNAL_URL: z.url(),
  API_PROXY_SECRET: z
    .string()
    .min(32, "must match the API's WEB_PROXY_SECRET (≥ 32 characters)"),
});

export type ServerEnv = z.output<typeof schema>;

let cached: ServerEnv | undefined;

/**
 * Server-only configuration, validated on first use. Never imported by
 * client components (`server-only` makes that a build error).
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  cached = result.data;
  return cached;
}
