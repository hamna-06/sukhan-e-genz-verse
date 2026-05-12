
-- Poetry table
CREATE TABLE public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  poet TEXT NOT NULL,
  content TEXT NOT NULL,
  vibe TEXT NOT NULL,
  difficult_words JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_two_liner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read poems" ON public.poems FOR SELECT USING (true);

-- Difficult words dictionary (lookup)
CREATE TABLE public.urdu_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  meaning TEXT NOT NULL,
  etymology TEXT,
  pronunciation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.urdu_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read words" ON public.urdu_words FOR SELECT USING (true);

-- Refinement dictionary: common -> khalis
CREATE TABLE public.refinements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_word TEXT NOT NULL UNIQUE,
  khalis_word TEXT NOT NULL,
  meaning TEXT
);
ALTER TABLE public.refinements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read refinements" ON public.refinements FOR SELECT USING (true);

-- Daily quotes & word of the week
CREATE TABLE public.daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  poet TEXT NOT NULL,
  active_date DATE
);
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quotes" ON public.daily_quotes FOR SELECT USING (true);

CREATE TABLE public.word_of_week (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  week_start DATE
);
ALTER TABLE public.word_of_week ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read word of the week" ON public.word_of_week FOR SELECT USING (true);
