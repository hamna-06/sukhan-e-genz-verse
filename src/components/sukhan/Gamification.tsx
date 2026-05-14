import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Share2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BADGES = [
  { id: "aghaz", label: "آغازِ سفر", min: 0, emoji: "🌱" },
  { id: "raahi", label: "راہی", min: 50, emoji: "🚶" },
  { id: "sukhanwar", label: "سخنور", min: 200, emoji: "🪶" },
  { id: "ustad", label: "اُستاد", min: 500, emoji: "👑" },
];

export function Gamification() {
  const [points, setPoints] = useState<number>(0);
  useEffect(() => {
    const saved = Number(localStorage.getItem("sukhan_points") ?? 30);
    setPoints(saved);
  }, []);
  const [quote, setQuote] = useState<{ quote: string; poet: string } | null>(null);
  const [wow, setWow] = useState<{ word: string; meaning: string; example: string | null } | null>(null);

  useEffect(() => {
    supabase.from("daily_quotes").select("quote, poet").limit(10).then(({ data }) => {
      if (data?.length) setQuote(data[Math.floor(Math.random() * data.length)] as any);
    });
    supabase.from("word_of_week").select("word, meaning, example").order("week_start", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setWow(data as any);
    });
  }, []);

  const addPoints = (n: number) => {
    const next = points + n;
    setPoints(next);
    localStorage.setItem("sukhan_points", String(next));
  };

  const shareQuote = () => {
    if (!quote) return;
    const url = `https://wa.me/?text=${encodeURIComponent(`${quote.quote}\n— ${quote.poet}\n\nvia Sukhan-e-Z`)}`;
    window.open(url, "_blank");
    addPoints(5);
  };

  const earned = BADGES.filter((b) => points >= b.min);
  const next = BADGES.find((b) => points < b.min);

  return (
    <div className="grid gap-5">
      {/* Profile */}
      <div className="bento p-6 md:p-8">
        <p className="urdu-mini text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]" dir="rtl">باب پنجم</p>
        <h2 className="nastaliq text-2xl md:text-3xl mt-1" dir="rtl">آپ کا سخن</h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[color:var(--secondary)]/40 p-4 border border-[color:var(--border)]">
            <div className="urdu-mini flex items-center gap-2 text-sm text-muted-foreground" dir="rtl"><Trophy className="w-3.5 h-3.5" /> سخن نمبر</div>
            <p className="display text-3xl mt-1">{points}</p>
            {next && <p className="urdu-mini text-xs text-muted-foreground mt-1" dir="rtl">{next.label} تک {next.min - points} باقی</p>}
          </div>
          <div className="rounded-2xl bg-[color:var(--secondary)]/40 p-4 border border-[color:var(--border)]">
            <div className="urdu-mini flex items-center gap-2 text-sm text-muted-foreground" dir="rtl"><Flame className="w-3.5 h-3.5" /> تسلسل</div>
            <p className="display text-3xl mt-1">3<span className="urdu-mini text-sm text-muted-foreground" dir="rtl"> دن</span></p>
          </div>
        </div>

        <div className="mt-4">
          <p className="urdu-mini text-sm text-muted-foreground mb-2 flex items-center gap-1.5" dir="rtl"><Award className="w-3.5 h-3.5" /> اعزازات</p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => {
              const got = earned.find((e) => e.id === b.id);
              return (
                <div key={b.id} className={`px-3 py-1.5 rounded-full urdu-mini text-sm flex items-center gap-1.5 border ${
                  got ? "bg-[color:var(--cream)] text-[color:var(--background)] border-transparent" : "border-[color:var(--border)] opacity-50"
                }`} dir="rtl">
                  <span>{b.emoji}</span> {b.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Word of week */}
      {wow && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-cream p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full" style={{ background: "var(--emerald-deep)", opacity: 0.1 }} />
          <p className="urdu-mini text-xs uppercase tracking-[0.3em] opacity-60" dir="rtl">ہفتے کا لفظ</p>
          <p className="urdu text-5xl mt-3">{wow.word}</p>
          <p className="urdu-tight text-base mt-3 opacity-80" dir="rtl">{wow.meaning}</p>
          {wow.example && <p className="urdu text-lg mt-2 opacity-90">"{wow.example}"</p>}
          <button onClick={() => addPoints(10)} className="mt-4 px-4 py-2 rounded-xl bg-[color:var(--emerald-deep)] text-[color:var(--cream)] urdu-mini text-sm font-medium" dir="rtl">
            +۱۰ سخن • سیکھ لیا
          </button>
        </motion.div>
      )}

      {/* Daily quote */}
      {quote && (
        <div className="bento p-6 md:p-8">
          <p className="urdu-mini text-xs uppercase tracking-[0.3em] text-[color:var(--emerald-glow)]" dir="rtl">قولِ روز</p>
          <p className="urdu text-2xl mt-3 leading-loose">{quote.quote}</p>
          <div className="flex items-center justify-between mt-4">
            <p className="urdu-mini text-sm text-muted-foreground" dir="rtl">— {quote.poet}</p>
            <button onClick={shareQuote} className="px-4 py-2 rounded-xl bg-[color:var(--cream)] text-[color:var(--background)] urdu-mini text-sm font-medium flex items-center gap-2" dir="rtl">
              <Share2 className="w-3.5 h-3.5" /> واٹس ایپ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
