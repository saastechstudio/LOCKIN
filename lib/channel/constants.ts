/** Réactions proposées : peu nombreuses, lisibles d'un coup d'œil. */
export const REACTIONS = ["👍", "🔥", "💪", "👏", "❤️", "😂"] as const;

/** Sélecteur d'emojis du composeur, rangé par usage. */
export const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Élan", emojis: ["🔥", "💪", "🚀", "🎯", "✅", "⚡", "🏆", "📈", "🧠", "✨"] },
  { label: "Humeur", emojis: ["😀", "😂", "😎", "🙌", "🙏", "😅", "🤔", "😴", "🥳", "😤"] },
  { label: "Vie", emojis: ["🏃", "🏋️", "🥗", "😴", "📚", "💰", "🧘", "🌅", "☕", "❤️"] },
];

/** Thèmes de salons. */
export const ROOM_TOPICS = [
  "Business",
  "Fitness",
  "Finance",
  "Développement personnel",
  "Études",
  "Création de contenu",
] as const;

export const MAX_BODY = 4000;
export const PAGE_SIZE = 60;
