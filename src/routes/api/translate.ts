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
                    "You are an expert Urdu literary translator. Convert the user's input (which may be Roman Urdu, English, casual Urdu, or mixed) into elegant, classical 'Khalis Urdu' written in proper Nastaliq Urdu script. Use refined, literary vocabulary (e.g. مسرّت instead of خوشی, محبّت instead of پیار where appropriate). Preserve the meaning and tone faithfully. Return ONLY the Urdu translation as a single line — no transliteration, no explanation, no quotes, no English.",
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
