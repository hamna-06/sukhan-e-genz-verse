import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Loader2, Sparkles, Volume2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Synonym = { urdu: string; roman: string; nuance: string };
type Phrase = { urdu: string; english: string };
type Result = {
  input?: string;
  meaning?: string;
  khalis?: string;
  synonyms?: Synonym[];
  phrases?: Phrase[];
  error?: string;
};

const SUGGESTIONS = ["love", "sad", "happy", "moon", "rain", "alone", "hope", "fire", "dream", "silence"];

export function PoetryLibrary() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const search = async (term?: string) => {
    const word = (term ?? query).trim();
    if (!word) return;
    setQuery(word);
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/synonyms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = (await res.json()) as Result;
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not fetch");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1200);
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ur-PK";
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="bento p-6 md:p-8 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 02</p>
          <h2 className="display text-2xl md:text-3xl mt-1">Lafz Khazana</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Type a word — discover its many shades in Urdu.
          </p>
        </div>
        <BookOpen className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); search(); }}
        className="relative mb-3"
      >
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. love, moon, sad, junoon, mohabbat…"
          className="w-full pl-9 pr-28 py-3 rounded-xl bg-[color:var(--secondary)]/40 border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--emerald-glow)] transition"
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[color:var(--cream)] text-[color:var(--background)] text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Discover
        </button>
      </form>

      {!result && !busy && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground self-center mr-1">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => search(s)}
              className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-[color:var(--secondary)]/40 border border-[color:var(--border)] hover:border-[color:var(--emerald-glow)] transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-[480px] overflow-y-auto pr-1 -mr-1">
        {busy && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Curating khazana…
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Hero card */}
              {result.khalis && (
                <div className="rounded-2xl p-5 bg-[color:var(--emerald-deep)]/30 border border-[color:var(--emerald-glow)]/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--emerald-glow)] mb-1">
                        {result.input ?? query}
                      </p>
                      <p className="urdu text-3xl text-[color:var(--cream)]" dir="rtl">{result.khalis}</p>
                      {result.meaning && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{result.meaning}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => speak(result.khalis!)} className="p-2 rounded-lg bg-[color:var(--background)]/40 hover:bg-[color:var(--background)]/60">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copy(result.khalis!)} className="p-2 rounded-lg bg-[color:var(--background)]/40 hover:bg-[color:var(--background)]/60">
                        {copied === result.khalis ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Synonyms grid */}
              {result.synonyms && result.synonyms.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Synonyms · {result.synonyms.length}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {result.synonyms.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-xl p-3 bg-[color:var(--secondary)]/40 border border-[color:var(--border)] flex items-center justify-between gap-3 group hover:border-[color:var(--emerald-glow)]/50 transition"
                      >
                        <div className="min-w-0">
                          <p className="urdu text-xl text-[color:var(--cream)] truncate" dir="rtl">{s.urdu}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            <span className="opacity-80">{s.roman}</span>
                            {s.nuance && <span className="opacity-60"> · {s.nuance}</span>}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition">
                          <button onClick={() => speak(s.urdu)} className="p-1.5 rounded-md hover:bg-[color:var(--background)]/40">
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => copy(s.urdu)} className="p-1.5 rounded-md hover:bg-[color:var(--background)]/40">
                            {copied === s.urdu ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phrases */}
              {result.phrases && result.phrases.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Literary phrases
                  </p>
                  <div className="space-y-2">
                    {result.phrases.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 bg-[color:var(--secondary)]/30 border border-[color:var(--border)]"
                      >
                        <p className="urdu text-lg text-[color:var(--cream)] text-right" dir="rtl">{p.urdu}</p>
                        <p className="text-[11px] text-muted-foreground italic mt-1">{p.english}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
