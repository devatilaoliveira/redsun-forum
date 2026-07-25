import { APIRequestContext } from "@playwright/test";

const MAILPIT_API_URL = "http://127.0.0.1:54324/api/v1";
const SUPABASE_AUTH_SETTINGS_URL = "http://127.0.0.1:54321/auth/v1/settings";
const DEFAULT_POLL_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 250;

interface MailpitAddress {
  Address: string;
}

interface MailpitMessageSummary {
  ID: string;
  Subject: string;
  To: MailpitAddress[];
}

interface MailpitMessageList {
  messages: MailpitMessageSummary[];
  total: number;
}

interface MailpitMessage {
  HTML: string;
  Subject: string;
  Text: string;
}

interface MailpitConfirmationOptions {
  timeoutMs?: number;
}

interface SupabaseAuthSettings {
  mailer_autoconfirm: boolean;
}

export async function waitForSupabaseConfirmationUrl(
  request: APIRequestContext,
  recipient: string,
  options: MailpitConfirmationOptions = {},
): Promise<string> {
  await assertEmailConfirmationsEnabled(request);

  const timeoutMs = options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;
  const normalizedRecipient = recipient.toLowerCase();
  let lastDiagnostic = "Mailpit returned no messages.";

  while (Date.now() < deadline) {
    try {
      const listResponse = await request.get(`${MAILPIT_API_URL}/messages`, {
        params: { limit: 100 },
      });

      if (!listResponse.ok()) {
        lastDiagnostic = `Mailpit message list returned ${listResponse.status()} ${listResponse.statusText()}.`;
      } else {
        const messageList = await listResponse.json() as MailpitMessageList;
        const matchingMessage = messageList.messages.find((message) =>
          message.To.some((address) => address.Address.toLowerCase() === normalizedRecipient),
        );

        if (matchingMessage) {
          const messageResponse = await request.get(
            `${MAILPIT_API_URL}/message/${encodeURIComponent(matchingMessage.ID)}`,
          );

          if (!messageResponse.ok()) {
            lastDiagnostic =
              `Mailpit found "${matchingMessage.Subject}" for ${recipient}, but fetching it returned ` +
              `${messageResponse.status()} ${messageResponse.statusText()}.`;
          } else {
            const message = await messageResponse.json() as MailpitMessage;
            const confirmationUrl = extractSupabaseConfirmationUrl(message);

            if (confirmationUrl) {
              return confirmationUrl;
            }

            lastDiagnostic =
              `Mailpit found "${message.Subject}" for ${recipient}, but the message contained no ` +
              "Supabase signup confirmation URL.";
          }
        } else {
          const recipients = messageList.messages
            .flatMap((message) => message.To.map((address) => address.Address))
            .slice(0, 10);
          lastDiagnostic =
            `Mailpit contained ${messageList.total} message(s), with recent recipients: ` +
            `${recipients.length ? recipients.join(", ") : "(none)"}.`;
        }
      }
    } catch (error) {
      lastDiagnostic = `Mailpit request failed: ${error instanceof Error ? error.message : String(error)}.`;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for a Supabase confirmation email to ${recipient}. ` +
    lastDiagnostic,
  );
}

async function assertEmailConfirmationsEnabled(request: APIRequestContext): Promise<void> {
  const response = await request.get(SUPABASE_AUTH_SETTINGS_URL);
  if (!response.ok()) {
    throw new Error(
      "Could not verify local Supabase Auth settings: " +
      `${response.status()} ${response.statusText()}.`,
    );
  }

  const settings = await response.json() as SupabaseAuthSettings;
  if (settings.mailer_autoconfirm) {
    throw new Error(
      "Local Supabase Auth is still auto-confirming email addresses and will not send a " +
      "confirmation message. Run `.\\local.ps1 reset` from the repository root to restart " +
      "Supabase and load auth.email.enable_confirmations=true.",
    );
  }
}

function extractSupabaseConfirmationUrl(message: MailpitMessage): string | null {
  const html = decodeHtmlEntities(message.HTML);
  const candidates = [
    ...extractHrefValues(html),
    ...extractUrls(html),
    ...extractUrls(message.Text),
  ];

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (
        url.pathname.endsWith("/auth/v1/verify") &&
        url.searchParams.get("type") === "signup"
      ) {
        return url.toString();
      }
    } catch {
      // Ignore non-URL href values and keep looking for the confirmation link.
    }
  }

  return null;
}

function extractHrefValues(html: string): string[] {
  return [...html.matchAll(/href\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)]
    .map((match) => match[1] ?? match[2])
    .filter((value): value is string => Boolean(value));
}

function extractUrls(content: string): string[] {
  return content.match(/https?:\/\/[^\s"'<>]+/gi) ?? [];
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:amp|quot|apos|lt|gt|#(\d+)|#x([0-9a-f]+));/gi,
    (entity, decimal: string | undefined, hexadecimal: string | undefined): string => {
      if (decimal) {
        return String.fromCodePoint(Number.parseInt(decimal, 10));
      }
      if (hexadecimal) {
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      }

      const namedEntities: Record<string, string> = {
        "&amp;": "&",
        "&apos;": "'",
        "&gt;": ">",
        "&lt;": "<",
        "&quot;": "\"",
      };
      return namedEntities[entity.toLowerCase()] ?? entity;
    },
  );
}
