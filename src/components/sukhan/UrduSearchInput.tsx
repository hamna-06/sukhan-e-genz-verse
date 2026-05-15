import { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Keyboard, PenTool } from "lucide-react";
import { toUrduPhonetic } from "@/lib/urdu-phonetic";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** extra padding right for any submit button overlay */
  toggleOffset?: string; // tailwind right-* class for toggle button position
  onSubmit?: () => void;
};

export const UrduSearchInput = forwardRef<HTMLInputElement, Props>(function UrduSearchInput(
  { value, onChange, placeholder, className = "", toggleOffset = "right-3", onSubmit },
  ref,
) {
  const [urduMode, setUrduMode] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const handleChange = (raw: string) => {
    if (!urduMode) return onChange(raw);
    // If string already contains urdu, leave it; otherwise transliterate latin portion.
    // We re-transliterate the entire input — simpler & predictable.
    onChange(toUrduPhonetic(raw));
  };

  return (
    <>
      <input
        ref={innerRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        dir="rtl"
        style={
          urduMode
            ? { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2, textAlign: "right" }
            : { textAlign: "right" }
        }
        className={className}
      />

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          setUrduMode((v) => !v);
          setTimeout(() => innerRef.current?.focus(), 0);
        }}
        title={urduMode ? "Urdu Mode (On)" : "Enable Urdu Phonetic Typing"}
        className={`absolute ${toggleOffset} top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition ${
          urduMode
            ? "bg-[color:var(--emerald-glow)] text-[color:var(--background)]"
            : "text-muted-foreground hover:text-[color:var(--cream)]"
        }`}
        aria-label="Toggle Urdu phonetic typing"
      >
        {urduMode ? <PenTool className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
      </button>

      {/* Floating active label */}
      <AnimatePresence>
        {urduMode && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[color:var(--emerald-glow)] text-[color:var(--background)] shadow-md pointer-events-none"
          >
            اردو فعال · Urdu Active
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
});
