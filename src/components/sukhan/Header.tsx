import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="relative pt-10 pb-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[color:var(--cream)] flex items-center justify-center">
            <span className="urdu text-xl text-[color:var(--background)]">س</span>
          </div>
          <div>
            <h1 className="display text-xl md:text-2xl">Sukhan-e-Z</h1>
            <p className="text-xs text-muted-foreground -mt-1">Urdu, but make it Gen Z</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bento px-3 py-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[color:var(--emerald-glow)]" />
          A premium lifestyle for poetry
        </motion.div>
      </div>
    </header>
  );
}
