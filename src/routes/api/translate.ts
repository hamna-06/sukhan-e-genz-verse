import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { text } = (await request.json()) as { text?: string };
          if (!text || typeof text !== "string" || !text.trim()) {
            return new Response(JSON.stringify({ error: "Text required" }), {
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
                    "You are a multilingual NLP engine and master Urdu literary translator. The user's input can be in ANY language or script — English, Roman Urdu, Hindi/Hinglish, Devanagari, Arabic, Persian, Punjabi, Pashto, Bengali, Turkish, Spanish, French, Chinese, casual slang, Gen-Z lingo, abbreviations, emojis, code-mixed sentences, voice-style fragments, or even questions/commands. Your job:\n1. Silently detect the language(s) and intent (statement, question, greeting, request, emotion).\n2. Understand the full meaning, tone, and nuance — including idioms and slang.\n3. Reply with ONE elegant line of pure 'Khalis Urdu' in proper Nastaliq script that faithfully conveys the same meaning, tone, and intent. Keep questions as questions, greetings as greetings, etc.\n4. Use refined classical vocabulary where natural (مسرّت, محبّت, شکریہ, خیر مقدم, عرض ہے) but stay readable. No Hindi/Sanskrit loanwords, no English words, no Roman script.\n5. Output ONLY the Urdu sentence. No transliteration, no translation notes, no quotes, no markdown, no preface.",
                },
                { role: "user", content: text.trim() },
              ],
              temperature: 0.4,
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return new Response(
              JSON.stringify({ error: `AI gateway error ${res.status}`, details: body }),
              { status: res.status, headers: { "content-type": "application/json" } },
            );
          }

          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const translation = data.choices?.[0]?.message?.content?.trim() ?? "";
          return new Response(JSON.stringify({ translation }), {
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
