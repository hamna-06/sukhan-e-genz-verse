import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/meaning")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { text, poet } = (await request.json()) as { text?: string; poet?: string };
          if (!text || !text.trim()) {
            return new Response(JSON.stringify({ error: "Text required" }), {
              status: 400, headers: { "content-type": "application/json" },
            });
          }
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "AI not configured" }), {
              status: 500, headers: { "content-type": "application/json" },
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
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content:
                    "You are an Urdu poetry scholar. The user gives you a shayri (often two lines). Respond ONLY in compact JSON of shape {\"roman\":\"<roman urdu transliteration>\",\"english\":\"<one short, plain-English meaning, 1-2 sentences max>\",\"feel\":\"<2-4 word emotional vibe>\"}. Keep english natural and modern. No markdown, no extra keys, no preface.",
                },
                { role: "user", content: `${text.trim()}${poet ? `\n— ${poet}` : ""}` },
              ],
              temperature: 0.5,
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return new Response(JSON.stringify({ error: `AI error ${res.status}`, details: body }), {
              status: res.status, headers: { "content-type": "application/json" },
            });
          }

          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          let raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
          // strip code fences if any
          raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
          let parsed: { roman?: string; english?: string; feel?: string } = {};
          try { parsed = JSON.parse(raw); } catch { parsed = { english: raw }; }

          return new Response(JSON.stringify(parsed), {
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
