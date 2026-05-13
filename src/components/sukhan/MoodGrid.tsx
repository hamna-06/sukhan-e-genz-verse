import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MOODS = [
  { tag: "mohabbat", emoji: "🌹", label: "Mohabbat" },
  { tag: "judaai", emoji: "💔", label: "Judaai" },
  { tag: "tanhaai", emoji: "☕", label: "Tanhaai" },
  { tag: "gham", emoji: "🥀", label: "Gham" },
  { tag: "umeed", emoji: "✨", label: "Umeed" },
  { tag: "junoon", emoji: "🚀", label: "Junoon" },
  { tag: "barish", emoji: "🌧️", label: "Barish" },
  { tag: "shab", emoji: "🌙", label: "Shab" },
  { tag: "zindagi", emoji: "🛣️", label: "Zindagi" },
  { tag: "dosti", emoji: "🤝", label: "Dosti" },
  { tag: "bewafai", emoji: "🥶", label: "Bewafai" },
  { tag: "burnout", emoji: "🔥", label: "Burnout" },
  { tag: "anxiety", emoji: "😮‍💨", label: "Anxiety" },
  { tag: "identity", emoji: "🪞", label: "Identity" },
  { tag: "hustle", emoji: "⏱️", label: "Hustle" },
];

type V = { id: string; content: string; poet: string; vibe?: string };
type Meaning = { roman?: string; english?: string; feel?: string; loading?: boolean; error?: string };

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [meanings, setMeanings] = useState<Record<string, Meaning>>({});

  const pick = async (tag: string) => {
    setActive(tag); setLoading(true); setSearchResults(null); setQuery(""); setOpenId(null);
    const { data } = await supabase
      .from("poems")
      .select("id,content,poet,vibe")
      .eq("vibe", tag)
      .eq("is_two_liner", true)
      .limit(200);
    setVerses((data as any) ?? []); setLoading(false);
  };

  useEffect(() => {
    const q = query.trim();
    if (!q) { setSearchResults(null); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const moodMatch = MOODS.find((m) => m.tag.includes(q.toLowerCase()) || m.label.toLowerCase().includes(q.toLowerCase()));
      let req = supabase.from("poems").select("id,content,poet,vibe").eq("is_two_liner", true);
      if (moodMatch) req = req.eq("vibe", moodMatch.tag);
      else req = req.or(`content.ilike.%${q}%,poet.ilike.%${q}%,vibe.ilike.%${q}%`);
      const { data } = await req.limit(80);
      if (!cancelled) { setSearchResults((data as any) ?? []); setSearching(false); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const list = useMemo<V[]>(() => searchResults ?? verses, [searchResults, verses]);
  const showing = searchResults !== null;

  const reveal = async (v: V) => {
    const next = openId === v.id ? null : v.id;
    setOpenId(next);
    if (!next) return;
    if (meanings[v.id]?.english || meanings[v.id]?.loading) return;
    setMeanings((m) => ({ ...m, [v.id]: { loading: true } }));
    try {
      const res = await fetch("/api/meaning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: clean(v.content), poet: v.poet }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setMeanings((m) => ({ ...m, [v.id]: { ...data, loading: false } }));
    } catch (e) {
      setMeanings((m) => ({ ...m, [v.id]: { loading: false, error: e instanceof Error ? e.message : "Failed" } }));
    }
  };

  return (
    <div className="bento p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 03</p>
      <h2 className="display text-2xl md:text-3xl mt-1">Vibe Discovery</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">Pick a mood, search, or tap any verse to reveal its meaning.</p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: love, burnout, Ghalib, dil…"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[color:var(--secondary)]/40 border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--emerald-glow)] transition"
        />
        {searching && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
            <span className="text-xl">{m.emoji}</span>
            <span className="text-[9px] uppercase tracking-widest">{m.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(active || showing) && (
          <motion.div
            key={showing ? `q-${query}` : active}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 space-y-3 max-h-[460px] overflow-y-auto pr-1"
          >
            {(loading || searching) && <p className="text-xs text-muted-foreground">Tuning in…</p>}
            {!loading && !searching && list.length === 0 && (
              <p className="text-xs text-muted-foreground">No verses found.</p>
            )}
            {!loading && !searching && list.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {list.length} verses {showing ? `· "${query}"` : ""} · tap to see meaning
              </p>
            )}
            {list.map((v) => {
              const isOpen = openId === v.id;
              const m = meanings[v.id];
              return (
                <button
                  key={v.id}
                  onClick={() => reveal(v)}
                  className={`w-full text-left rounded-xl p-4 border transition ${
                    isOpen
                      ? "bg-[color:var(--emerald-deep)]/30 border-[color:var(--emerald-glow)]/50"
                      : "bg-[color:var(--secondary)]/40 border-[color:var(--border)] hover:border-[color:var(--emerald-glow)]/40"
                  }`}
                >
                  <p className="urdu text-lg" dir="rtl">{clean(v.content)}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <p className="text-[10px] uppercase tracking-widest opacity-60">— {v.poet}{v.vibe ? ` · ${v.vibe}` : ""}</p>
                    <span className="text-[10px] uppercase tracking-widest text-[color:var(--emerald-glow)] flex items-center gap-1">
                      {isOpen ? <><X className="w-3 h-3" /> close</> : <><Sparkles className="w-3 h-3" /> meaning</>}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-[color:var(--border)] space-y-1.5">
                          {m?.loading && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin" /> Reading the verse…
                            </p>
                          )}
                          {m?.error && <p className="text-xs text-destructive">{m.error}</p>}
                          {m?.roman && <p className="text-xs italic opacity-80">{m.roman}</p>}
                          {m?.english && <p className="text-sm text-[color:var(--cream)]">{m.english}</p>}
                          {m?.feel && (
                            <p className="text-[10px] uppercase tracking-widest text-[color:var(--emerald-glow)]">
                              {m.feel}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
