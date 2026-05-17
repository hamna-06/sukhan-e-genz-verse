import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/kafiya")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { word } = (await request.json()) as { word?: string };
          if (!word || !word.trim()) return json({ error: "Word required" }, 400);

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
                    'You are an Urdu rhyme/Kafiya finder for poets. Given a word (Urdu, Roman Urdu, or English concept like "love", "rain", "moon"), first convert it to the closest single Urdu word, then find 10-14 true Urdu rhyming words (qaafiya / ham-aawaz) — same ending sound and meter. Prefer real, commonly used poetic words. Return ONLY JSON, no markdown:\n{\n  "input": string,                  // user input as given\n  "base": string,                   // base word in Urdu Nastaliq\n  "baseRoman": string,              // roman transliteration of base\n  "rhymes": [                       // 10-14 entries\n    { "urdu": string,               // rhyming word in Urdu Nastaliq\n      "roman": string,              // roman transliteration\n      "meaning": string }           // 2-5 word English meaning\n  ],\n  "couplet": { "urdu": string, "english": string } // ONE short 2-line couplet (sher) using the base word and one rhyme; "urdu" contains both lines separated by \\n\n}',
                },
                { role: "user", content: word.trim() },
              ],
              temperature: 0.6,
              response_format: { type: "json_object" },
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return json({ error: `AI gateway error ${res.status}`, details: body }, res.status);
          }

          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
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
