import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Volume2, X, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Poem = {
  id: string; title: string; poet: string; content: string; vibe: string;
  difficult_words: string[]; is_two_liner: boolean;
};
type Word = { word: string; meaning: string; etymology: string | null };

const MOODS = ["all", "barish", "tanhaai", "junoon", "mohabbat", "umeed", "shab"];

export function PoetryLibrary() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [active, setActive] = useState<Word | null>(null);
  const [loadingWord, setLoadingWord] = useState(false);
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<string>("all");

  useEffect(() => {
    supabase.from("poems").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setPoems((data as any) ?? []);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poems.filter((p) => {
      if (mood !== "all" && p.vibe !== mood) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.poet?.toLowerCase().includes(q) ||
        p.vibe?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q)
      );
    });
  }, [poems, query, mood]);

  const openWord = async (w: string) => {
    const clean = w.replace(/[^\p{L}]/gu, "");
    if (!clean) return;
    setLoadingWord(true);
    setActive({ word: clean, meaning: "…", etymology: null });
    const { data } = await supabase.from("urdu_words").select("word,meaning,etymology").eq("word", clean).maybeSingle();
    if (data) setActive(data as Word);
    else setActive({ word: clean, meaning: "Meaning not yet curated. Tap any word to discover its world as our dictionary grows.", etymology: null });
    setLoadingWord(false);
  };

  const renderContent = (content: string) => {
    // Every Urdu word is tappable — tokenize on whitespace.
    const tokens = content.split(/(\s+)/);
    return tokens.map((t, i) => {
      if (/^\s+$/.test(t) || !t) return <span key={i}>{t}</span>;
      return (
        <button
          key={i}
          onClick={() => openWord(t)}
          className="hover:text-[color:var(--emerald-glow)] hover:underline decoration-dotted decoration-[color:var(--emerald-glow)] underline-offset-4 transition"
        >
          {t}
        </button>
      );
    });
  };

  return (
    <div className="bento p-6 md:p-8 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 02</p>
          <h2 className="display text-2xl md:text-3xl mt-1">Interactive Library</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Tap any word to unlock its meaning.
          </p>
        </div>
        <BookOpen className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      {/* Search + mood chips */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by mood, feeling, poet or verse… (e.g. barish, junoon, Faraz)"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[color:var(--secondary)]/40 border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--emerald-glow)] transition"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest transition ${
                mood === m
                  ? "bg-[color:var(--cream)] text-[color:var(--background)]"
                  : "bg-[color:var(--secondary)]/40 border border-[color:var(--border)] hover:border-[color:var(--emerald-glow)]"
              }`}
            >
              {m}
            </button>
          ))}
          <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground self-center">
            {filtered.length} verse{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-10">
            Koi shayri nahin mili. Try another mood or word.
          </p>
        )}
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 bg-[color:var(--secondary)]/40 border border-[color:var(--border)]"
          >
            <div className="flex justify-between items-baseline mb-2 gap-2">
              <p className="urdu text-base text-[color:var(--cream)]">{p.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <span className="px-2 py-0.5 rounded-full bg-[color:var(--emerald-deep)]/40 text-[10px] uppercase tracking-widest">
                  {p.vibe}
                </span>
                <span>{p.poet}</span>
              </div>
            </div>
            <p className="urdu text-xl whitespace-pre-line leading-loose">
              {renderContent(p.content)}
            </p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bento-cream max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setActive(null)} className="absolute top-3 right-3 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
              <p className="urdu text-4xl text-center mb-2">{active.word}</p>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(active.word))}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--emerald-deep)] text-[color:var(--cream)]"
                >
                  <Volume2 className="w-3 h-3" /> Pronounce
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Meaning</p>
                  <p>{loadingWord ? "Loading…" : active.meaning}</p>
                </div>
                {active.etymology && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Etymology</p>
                    <p className="opacity-80">{active.etymology}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
