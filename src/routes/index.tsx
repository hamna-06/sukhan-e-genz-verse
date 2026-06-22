import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/sukhan/Header";
import { TextRefiner } from "@/components/sukhan/TextRefiner";
import { PoetryLibrary } from "@/components/sukhan/PoetryLibrary";
import { MoodGrid } from "@/components/sukhan/MoodGrid";
import { SmartKeyboard } from "@/components/sukhan/SmartKeyboard";
import { KafiyaFinder } from "@/components/sukhan/KafiyaFinder";
import { Gamification } from "@/components/sukhan/Gamification";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sukhan-e-Z — Urdu, but make it Gen Z" },
      { name: "description", content: "An aesthetic Urdu literature companion: refine your text, decode poetry, find verses by mood, and earn Sukhan points." },
      { property: "og:title", content: "Sukhan-e-Z" },
      { property: "og:description", content: "Premium Urdu lifestyle app for Gen Z." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      <section className="px-6 md:px-12 pt-6 pb-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bento p-8 md:p-14 relative overflow-hidden grain text-right"
            dir="rtl"
          >
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full" style={{ background: "var(--emerald-glow)", opacity: 0.18, filter: "blur(60px)" }} />
            <p className="urdu-mini text-xs uppercase tracking-[0.3em] text-[color:var(--emerald-glow)]" dir="rtl">سخنِ ز · سنہ ۲۰۲۶</p>
            <h1 className="nastaliq text-5xl md:text-7xl mt-4 leading-[1.4] whitespace-nowrap" dir="rtl">
              پرانی تہذیب، نیا رنگ
            </h1>
            <p className="urdu text-2xl md:text-3xl mt-6 max-w-2xl text-[color:var(--cream)]/90 ml-auto" dir="rtl">
              زبانِ شیریں کا ایک نیا انداز
            </p>
            <p className="urdu-tight text-base md:text-lg text-muted-foreground mt-4 max-w-xl ml-auto" dir="rtl">
              اپنی تحریر سنواریں، کلاسیک کو سمجھیں، اپنے موڈ کے مطابق اشعار پائیں، اور شاعری کو روزمرہ کا معمول بنائیں۔
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 grid gap-5">
            <TextRefiner />
            <div className="grid md:grid-cols-2 gap-5">
              <PoetryLibrary />
              <KafiyaFinder />
            </div>
            <MoodGrid />
            <SmartKeyboard />
          </div>
          <aside>
            <Gamification />
          </aside>
        </div>
      </section>

      <footer className="text-center mt-16 px-6">
        <span className="urdu-mini text-sm text-muted-foreground" dir="rtl">محبت سے بنایا گیا · سخنِ ز</span>
      </footer>
    </div>
  );
}
