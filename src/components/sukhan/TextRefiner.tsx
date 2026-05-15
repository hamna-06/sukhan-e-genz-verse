import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Wand2, Download, Share2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { loadRefinements, refineText } from "@/lib/refine";
import { toast } from "sonner";
import { useUrduPhonetic, UrduToggleButton, UrduActivePill } from "./UrduPhonetic";

export function TextRefiner() {
  const [input, setInput] = useState(
    "Aaj meri khushi ka koi hisaab nahi, dil mein pyar aur aankhon mein khwab hain.",
  );
  const [refined, setRefined] = useState("");
  const [mode, setMode] = useState<"dict" | "ai">("ai");
  const [dict, setDict] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const urdu = useUrduPhonetic();

  useEffect(() => {
    loadRefinements().then(setDict).catch(() => {});
  }, []);

  const handleRefine = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setRefined("");
    try {
      if (mode === "dict") {
        await new Promise((r) => setTimeout(r, 250));
        setRefined(refineText(input, dict));
      } else {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: input }),
        });
        const data = (await res.json()) as { translation?: string; error?: string };
        if (!res.ok || !data.translation) {
          throw new Error(data.error || "Translation failed");
        }
        setRefined(data.translation);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not refine");
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = url;
    a.download = "sukhan-card.png";
    a.click();
  };

  const share = () => {
    const text = refined || input;
    const url = `https://wa.me/?text=${encodeURIComponent(text + "\n\n— via Sukhan-e-Z")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bento p-6 md:p-8 relative grain overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="urdu-mini text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]" dir="rtl">باب اول</p>
          <h2 className="nastaliq text-2xl md:text-3xl mt-1" dir="rtl">تحریرِ جمال</h2>
          <p className="urdu-tight text-sm text-muted-foreground mt-1" dir="rtl">
            کوئی بھی تحریر، خالص اردو کے دلکش انداز میں۔
          </p>
        </div>
        <Wand2 className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      {/* Mode toggle */}
      <div className="inline-flex p-1 mb-3 rounded-xl bg-[color:var(--input)] text-xs">
        <button
          onClick={() => setMode("ai")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            mode === "ai"
              ? "bg-[color:var(--cream)] text-[color:var(--background)]"
              : "text-muted-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> <span className="urdu-mini text-sm" dir="rtl">اے آئی ترجمہ</span>
        </button>
        <button
          onClick={() => setMode("dict")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            mode === "dict"
              ? "bg-[color:var(--cream)] text-[color:var(--background)]"
              : "text-muted-foreground"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" /> <span className="urdu-mini text-sm" dir="rtl">لفظ سنواریں</span>
        </button>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(urdu.transform(e.target.value))}
          rows={3}
          dir={urdu.inputDir}
          style={urdu.inputStyle}
          className="w-full bg-[color:var(--input)] rounded-xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] resize-none"
          placeholder="کچھ بھی لکھیے — رومن اردو، انگلش یا مخلوط…"
        />
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <UrduActivePill active={urdu.urduMode} />
          <UrduToggleButton active={urdu.urduMode} onToggle={() => urdu.setUrduMode(!urdu.urduMode)} />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleRefine}
          disabled={busy || !input.trim()}
          className="px-4 py-2 rounded-xl bg-[color:var(--cream)] text-[color:var(--background)] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "ai" ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          <span className="urdu-mini text-base" dir="rtl">{mode === "ai" ? "خالص اردو میں ترجمہ کریں" : "خالص انداز میں سنواریں"}</span>
        </button>
      </div>

      <AnimatePresence>
        {(refined || busy) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Before / After preview */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-[color:var(--input)]/60 border border-[color:var(--border)]">
                <p className="urdu-mini text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2" dir="rtl">پہلے</p>
                <p className="text-sm leading-relaxed">{input}</p>
              </div>
              <div className="rounded-xl p-4 bg-[color:var(--emerald-deep)]/30 border border-[color:var(--emerald-glow)]/30 relative">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:flex w-6 h-6 rounded-full bg-[color:var(--cream)] text-[color:var(--background)] items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <p className="urdu-mini text-xs uppercase tracking-[0.25em] text-[color:var(--emerald-glow)] mb-2" dir="rtl">بعد · خالص اردو</p>
                {busy ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> <span className="urdu-mini" dir="rtl">ترجمہ ہو رہا ہے…</span>
                  </div>
                ) : (
                  <p className="urdu text-xl md:text-2xl leading-loose text-right" dir="rtl">
                    {refined}
                  </p>
                )}
              </div>
            </div>

            {refined && !busy && (
              <>
                <div ref={cardRef} className="bento-cream p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-3 right-4 nastaliq text-xs opacity-70" dir="rtl">سخنِ ز</div>
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                    style={{ background: "var(--emerald-deep)", opacity: 0.1 }}
                  />
                  <p
                    className="urdu text-2xl md:text-3xl text-center leading-loose"
                    dir="rtl"
                  >
                    {refined}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="h-px w-12 bg-current opacity-30" />
                  </div>
                  <p className="urdu-mini text-center text-sm mt-3 opacity-70" dir="rtl">خالص اردو</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={download}
                    className="px-4 py-2 rounded-xl bg-[color:var(--secondary)] text-sm flex items-center gap-2 hover:bg-[color:var(--emerald-deep)] transition"
                  >
                    <Download className="w-4 h-4" /> <span className="urdu-mini" dir="rtl">محفوظ کریں</span>
                  </button>
                  <button
                    onClick={share}
                    className="px-4 py-2 rounded-xl bg-[color:var(--secondary)] text-sm flex items-center gap-2 hover:bg-[color:var(--emerald-deep)] transition"
                  >
                    <Share2 className="w-4 h-4" /> <span className="urdu-mini" dir="rtl">شیئر کریں</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
