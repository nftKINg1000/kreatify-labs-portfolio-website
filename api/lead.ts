/*
  Vercel Function adapter for POST /api/lead (Web-standard handler signature).
  Configure delivery with server-side environment variables (never VITE_*):
    RESEND_API_KEY + LEAD_TO_EMAIL + LEAD_FROM_EMAIL   → email via Resend
    or LEAD_WEBHOOK_URL                                → JSON webhook (Slack, Make, Zapier, n8n…)
  ALLOWED_ORIGINS (comma-separated) restricts cross-origin posts.
  Without any transport the endpoint answers 503 not_configured and the form offers email instead.
*/
import { handleLeadRequest, memoryRateLimiter, transportFromEnv } from '../server/lead-handler.js';

const rateLimiter = memoryRateLimiter();

export async function POST(request: Request): Promise<Response> {
  const env = process.env;
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  return handleLeadRequest(request, {
    env,
    transport: transportFromEnv(env),
    rateLimiter,
    clientAddress: forwarded.split(',')[0]?.trim() || undefined,
  });
}
