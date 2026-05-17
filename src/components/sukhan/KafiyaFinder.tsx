import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Search, Loader2, Sparkles, Copy, Check, X } from "lucide-react";
import { UrduSearchInput } from "./UrduSearchInput";
import { toast } from "sonner";

type Rhyme = { urdu: string; roman: string; meaning: string };
type Result = {
  input?: string;
  base?: string;
  baseRoman?: string;
  rhymes?: Rhyme[];
  couplet?: { urdu: string; english: string };
  error?: string;
};

const QUICK = ["love", "rain", "moon", "fire", "دل", "نام", "shab", "yaar"];

export function KafiyaFinder() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const search = async (term?: string) => {
    const word = (term ?? query).trim();
    if (!word) return;
    setQuery(word);
    setBusy(true);
    setResult(null);
    setOpenIdx(null);
    try {
      const res = await fetch("/api/kafiya", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = (await res.json()) as Result;
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not fetch rhymes");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("نقل ہو گیا");
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="bento p-6 md:p-8 px-7 md:px-10 relative">
      <div className="section-head mb-5">
        <p className="urdu-mini text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]" dir="rtl">
          ضمیمۂ باب دوم
        </p>
        <h2 className="nastaliq text-2xl md:text-3xl mt-1" dir="rtl">
          ہم آواز (Kafiya) Finder
        </h2>
        <p className="urdu-tight text-sm text-muted-foreground mt-1" dir="rtl">
          اپنی شاعری میں ردم لائیں۔ ایک لفظ لکھیں اور اس کے ہم وزن قوافی پائیں۔
        </p>
        <div className="mt-2 flex justify-center">
          <Music2 className="w-5 h-5 text-[color:var(--emerald-glow)]" />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <UrduSearchInput
          value={query}
          onChange={setQuery}
          placeholder="مثلاً: دل، نام، چاند، rain، love…"
          className="w-full pl-9 pr-36 py-3 rounded-xl bg-[color:var(--secondary)]/40 border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--emerald-glow)] transition"
          toggleOffset="right-28"
          onSubmit={() => search()}
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[color:var(--cream)] text-[color:var(--background)] text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span className="urdu-mini text-sm" dir="rtl">قافیہ</span>
        </button>
      </form>

      {!result && !busy && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="urdu-mini text-sm text-muted-foreground self-center mr-1" dir="rtl">آزمائیں:</span>
          {QUICK.map((s) => (
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
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="urdu-mini" dir="rtl">قوافی تلاش ہو رہے ہیں…</span>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {result.base && (
                <div className="rounded-2xl p-5 bg-[color:var(--emerald-deep)]/30 border border-[color:var(--emerald-glow)]/30">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--emerald-glow)] mb-1">
                    {result.input ?? query} · base
                  </p>
                  <p className="urdu text-3xl text-[color:var(--cream)]" dir="rtl">{result.base}</p>
                  {result.baseRoman && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{result.baseRoman}</p>
                  )}
                </div>
              )}

              {result.rhymes && result.rhymes.length > 0 && (
                <div>
                  <p className="urdu-mini text-xs text-muted-foreground mb-2" dir="rtl">
                    ہم آواز · {result.rhymes.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.rhymes.map((r, i) => {
                      const open = openIdx === i;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.025 }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setOpenIdx(open ? null : i)}
                          className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                            open
                              ? "bg-[color:var(--cream)] text-[color:var(--background)] border-[color:var(--cream)]"
                              : "bg-[color:var(--secondary)]/40 border-[color:var(--border)] hover:border-[color:var(--emerald-glow)]/60"
                          }`}
                        >
                          <span className="urdu text-xl" dir="rtl">{r.urdu}</span>
                          <span className="text-[10px] opacity-70 uppercase tracking-wider">{r.roman}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {openIdx !== null && result.rhymes?.[openIdx] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-xl p-3 bg-[color:var(--secondary)]/40 border border-[color:var(--emerald-glow)]/30 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="urdu text-2xl text-[color:var(--cream)]" dir="rtl">
                              {result.rhymes[openIdx].urdu}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              <span className="opacity-80">{result.rhymes[openIdx].roman}</span>
                              <span className="opacity-60"> · {result.rhymes[openIdx].meaning}</span>
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => copy(result.rhymes![openIdx].urdu)}
                              className="p-2 rounded-lg bg-[color:var(--background)]/40 hover:bg-[color:var(--background)]/60"
                              aria-label="Copy"
                            >
                              {copied === result.rhymes[openIdx].urdu ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setOpenIdx(null)}
                              className="p-2 rounded-lg bg-[color:var(--background)]/40 hover:bg-[color:var(--background)]/60"
                              aria-label="Close"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {result.couplet?.urdu && (
                <div className="rounded-2xl p-4 bg-[color:var(--secondary)]/30 border border-[color:var(--border)]">
                  <p className="urdu-mini text-xs text-muted-foreground mb-2" dir="rtl">نمونہ شعر</p>
                  <p className="urdu text-lg text-[color:var(--cream)] whitespace-pre-line text-right leading-loose" dir="rtl">
                    {result.couplet.urdu}
                  </p>
                  {result.couplet.english && (
                    <p className="text-[11px] text-muted-foreground italic mt-2">{result.couplet.english}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
