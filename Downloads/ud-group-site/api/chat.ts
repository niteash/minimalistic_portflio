// Vercel Edge Function — POST /api/chat
//
// Requires an ANTHROPIC_API_KEY environment variable set in your Vercel
// project settings (Project → Settings → Environment Variables). Never
// commit the key itself; this file only reads it from process.env so it
// stays server-side and is never shipped to the browser.
//
// The client (src/components/Chatbot.tsx) just reads this response body as
// plain streaming text — all the Anthropic-specific SSE event parsing
// happens here, server-side, so the frontend doesn't need to know
// anything about Anthropic's wire format.

export const config = {
  runtime: "edge",
};

const SYSTEM_PROMPT = `You are the Virtual Concierge for Amara Garden City, a real estate development by UD Group in Amarapura, Mandalay, Myanmar. You help prospective buyers and investors with information about the project: site location and surroundings (near Taung Tha Man lake, ~35km from Mandalay International Airport), sustainability commitments, unit types, and the broader UD Group business (light trucks, generators, crane services, founded 2002). Be warm, concise, and concrete. If you don't know a specific fact (exact pricing, unit availability, legal terms), say so plainly and suggest contacting the sales team directly rather than guessing.`;

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "Server is missing ANTHROPIC_API_KEY — set it in your deployment's environment variables.",
      { status: 500 }
    );
  }

  let body: { message: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return new Response("Missing 'message' field", { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history : [];

  const messages = [
    ...history.map((m) => ({
      role: m.role,
      content: m.text,
    })),
    { role: "user", content: body.message },
  ];

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    }),
  });

  if (!anthropicResponse.ok || !anthropicResponse.body) {
    const errText = await anthropicResponse.text().catch(() => "");
    return new Response(`Upstream error: ${errText || anthropicResponse.statusText}`, {
      status: 502,
    });
  }

  // Translate Anthropic's SSE event stream (event: content_block_delta,
  // data: {"delta":{"text":"..."}}, ...) into a plain text stream — the
  // client just appends bytes as they arrive, no JSON parsing needed there.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const plainTextStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = anthropicResponse.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              // Ignore lines that aren't valid JSON (SSE comments, etc.)
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }

      controller.close();
    },
  });

  return new Response(plainTextStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
