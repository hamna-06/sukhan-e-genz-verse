import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, X, Loader2, Copy, Check, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUrduPhonetic, UrduToggleButton, UrduActivePill } from "./UrduPhonetic";

/**
 * Persistent floating "Khalis Urdu" mini-translator.
 * Sits in the corner of the app like a chat-head. Type any line in
 * Roman/English/casual Urdu — get refined Khalis Urdu instantly to
 * copy & paste into WhatsApp, Instagram, etc.
 */
export function FloatingTranslator() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounce = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urdu = useUrduPhonetic();

  // Real-time debounced translation
  useEffect(() => {
    if (!text.trim()) {
      setOut("");
      return;
    }
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => translate(text), 600);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const translate = async (input: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input }),
        signal: ctrl.signal,
      });
      const data = (await res.json()) as { translation?: string; error?: string };
      if (!res.ok || !data.translation) throw new Error(data.error || "Failed");
      setOut(data.translation);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Could not translate");
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    setCopied(true);
    toast.success("Copied — paste it anywhere");
    setTimeout(() => setCopied(false), 1500);
  };

  const sendWhatsApp = () => {
    if (!out) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(out)}`, "_blank");
  };

  return (
    <>
      {/* Floating chat-head button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            aria-label="Open Khalis Urdu keyboard"
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--emerald-glow), var(--emerald-deep))",
              boxShadow: "0 10px 40px -10px var(--emerald-glow)",
            }}
          >
            <Feather className="w-6 h-6 text-[color:var(--cream)]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[color:var(--cream)] border-2 border-[color:var(--background)]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mini panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="fixed bottom-5 right-5 z-50 w-[min(92vw,360px)] rounded-3xl border border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--emerald-deep)" }}>
                  <Sparkles className="w-3.5 h-3.5 text-[color:var(--emerald-glow)]" />
                </div>
                <div>
                  <p className="urdu-mini text-sm font-medium" dir="rtl">خالص کی بورڈ</p>
                  <p className="urdu-mini text-xs text-muted-foreground" dir="rtl">کہیں بھی لکھیں · گفتگو میں چسپاں کریں</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[color:var(--secondary)] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(urdu.transform(e.target.value))}
                  rows={2}
                  autoFocus
                  placeholder="لکھیں… مثلاً tum bahut yaad aate ho"
                  dir={urdu.inputDir}
                  style={urdu.inputStyle}
                  className="w-full bg-[color:var(--input)] rounded-xl p-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] resize-none"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <UrduActivePill active={urdu.urduMode} />
                  <UrduToggleButton active={urdu.urduMode} onToggle={() => urdu.setUrduMode(!urdu.urduMode)} />
                </div>
              </div>

              <div className="rounded-xl p-3 min-h-[72px] bg-[color:var(--emerald-deep)]/30 border border-[color:var(--emerald-glow)]/30 relative">
                <p className="urdu-mini text-xs text-[color:var(--emerald-glow)] mb-1.5" dir="rtl">
                  خالص اردو
                </p>
                {busy && !out && (
                  <div className="urdu-mini flex items-center gap-2 text-sm text-muted-foreground" dir="rtl">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> فوری ترجمہ ہو رہا ہے…
                  </div>
                )}
                {out && (
                  <p className="urdu text-xl leading-loose text-right" dir="rtl">
                    {out}
                  </p>
                )}
                {!busy && !out && (
                  <p className="urdu-mini text-sm text-muted-foreground" dir="rtl">
                    لکھتے ہی یہاں خالص اردو ظاہر ہو گی۔
                  </p>
                )}
                {busy && out && (
                  <Loader2 className="w-3 h-3 animate-spin absolute top-3 right-3 text-[color:var(--emerald-glow)]" />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!out}
                  onClick={copy}
                  className="flex-1 px-3 py-2 rounded-xl bg-[color:var(--cream)] text-[color:var(--background)] urdu-mini text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                  dir="rtl"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "نقل ہوگیا" : "نقل کریں"}
                </button>
                <button
                  disabled={!out}
                  onClick={sendWhatsApp}
                  className="flex-1 px-3 py-2 rounded-xl bg-[color:var(--secondary)] urdu-mini text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                  dir="rtl"
                >
                  <Send className="w-3.5 h-3.5" /> شیئر کریں
                </button>
              </div>
              <p className="urdu-mini text-xs text-muted-foreground text-center pt-1" dir="rtl">
                تجویز: گفتگو کے دوران اسے کھلا رکھیں — انسٹاگرام، واٹس ایپ، کہیں بھی نقل و چسپاں کریں۔
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
