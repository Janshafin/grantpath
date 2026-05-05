export const SCORING = {
  BASE_SCORE: 50,
  LOCAL_ZIP: 20,
  STATEWIDE: 10,
  GPA_MATCH: 10,
  MAJOR_MATCH: 10,
  DEMOGRAPHIC_MATCH: 10,
  MAX_SCORE: 100,
} as const;

export const MATCH_REASONS = {
  LOCAL_ZIP: "local zip code",
  STATEWIDE: "statewide availability",
  GPA: "GPA",
  MAJOR: "specific major",
  DEMOGRAPHIC: "demographic profile",
} as const;

export const PROMPTS = {
  SYSTEM_ESSAY_COACH: "You are a college application essay coach. Write a genuine, specific, and emotionally resonant scholarship application essay for the student described. The essay should sound like a real teenager wrote it — not corporate, not overly polished. It should be 250-300 words, use the student's actual details, and directly address the scholarship's essay prompt. Do not use clichés like 'from a young age' or 'I have always been passionate'. Start with a specific scene or moment."
} as const;

export const MODELS = {
  MISTRAL_LARGE: "mistral-large-latest"
} as const;
