// Standard Urdu Phonetic keyboard mapping (CRULP-style, simplified).
// Maps Latin keys → Urdu characters. Multi-char digraphs handled in mapInput.

export const URDU_PHONETIC_MAP: Record<string, string> = {
  a: "ا", A: "آ",
  b: "ب", B: "ب",
  c: "چ", C: "ث",
  d: "د", D: "ڈ",
  e: "ع", E: "ع",
  f: "ف", F: "ف",
  g: "گ", G: "غ",
  h: "ہ", H: "ح",
  i: "ی", I: "ی",
  j: "ج", J: "ج",
  k: "ک", K: "خ",
  l: "ل", L: "ل",
  m: "م", M: "م",
  n: "ن", N: "ں",
  o: "و", O: "و",
  p: "پ", P: "پ",
  q: "ق", Q: "ق",
  r: "ر", R: "ڑ",
  s: "س", S: "ص",
  t: "ت", T: "ٹ",
  u: "ُ", U: "ئ",
  v: "و", V: "ؤ",
  w: "و", W: "و",
  x: "ش", X: "ژ",
  y: "ی", Y: "ے",
  z: "ز", Z: "ذ",
  "'": "ء",
  ",": "،",
  ";": "؛",
  "?": "؟",
};

// Digraphs replaced after mapping (typed as 2 latin chars).
const DIGRAPHS: Array<[string, string]> = [
  ["بھ", "بھ"], // placeholder
];

// Convert a full latin string to Urdu phonetic.
export function toUrduPhonetic(input: string): string {
  // First handle common digraphs in latin before per-char map
  let s = input
    .replace(/sh/g, "ش")
    .replace(/Sh/g, "ش")
    .replace(/SH/g, "ش")
    .replace(/ch/g, "چ")
    .replace(/Ch/g, "چ")
    .replace(/kh/g, "خ")
    .replace(/Kh/g, "خ")
    .replace(/gh/g, "غ")
    .replace(/Gh/g, "غ")
    .replace(/th/g, "تھ")
    .replace(/ph/g, "پھ")
    .replace(/bh/g, "بھ")
    .replace(/dh/g, "دھ")
    .replace(/jh/g, "جھ")
    .replace(/rh/g, "رھ")
    .replace(/aa/g, "آ")
    .replace(/ee/g, "ی")
    .replace(/oo/g, "و");

  let out = "";
  for (const ch of s) {
    if (URDU_PHONETIC_MAP[ch] !== undefined) out += URDU_PHONETIC_MAP[ch];
    else out += ch;
  }
  return out;
}
