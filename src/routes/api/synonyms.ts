import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/synonyms")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { word } = (await request.json()) as { word?: string };
          if (!word || !word.trim()) {
            return json({ error: "Word required" }, 400);
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return json({ error: "AI not configured" }, 500);

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
                    "You are an Urdu thesaurus. The user provides a word or short phrase in Urdu, Roman Urdu, or English. Return a JSON object with this exact shape:\n{\n  \"input\": string,                 // the word/phrase the user gave, normalized\n  \"meaning\": string,                // a one-line English meaning\n  \"khalis\": string,                 // the most elegant Khalis Urdu equivalent in Nastaliq script\n  \"synonyms\": [                     // 8-12 entries, ordered by elegance/usage\n    { \"urdu\": string,               // synonym in Urdu Nastaliq script\n      \"roman\": string,              // Roman Urdu transliteration\n      \"nuance\": string }            // 3-7 word English nuance/flavor\n  ],\n  \"phrases\": [                      // 3-5 short literary phrases or idioms using the word\n    { \"urdu\": string, \"english\": string }\n  ]\n}\nReturn ONLY valid JSON. No markdown, no commentary, no code fences.",
                },
                { role: "user", content: word.trim() },
              ],
              temperature: 0.5,
              response_format: { type: "json_object" },
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return json({ error: `AI gateway error ${res.status}`, details: body }, res.status);
          }

          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
          let parsed: unknown = {};
          try {
            parsed = JSON.parse(raw);
          } catch {
            const m = raw.match(/\{[\s\S]*\}/);
            if (m) {
              try { parsed = JSON.parse(m[0]); } catch { parsed = { error: "Bad AI JSON" }; }
            }
          }
          return json(parsed, 200);
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
