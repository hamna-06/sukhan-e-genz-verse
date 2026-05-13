import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MOODS = [
  { tag: "barish", emoji: "🌧️", label: "Barish" },
  { tag: "tanhaai", emoji: "☕", label: "Tanhaai" },
  { tag: "junoon", emoji: "🚀", label: "Junoon" },
  { tag: "mohabbat", emoji: "🌹", label: "Mohabbat" },
  { tag: "umeed", emoji: "✨", label: "Umeed" },
  { tag: "shab", emoji: "🌙", label: "Shab" },
];

type V = { id: string; content: string; poet: string; vibe?: string };

// Normalise stored content: turn literal "\n" sequences and CRs into real newlines,
// then collapse to a single space so verses render as one clean line.
function clean(text: string) {
  return (text ?? "")
    .replace(/\\n/g, " ")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function MoodGrid() {
  const [active, setActive] = useState<string | null>(null);
  const [verses, setVerses] = useState<V[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<V[] | null>(null);

  const pick = async (tag: string) => {
    setActive(tag); setLoading(true); setSearchResults(null); setQuery("");
    const { data } = await supabase.from("poems").select("id,content,poet,vibe").eq("vibe", tag).eq("is_two_liner", true);
    setVerses((data as any) ?? []); setLoading(false);
  };

  // Live search across all moods/feelings
  useEffect(() => {
    const q = query.trim();
    if (!q) { setSearchResults(null); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const moodMatch = MOODS.find((m) => m.tag.includes(q.toLowerCase()) || m.label.toLowerCase().includes(q.toLowerCase()));
      let req = supabase.from("poems").select("id,content,poet,vibe").eq("is_two_liner", true);
      if (moodMatch) {
        req = req.eq("vibe", moodMatch.tag);
      } else {
        req = req.or(`content.ilike.%${q}%,poet.ilike.%${q}%,vibe.ilike.%${q}%`);
      }
      const { data } = await req.limit(50);
      if (!cancelled) { setSearchResults((data as any) ?? []); setSearching(false); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const list = useMemo<V[]>(() => searchResults ?? verses, [searchResults, verses]);
  const showing = searchResults !== null;

  return (
    <div className="bento p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 03</p>
      <h2 className="display text-2xl md:text-3xl mt-1">Vibe Discovery</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">Pick a mood or search by feeling, poet, or word.</p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: love, barish, Ghalib, dil…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[color:var(--secondary)]/40 border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--emerald-glow)] transition"
        />
        {searching && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MOODS.map((m) => (
          <motion.button
            key={m.tag}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => pick(m.tag)}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
              active === m.tag && !showing
                ? "bg-[color:var(--cream)] text-[color:var(--background)] glow-ring"
                : "bg-[color:var(--secondary)]/50 hover:bg-[color:var(--emerald-deep)]"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] uppercase tracking-widest">{m.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(active || showing) && (
          <motion.div
            key={showing ? `q-${query}` : active}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1"
          >
            {(loading || searching) && <p className="text-xs text-muted-foreground">Tuning in…</p>}
            {!loading && !searching && list.length === 0 && (
              <p className="text-xs text-muted-foreground">No verses found.</p>
            )}
            {!loading && !searching && list.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {list.length} verses {showing ? `· “${query}”` : ""}
              </p>
            )}
            {list.map((v) => (
              <div key={v.id} className="rounded-xl p-4 bg-[color:var(--secondary)]/40 border border-[color:var(--border)]">
                <p className="urdu text-lg" dir="rtl">{clean(v.content)}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">— {v.poet}{v.vibe ? ` · ${v.vibe}` : ""}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
