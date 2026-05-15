import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smartphone, Sparkles, Loader2, Wand2 } from "lucide-react";
import { loadRefinements, suggestWord } from "@/lib/refine";
import { toast } from "sonner";
import { useUrduPhonetic, UrduToggleButton, UrduActivePill } from "./UrduPhonetic";

type Msg = { from: "me" | "them"; text: string; original?: string };

export function SmartKeyboard() {
  const [dict, setDict] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [aiMode, setAiMode] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [busy, setBusy] = useState(false);
  const debounce = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urdu = useUrduPhonetic();

  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "them", text: "آج کیا پلان ہے؟" },
  ]);

  useEffect(() => {
    loadRefinements().then(setDict);
  }, []);

  // Real-time AI suggestion as user types
  useEffect(() => {
    if (!aiMode) {
      setAiSuggestion("");
      return;
    }
    if (!text.trim()) {
      setAiSuggestion("");
      return;
    }
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBusy(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text }),
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { translation?: string };
        if (data.translation) setAiSuggestion(data.translation);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          // silent
        }
      } finally {
        setBusy(false);
      }
    }, 550);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [text, aiMode]);

  const lastWord = text.split(/\s+/).pop() ?? "";
  const dictSuggestion = !aiMode ? suggestWord(lastWord, dict) : null;

  const applyDict = () => {
    if (!dictSuggestion) return;
    const parts = text.split(/\s+/);
    parts[parts.length - 1] = dictSuggestion;
    setText(parts.join(" ") + " ");
  };

  const sendKhalis = (override?: string) => {
    const original = text;
    const out = override ?? aiSuggestion ?? text;
    if (!out.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: out, original }]);
    setText("");
    setAiSuggestion("");

    setTimeout(async () => {
      // AI partner replies in Khalis Urdu
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: `Conversational reply in elegant Khalis Urdu (Nastaliq, 1 short natural sentence, warm tone, no English) to this message: "${out}"`,
          }),
        });
        const data = (await res.json()) as { translation?: string };
        setMsgs((m) => [
          ...m,
          {
            from: "them",
            text: data.translation || "واہ! خالص اردو میں بات ہو رہی ہے 🌿",
          },
        ]);
      } catch {
        setMsgs((m) => [
          ...m,
          { from: "them", text: "واہ! خالص اردو میں بات ہو رہی ہے 🌿" },
        ]);
      }
    }, 500);
  };

  const handleSend = () => {
    if (aiMode && aiSuggestion) sendKhalis();
    else if (text.trim()) sendKhalis(text);
    else toast.error("Type something first");
  };

  return (
    <div className="bento p-6 md:p-8">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="urdu-mini text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]" dir="rtl">باب چہارم</p>
          <h2 className="nastaliq text-2xl md:text-3xl mt-1" dir="rtl">دیوانِ ڈیجیٹل</h2>
          <p className="urdu-tight text-sm text-muted-foreground mt-1" dir="rtl">
            اے آئی آپ کی ہر سطر فوراً خالص اردو میں ڈھال دیتا ہے۔
          </p>
        </div>
        <Smartphone className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      {/* Mode toggle */}
      <div className="inline-flex p-1 mb-4 rounded-xl bg-[color:var(--input)] text-xs">
        <button
          onClick={() => setAiMode(true)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            aiMode
              ? "bg-[color:var(--cream)] text-[color:var(--background)]"
              : "text-muted-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> <span className="urdu-mini text-sm" dir="rtl">اے آئی فوری</span>
        </button>
        <button
          onClick={() => setAiMode(false)}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            !aiMode
              ? "bg-[color:var(--cream)] text-[color:var(--background)]"
              : "text-muted-foreground"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" /> <span className="urdu-mini text-sm" dir="rtl">لفظ</span>
        </button>
      </div>

      <div className="rounded-3xl bg-[#0b141a] p-3 max-w-sm mx-auto border border-[color:var(--border)] shadow-2xl">
        <div className="rounded-2xl bg-[#0b141a] h-72 overflow-y-auto p-3 space-y-2 flex flex-col">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                  m.from === "me"
                    ? "bg-[#005c4b] text-white rounded-br-sm"
                    : "bg-[#202c33] text-white rounded-bl-sm"
                }`}
              >
                <span className="urdu text-base block text-right" dir="rtl">
                  {m.text}
                </span>
                {m.original && (
                  <span className="urdu-mini block text-[11px] opacity-50 mt-1" dir="rtl">
                    آپ نے لکھا: {m.original}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI live preview bar */}
        <AnimatePresence>
          {aiMode && (aiSuggestion || busy) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 px-3 py-2 rounded-xl bg-[color:var(--emerald-deep)]/40 border border-[color:var(--emerald-glow)]/30"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="urdu-mini text-xs text-[color:var(--emerald-glow)] flex items-center gap-1" dir="rtl">
                  {busy ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  اے آئی · خالص جھلک
                </p>
                {aiSuggestion && !busy && (
                  <button
                    onClick={() => sendKhalis()}
                    className="urdu-mini text-xs px-2 py-0.5 rounded-full bg-[color:var(--cream)] text-[color:var(--background)] font-medium"
                    dir="rtl"
                  >
                    بھیجیں ↑
                  </button>
                )}
              </div>
              {aiSuggestion && (
                <p
                  className="urdu text-base mt-1 text-right text-white"
                  dir="rtl"
                >
                  {aiSuggestion}
                </p>
              )}
            </motion.div>
          )}
          {!aiMode && dictSuggestion && (
            <motion.button
              onClick={applyDict}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 mx-auto block px-4 py-1.5 rounded-full bg-[color:var(--cream)] text-[color:var(--background)] urdu-mini text-sm font-medium"
              dir="rtl"
            >
              آزمائیں: <span className="urdu text-base">{dictSuggestion}</span> ↑
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-2 bg-[#202c33] rounded-full p-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              aiMode ? "کسی بھی زبان میں لکھیں…" : "رومن اردو میں لکھیں…"
            }
            className="flex-1 bg-transparent outline-none text-white text-sm px-3 urdu-mini"
            dir="rtl"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center"
            aria-label="Send"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <p className="urdu-mini text-sm text-muted-foreground text-center mt-4" dir="rtl">
        ہر جگہ یہی سہولت چاہیں؟ تیرتا ہوا ✒︎ بٹن دبائیں — لکھیں، نقل کریں، اور واٹس ایپ یا انسٹاگرام میں چسپاں کریں۔
      </p>
    </div>
  );
}
