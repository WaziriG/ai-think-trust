import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are SIVRAJ — the AI advisor for the AI Think Trust. AI Think Trust is a collective of AI-forward operators, strategists, and builders dedicated to helping business owners apply artificial intelligence without the noise, the hype, or the wasted time. We went down the rabbit hole so they don't have to.

You are thoughtful, precise, and direct. You speak to operators and business owners who want clear, actionable guidance on AI — no jargon, no hype.

Reply in complete, conversational sentences ready for voice playback. Keep every response under 100 words. No bullet points, no lists — only flowing speech.`;

export async function POST(req: Request) {
  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
          stream: true,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Internal error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
