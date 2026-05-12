import { supabase } from "@/integrations/supabase/client";

let cache: Record<string, string> | null = null;

export async function loadRefinements() {
  if (cache) return cache;
  const { data } = await supabase.from("refinements").select("common_word, khalis_word");
  cache = {};
  data?.forEach((r) => { cache![r.common_word.toLowerCase()] = r.khalis_word; });
  return cache!;
}

export function refineText(text: string, dict: Record<string, string>) {
  return text.replace(/[\p{L}]+/gu, (w) => {
    const k = w.toLowerCase();
    return dict[k] ?? w;
  });
}

export function suggestWord(token: string, dict: Record<string, string>) {
  if (!token) return null;
  const k = token.toLowerCase();
  return dict[k] ?? null;
}
