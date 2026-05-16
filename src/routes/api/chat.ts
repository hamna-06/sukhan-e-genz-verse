import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { messages?: ChatMsg[] };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          if (messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "AI not configured" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }

          // Keep last 12 turns for context
          const history = messages.slice(-12).map((m) => ({
            role: m.role,
            content: String(m.content ?? "").slice(0, 2000),
          }));
          const hasRealUserInput = history.some(
            (m) => m.role === "user" && m.content.trim().length > 0,
          );
          if (!hasRealUserInput) {
            return new Response(JSON.stringify({ error: "user message required" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "You are 'سخن' — a real-time multilingual chatbot that replies only in natural Urdu Nastaliq.\n\nUNDERSTAND:\n- The user may write in English, Roman Urdu, Urdu, Hindi/Hinglish, Arabic, Persian, Punjabi, slang, emojis, mixed text, typos, or any other language. Silently detect meaning and intent.\n- Use the user's latest message as the main question. Use earlier turns only when they are clearly relevant. Do not invent a topic.\n\nREPLY STYLE:\n- ALWAYS answer in Urdu Nastaliq only. No Roman letters, no English words, no markdown, no labels.\n- Be useful and direct, like a real chatbot. If the message is vague (for example: 'your opinion?', 'tell me', 'fix it') and no clear topic exists, ask one short clarifying question instead of guessing.\n- Keep answers SHORT: usually one sentence; maximum two concise sentences.\n- For factual questions, give the actual answer first. For greetings, reply warmly but briefly. For emotional text, show brief empathy.\n- Use refined Urdu, but keep it conversational and easy to read. Avoid long poetic introductions, repeated greetings, and unnecessary explanations.",
                },
                ...history,
              ],
              temperature: 0.35,
              max_tokens: 180,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            return new Response(
              JSON.stringify({ error: `AI gateway error ${res.status}`, details: errText }),
              { status: res.status, headers: { "content-type": "application/json" } },
            );
          }

          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
          return new Response(JSON.stringify({ reply }), {
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
