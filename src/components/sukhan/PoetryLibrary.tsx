import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Volume2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Poem = {
  id: string; title: string; poet: string; content: string; vibe: string;
  difficult_words: string[]; is_two_liner: boolean;
};
type Word = { word: string; meaning: string; etymology: string | null };

export function PoetryLibrary() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [active, setActive] = useState<Word | null>(null);

  useEffect(() => {
    supabase.from("poems").select("*").eq("is_two_liner", false).then(({ data }) => {
      setPoems((data as any) ?? []);
    });
  }, []);

  const openWord = async (w: string) => {
    const { data } = await supabase.from("urdu_words").select("*").eq("word", w).maybeSingle();
    if (data) setActive(data as Word);
    else setActive({ word: w, meaning: "Meaning not yet curated.", etymology: null });
  };

  const renderContent = (content: string, difficult: string[]) => {
    const tokens = content.split(/(\s+)/);
    return tokens.map((t, i) => {
      if (difficult.includes(t)) {
        return (
          <button
            key={i}
            onClick={() => openWord(t)}
            className="underline decoration-dotted decoration-[color:var(--emerald-glow)] underline-offset-4 hover:text-[color:var(--emerald-glow)] transition"
          >
            {t}
          </button>
        );
      }
      return <span key={i}>{t}</span>;
    });
  };

  return (
    <div className="bento p-6 md:p-8 relative">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 02</p>
          <h2 className="display text-2xl md:text-3xl mt-1">Interactive Library</h2>
          <p className="text-sm text-muted-foreground mt-1">Tap any glowing word to unlock its world.</p>
        </div>
        <BookOpen className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {poems.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-5 bg-[color:var(--secondary)]/40 border border-[color:var(--border)]"
          >
            <div className="flex justify-between items-baseline mb-2">
              <p className="urdu text-base text-[color:var(--cream)]">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.poet}</p>
            </div>
            <p className="urdu text-xl whitespace-pre-line">
              {renderContent(p.content, (p.difficult_words as any) ?? [])}
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
                  onClick={() => new SpeechSynthesisUtterance(active.word) && window.speechSynthesis.speak(new SpeechSynthesisUtterance(active.word))}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--emerald-deep)] text-[color:var(--cream)]"
                >
                  <Volume2 className="w-3 h-3" /> Pronounce
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Meaning</p>
                  <p>{active.meaning}</p>
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
