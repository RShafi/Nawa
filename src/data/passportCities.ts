export const LESSON_HIBR_BONUS = 15;

export type PassportCity = {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  cost: number;
};

/** Cities that can be unlocked with Hibr in the learner passport. */
export const PASSPORT_CITIES: PassportCity[] = [
  {
    id: "damascus",
    name: "Damascus",
    arabicName: "دمشق",
    description: "Levantine greetings and café talk.",
    cost: 40,
  },
  {
    id: "cairo",
    name: "Cairo",
    arabicName: "القاهرة",
    description: "Egyptian street phrases and media Arabic.",
    cost: 60,
  },
  {
    id: "amman",
    name: "Amman",
    arabicName: "عمّان",
    description: "Jordanian everyday conversation.",
    cost: 50,
  },
  {
    id: "beirut",
    name: "Beirut",
    arabicName: "بيروت",
    description: "Coastal Levantine rhythm and slang.",
    cost: 70,
  },
  {
    id: "riyadh",
    name: "Riyadh",
    arabicName: "الرياض",
    description: "Gulf MSA bridging and formal cues.",
    cost: 80,
  },
];

export function getCityById(cityId: string): PassportCity | undefined {
  return PASSPORT_CITIES.find((c) => c.id === cityId);
}
