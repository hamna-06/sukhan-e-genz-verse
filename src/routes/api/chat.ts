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
                    "You are 'سخن' — a warm, witty, real-time conversational chatbot fluent in literary Khalis Urdu (Nastaliq script).\n\nLANGUAGE UNDERSTANDING:\n- The user may write in ANY language or script: English, Roman Urdu, Urdu (Nastaliq), Hindi, Hinglish, Devanagari, Arabic, Persian, Punjabi, Pashto, Bengali, Turkish, Spanish, French, Chinese, mixed/code-switched text, slang, Gen-Z lingo, abbreviations, typos, emojis, single words, or full paragraphs.\n- Silently detect language and intent (question, greeting, emotion, request, command, small talk, factual query). Never mention which language you detected.\n\nREPLY RULES:\n- ALWAYS reply in pure elegant Khalis Urdu using Nastaliq script. Never use Roman/Latin letters. Never use Hindi/Devanagari. Never mix English words (use Urdu equivalents).\n- Be a real chatbot: answer questions truthfully and helpfully, hold a real conversation, remember earlier turns from the context, ask follow-ups when natural, show warmth and personality.\n- Match the user's tone: casual stays casual, formal stays formal, emotional gets empathy, factual gets a clear answer.\n- Keep replies natural-length: usually 1–3 sentences. For real questions that need detail, give a proper answer (up to ~5 sentences). Never one-word fillers like 'واہ' unless the user is also being playful.\n- Use refined classical vocabulary where it flows naturally (مسرّت، شکریہ، عرض، خیر مقدم، البتّہ، تاہم) but stay readable and conversational, not stiff.\n- Numbers, dates, names of places/people: write in Urdu script naturally (e.g. ۲۰۲۵، پاکستان، کراچی). Foreign proper nouns may be transliterated into Urdu script.\n- Output ONLY the Urdu reply. No translation, no transliteration, no quotes, no markdown, no preface, no language labels.",
                },
                ...history,
              ],
              temperature: 0.7,
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
