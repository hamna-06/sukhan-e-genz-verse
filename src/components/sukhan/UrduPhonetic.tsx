import { useState, useCallback } from "react";
import { Keyboard, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toUrduPhonetic } from "@/lib/urdu-phonetic";

export function useUrduPhonetic() {
  const [urduMode, setUrduMode] = useState(false);
  const transform = useCallback(
    (raw: string) => (urduMode ? toUrduPhonetic(raw) : raw),
    [urduMode],
  );
  const inputStyle = urduMode
    ? { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2 }
    : undefined;
  const inputDir = urduMode ? "rtl" : undefined;
  return { urduMode, setUrduMode, transform, inputStyle, inputDir };
}

export function UrduToggleButton({
  active,
  onToggle,
  className = "",
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={active ? "Urdu Phonetic Mode (On)" : "Enable Urdu Phonetic Typing"}
      aria-label="Toggle Urdu phonetic typing"
      className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
        active
          ? "bg-[color:var(--emerald-glow)] text-[color:var(--background)]"
          : "text-muted-foreground hover:text-[color:var(--cream)] bg-[color:var(--secondary)]/40"
      } ${className}`}
    >
      {active ? <PenTool className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
    </button>
  );
}

export function UrduActivePill({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className={`px-2 py-0.5 text-[10px] font-medium rounded-full bg-[color:var(--emerald-glow)] text-[color:var(--background)] shadow-md pointer-events-none ${className}`}
        >
          اردو فعال · Urdu Active
        </motion.span>
      )}
    </AnimatePresence>
  );
}
