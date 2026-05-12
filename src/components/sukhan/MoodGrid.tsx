import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const MOODS = [
  { tag: "barish", emoji: "🌧️", label: "Barish" },
  { tag: "tanhaai", emoji: "☕", label: "Tanhaai" },
  { tag: "junoon", emoji: "🚀", label: "Junoon" },
  { tag: "mohabbat", emoji: "🌹", label: "Mohabbat" },
  { tag: "umeed", emoji: "✨", label: "Umeed" },
  { tag: "shab", emoji: "🌙", label: "Shab" },
];

type V = { id: string; content: string; poet: string };

export function MoodGrid() {
  const [active, setActive] = useState<string | null>(null);
  const [verses, setVerses] = useState<V[]>([]);
  const [loading, setLoading] = useState(false);

  const pick = async (tag: string) => {
    setActive(tag); setLoading(true);
    const { data } = await supabase.from("poems").select("id,content,poet").eq("vibe", tag).eq("is_two_liner", true);
    setVerses((data as any) ?? []); setLoading(false);
  };

  return (
    <div className="bento p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 03</p>
      <h2 className="display text-2xl md:text-3xl mt-1">Vibe Discovery</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-5">Pick a mood. Get the verse.</p>

      <div className="grid grid-cols-3 gap-3">
        {MOODS.map((m) => (
          <motion.button
            key={m.tag}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => pick(m.tag)}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
              active === m.tag
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
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1"
          >
            {loading && <p className="text-xs text-muted-foreground">Tuning in…</p>}
            {!loading && verses.length === 0 && (
              <p className="text-xs text-muted-foreground">No verses yet for this mood.</p>
            )}
            {!loading && verses.length > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{verses.length} verses</p>
            )}
            {verses.map((v) => (
              <div key={v.id} className="rounded-xl p-4 bg-[color:var(--secondary)]/40 border border-[color:var(--border)]">
                <p className="urdu text-lg whitespace-pre-line">{v.content}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">— {v.poet}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
