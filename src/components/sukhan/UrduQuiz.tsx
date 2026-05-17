import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCw, Check, X, Sparkles } from "lucide-react";

type Q = { q: string; options: string[]; answer: number; hint?: string };

// Comprehensive question bank — Urdu literature, poetry, vocabulary
const BANK: Q[] = [
  { q: "“دیوانِ غالب” کس زبان میں ہے؟", options: ["اردو", "فارسی", "عربی", "ترکی"], answer: 0 },
  { q: "اقبال کا مشہور فلسفہ کیا کہلاتا ہے؟", options: ["خودی", "وحدت", "فنا", "سکوت"], answer: 0 },
  { q: "“شکوہ” اور “جوابِ شکوہ” کس کی نظمیں ہیں؟", options: ["میر", "غالب", "اقبال", "فیض"], answer: 2 },
  { q: "“ہم دیکھیں گے” کس شاعر کی نظم ہے؟", options: ["فیض احمد فیض", "احمد فراز", "پروین شاکر", "ناصر کاظمی"], answer: 0 },
  { q: "میر تقی میر کو کیا کہا جاتا ہے؟", options: ["خدائے سخن", "شہنشاہِ غزل", "بابائے اردو", "ملک الشعرا"], answer: 0 },
  { q: "“بانگِ درا” کس کی تصنیف ہے؟", options: ["اقبال", "غالب", "فیض", "جوش"], answer: 0 },
  { q: "“قوافی” کا مطلب کیا ہے؟", options: ["ہم آواز الفاظ", "وزن", "ردیف", "بحر"], answer: 0 },
  { q: "“مطلع” غزل میں کسے کہتے ہیں؟", options: ["پہلا شعر", "آخری شعر", "درمیانی شعر", "تخلص والا شعر"], answer: 0 },
  { q: "“مقطع” میں عام طور پر کیا آتا ہے؟", options: ["تخلص", "ردیف", "قافیہ", "بحر"], answer: 0 },
  { q: "“ردیف” کیا ہوتی ہے؟", options: ["شعر میں دہرایا جانے والا لفظ", "وزن کا نام", "بحر کا حصہ", "شاعر کا نام"], answer: 0 },
  { q: "“چراغِ راہ” کس کا ناول/افسانہ ہے؟", options: ["قرۃ العین حیدر", "بانو قدسیہ", "اشفاق احمد", "ممتاز مفتی"], answer: 1 },
  { q: "“راجہ گدھ” کس کا ناول ہے؟", options: ["بانو قدسیہ", "عصمت چغتائی", "قرۃ العین", "خدیجہ مستور"], answer: 0 },
  { q: "“آگ کا دریا” کس نے لکھا؟", options: ["قرۃ العین حیدر", "بانو قدسیہ", "منٹو", "انتظار حسین"], answer: 0 },
  { q: "سعادت حسن منٹو کس صنف کے لیے مشہور ہیں؟", options: ["افسانہ", "غزل", "نظم", "مرثیہ"], answer: 0 },
  { q: "“دل ہی تو ہے نہ سنگ و خشت” کس کا شعر ہے؟", options: ["غالب", "میر", "اقبال", "داغ"], answer: 0 },
  { q: "“تخلص” کس کو کہتے ہیں؟", options: ["شاعر کا قلمی نام", "شعر کا عنوان", "ردیف", "بحر"], answer: 0 },
  { q: "“مرثیہ” میں کس کا ذکر ہوتا ہے؟", options: ["شہادت/سوگ", "محبت", "بہار", "فطرت"], answer: 0 },
  { q: "“نظم” اور “غزل” میں بنیادی فرق کیا ہے؟", options: ["موضوع کی وحدت", "وزن", "زبان", "شاعر"], answer: 0 },
  { q: "“دیوان” کسے کہتے ہیں؟", options: ["شاعر کا مجموعہ کلام", "نثری کتاب", "تنقیدی مضمون", "ڈکشنری"], answer: 0 },
  { q: "“اردو” لفظ اصل میں کس زبان کا ہے؟", options: ["ترکی", "فارسی", "عربی", "ہندی"], answer: 0 },
  { q: "“بابائے اردو” کا خطاب کس کو ملا؟", options: ["مولوی عبدالحق", "سرسید", "حالی", "آزاد"], answer: 0 },
  { q: "سرسید احمد خان نے کون سا رسالہ نکالا؟", options: ["تہذیب الاخلاق", "نقوش", "فنون", "ادبِ لطیف"], answer: 0 },
  { q: "“پیامِ مشرق” کس زبان میں ہے؟", options: ["فارسی", "اردو", "عربی", "انگریزی"], answer: 0 },
  { q: "“لب آزاد ہیں تیرے” کس کا مصرع ہے؟", options: ["فیض", "فراز", "اقبال", "غالب"], answer: 0 },
  { q: "احمد فراز کی مشہور غزل کا مطلع “رنجش ہی سہی” کس نے گایا؟", options: ["مہدی حسن", "نصرت فتح علی", "غلام علی", "نور جہاں"], answer: 0 },
  { q: "“خوشبو” شعری مجموعہ کس کا ہے؟", options: ["پروین شاکر", "کشور ناہید", "فہمیدہ ریاض", "ادا جعفری"], answer: 0 },
  { q: "“حرف” کا کیا مطلب ہے؟", options: ["لفظ/آواز", "وزن", "بحر", "قافیہ"], answer: 0 },
  { q: "“مترادف” الفاظ کیا ہوتے ہیں؟", options: ["ہم معنی", "مخالف", "ہم آواز", "ہم وزن"], answer: 0 },
  { q: "“متضاد” الفاظ کیا ہوتے ہیں؟", options: ["مخالف معنی", "ہم معنی", "ہم وزن", "ہم آواز"], answer: 0 },
  { q: "“سخن” کا مطلب کیا ہے؟", options: ["کلام/بات", "خاموشی", "خواب", "راز"], answer: 0 },
  { q: "“شب” کا مطلب کیا ہے؟", options: ["رات", "دن", "صبح", "شام"], answer: 0 },
  { q: "“سحر” کا مطلب کیا ہے؟", options: ["صبح", "رات", "شام", "دوپہر"], answer: 0 },
  { q: "“دل” کے لیے فارسی/اردو میں متبادل کون سا ہے؟", options: ["قلب", "روح", "جاں", "نظر"], answer: 0 },
  { q: "“چاند” کا اردو متبادل کیا ہے؟", options: ["ماہ", "آفتاب", "نجم", "ابر"], answer: 0 },
  { q: "“خواب” کا مطلب کیا ہے؟", options: ["سپنا", "نیند", "جاگنا", "تھکن"], answer: 0 },
  { q: "“بحر” شاعری میں کیا ہوتی ہے؟", options: ["وزن کا پیمانہ", "قافیہ", "ردیف", "تخلص"], answer: 0 },
  { q: "“قصیدہ” کا مقصد عام طور پر کیا ہوتا ہے؟", options: ["تعریف/مدح", "غم", "محبت", "ہجو"], answer: 0 },
  { q: "“رباعی” کے کتنے مصرعے ہوتے ہیں؟", options: ["چار", "دو", "چھ", "آٹھ"], answer: 0 },
  { q: "“مثنوی” کی خصوصیت کیا ہے؟", options: ["ہر شعر کا الگ قافیہ", "ایک ہی قافیہ", "بے قافیہ", "صرف ردیف"], answer: 0 },
  { q: "“زلفِ گرہ گیر” میں “گرہ گیر” کا مطلب؟", options: ["پیچ دار", "سیدھی", "چھوٹی", "لمبی"], answer: 0 },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickTen(): Q[] {
  return shuffle(BANK).slice(0, 10);
}

function badgeFor(score: number) {
  if (score >= 9) return { label: "اُستادِ سخن", emoji: "👑", tone: "var(--emerald-glow)" };
  if (score >= 7) return { label: "سخن وَر", emoji: "🪶", tone: "var(--emerald-glow)" };
  if (score >= 5) return { label: "تخلیق کار", emoji: "✨", tone: "var(--cream)" };
  return { label: "نو آموز", emoji: "🌱", tone: "var(--cream)" };
}

export function UrduQuiz() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => pickTen(), [seed]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[idx];
  const isLast = idx === questions.length - 1;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === current.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (isLast) setDone(true);
      else { setIdx((n) => n + 1); setPicked(null); }
    }, 1100);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  };

  return (
    <div className="bento p-6 md:p-8 mt-5">
      <div className="flex items-center justify-between mb-3" dir="rtl">
        <div>
          <p className="urdu-mini text-xs uppercase tracking-[0.2em] text-[color:var(--emerald-glow)]">باب ششم</p>
          <h2 className="nastaliq text-2xl mt-1">آزمائشِ سخن</h2>
        </div>
        {!done && (
          <div className="text-right">
            <p className="urdu-mini text-[10px] text-muted-foreground">سوال</p>
            <p className="display text-xl">{idx + 1}<span className="text-muted-foreground text-sm">/{questions.length}</span></p>
          </div>
        )}
      </div>

      {!done && (
        <div className="w-full h-1 bg-[color:var(--secondary)]/40 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-[color:var(--emerald-glow)]"
            animate={{ width: `${((idx + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <p className="urdu text-xl leading-loose mb-4" dir="rtl">{current.q}</p>
            <div className="grid gap-2">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.answer;
                const isPicked = picked === i;
                const revealed = picked !== null;
                let cls = "bg-[color:var(--secondary)]/40 border-[color:var(--border)] hover:border-[color:var(--emerald-glow)]/40";
                if (revealed && isCorrect) cls = "bg-emerald-500/20 border-emerald-400 text-emerald-100";
                else if (revealed && isPicked && !isCorrect) cls = "bg-red-500/20 border-red-400 text-red-100";
                else if (revealed) cls = "bg-[color:var(--secondary)]/30 border-[color:var(--border)] opacity-60";
                return (
                  <motion.button
                    key={i}
                    whileHover={picked === null ? { scale: 1.01 } : {}}
                    whileTap={picked === null ? { scale: 0.99 } : {}}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className={`w-full text-right rounded-xl p-3 border transition flex items-center justify-between gap-3 ${cls}`}
                    dir="rtl"
                  >
                    <span className="urdu-tight text-base">{opt}</span>
                    {revealed && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                    {revealed && isPicked && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ background: "var(--gradient-cream)", boxShadow: "var(--shadow-glow)" }}
            >
              <Trophy className="w-9 h-9 text-[color:var(--background)]" />
            </motion.div>
            <p className="urdu-mini text-xs uppercase tracking-[0.3em] text-[color:var(--emerald-glow)]" dir="rtl">آزمائش مکمل</p>
            <p className="display text-5xl mt-2">{score}<span className="text-muted-foreground text-2xl">/{questions.length}</span></p>
            {(() => {
              const b = badgeFor(score);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{ borderColor: b.tone as string, background: "color-mix(in oklab, var(--emerald-deep) 40%, transparent)" }}
                  dir="rtl"
                >
                  <Sparkles className="w-4 h-4" style={{ color: b.tone as string }} />
                  <span className="urdu-mini text-sm">{b.emoji} {b.label} Badge</span>
                </motion.div>
              );
            })()}
            <p className="urdu-tight text-sm text-muted-foreground mt-3" dir="rtl">
              {score >= 7 ? "واہ! آپ کا ذوق قابلِ تعریف ہے۔" : score >= 5 ? "اچھی کوشش — مزید پڑھیے۔" : "کوئی بات نہیں، دوبارہ آزمائیں۔"}
            </p>
            <button
              onClick={restart}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--cream)] text-[color:var(--background)] urdu-mini text-sm font-medium"
              dir="rtl"
            >
              <RotateCw className="w-4 h-4" /> دوبارہ آزمائیں
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
