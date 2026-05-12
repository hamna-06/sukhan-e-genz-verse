import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Wand2, Download, Share2, Loader2 } from "lucide-react";
import { loadRefinements, refineText } from "@/lib/refine";

export function TextRefiner() {
  const [input, setInput] = useState("Aaj meri khushi ka koi hisaab nahi, dil mein pyar aur aankhon mein khwab hain.");
  const [refined, setRefined] = useState("");
  const [dict, setDict] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadRefinements().then(setDict); }, []);

  const handleRefine = () => {
    setBusy(true);
    setTimeout(() => {
      setRefined(refineText(input, dict));
      setBusy(false);
    }, 300);
  };

  const download = async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = url; a.download = "sukhan-card.png"; a.click();
  };

  const share = async () => {
    const text = refined || input;
    const url = `https://wa.me/?text=${encodeURIComponent(text + "\n\n— via Sukhan-e-Z")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bento p-6 md:p-8 relative grain overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">Module 01</p>
          <h2 className="display text-2xl md:text-3xl mt-1">Text-to-Nisab</h2>
          <p className="text-sm text-muted-foreground mt-1">Refine your everyday Urdu into Khalis Urdu.</p>
        </div>
        <Wand2 className="w-5 h-5 text-[color:var(--emerald-glow)]" />
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        className="w-full bg-[color:var(--input)] rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] resize-none"
        placeholder="Type your message in Roman Urdu or English…"
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleRefine}
          className="px-4 py-2 rounded-xl bg-[color:var(--cream)] text-[color:var(--background)] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Refine to Khalis
        </button>
      </div>

      {refined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div ref={cardRef} className="bento-cream p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-3 right-4 text-[10px] uppercase tracking-widest opacity-60">Sukhan-e-Z</div>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: "var(--emerald-deep)", opacity: 0.1 }} />
            <p className="urdu text-2xl md:text-3xl text-center leading-loose">{refined}</p>
            <div className="mt-6 flex justify-center">
              <div className="h-px w-12 bg-current opacity-30" />
            </div>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] mt-3 opacity-50">Khalis Urdu</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={download} className="px-4 py-2 rounded-xl bg-[color:var(--secondary)] text-sm flex items-center gap-2 hover:bg-[color:var(--emerald-deep)] transition">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={share} className="px-4 py-2 rounded-xl bg-[color:var(--secondary)] text-sm flex items-center gap-2 hover:bg-[color:var(--emerald-deep)] transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
