import OpenAI from "openai";
import { getPropertyContext } from "@/lib/property-context";

export async function POST(request: Request) {
  const { messages, propertyId } = await request.json();

  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (!assistantId) {
    return Response.json(
      { error: "OPENAI_ASSISTANT_ID is not configured" },
      { status: 500 }
    );
  }

  const openai = new OpenAI();
  const context = await getPropertyContext(propertyId);

  const thread = await openai.beta.threads.create();

  // Add context as a system-like first message
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `[Property Context]\n${context}\n\n---\nPlease use the above property information to answer questions. Do not mention that you received this context.`,
  });

  // Add user messages
  for (const msg of messages) {
    await openai.beta.threads.messages.create(thread.id, {
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistantId,
      });

      run.on("textDelta", (delta) => {
        if (delta.value) {
          controller.enqueue(encoder.encode(delta.value));
        }
      });

      run.on("end", () => {
        controller.close();
      });

      run.on("error", (error) => {
        console.error("Assistant stream error:", error);
        controller.error(error);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
