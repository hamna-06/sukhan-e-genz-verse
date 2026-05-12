import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smartphone } from "lucide-react";
import { loadRefinements, suggestWord } from "@/lib/refine";

type Msg = { from: "me" | "them"; text: string };

export function SmartKeyboard() {
  const [dict, setDict] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "them", text: "Aaj kya plan hai?" },
  ]);

  useEffect(() => { loadRefinements().then(setDict); }, []);

  const lastWord = text.split(/\s+/).pop() ?? "";
  const suggestion = suggestWord(lastWord, dict);

  const apply = () => {
    if (!suggestion) return;
    const parts = text.split(/\s+/);
    parts[parts.length - 1] = suggestion;
    setText(parts.join(" ") + " ");
  };

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "them", text: "Wah! Khalis Urdu mein baat ho rahi hai 🌿" }]);
    }, 600);
  };

  return (
    <div className="bento p-6 md:p-8">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 04</p>
          <h2 className="display text-2xl md:text-3xl mt-1">Smart Keyboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Khalis suggestions, live.</p>
        </div>
        <Smartphone className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      <div className="rounded-3xl bg-[#0b141a] p-3 max-w-sm mx-auto border border-[color:var(--border)] shadow-2xl">
        <div className="rounded-2xl bg-[#0b141a] h-72 overflow-y-auto p-3 space-y-2 flex flex-col">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.from === "me" ? "bg-[#005c4b] text-white rounded-br-sm" : "bg-[#202c33] text-white rounded-bl-sm"
              }`}>
                <span className="urdu text-base">{m.text}</span>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {suggestion && (
            <motion.button
              onClick={apply}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2 mx-auto block px-4 py-1.5 rounded-full bg-[color:var(--cream)] text-[color:var(--background)] text-xs font-medium"
            >
              Try: <span className="urdu text-sm">{suggestion}</span> ↑
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-2 bg-[#202c33] rounded-full p-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type message…"
            className="flex-1 bg-transparent outline-none text-white text-sm px-3"
          />
          <button onClick={send} className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
