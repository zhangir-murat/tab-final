export type Venue = {
  id: string;
  name: string;
  area: string;
  tags: string[];
  mood: string;
  description: string;
  address: string;
  hours: string;
};
export const venues: Venue[] = [
  {
    id: "elsewhere",
    name: "Elsewhere",
    area: "Brooklyn, NY",
    tags: ["Rooftop", "Live Music", "Cocktails"],
    mood: "pink",
    description:
      "A night that goes somewhere. Rooftop catch-ups, dance-floor discoveries, and one more round with your people.",
    address: "599 Johnson Avenue, Brooklyn",
    hours: "Demo hours · 6 PM – 4 AM",
  },
  {
    id: "house-of-yes",
    name: "House of Yes",
    area: "Brooklyn, NY",
    tags: ["Bars", "Live Music", "Cocktails"],
    mood: "orange",
    description:
      "Come as you are. Stay for the unexpected. A little spectacle, a lot of dancing, and very good company.",
    address: "2 Wyckoff Avenue, Brooklyn",
    hours: "Demo hours · 7 PM – 4 AM",
  },
  {
    id: "babys",
    name: "Baby’s All Right",
    area: "Brooklyn, NY",
    tags: ["Bars", "Live Music"],
    mood: "blue",
    description:
      "Find your next favorite band and your next favorite drink. An intimate spot for a very big night.",
    address: "146 Broadway, Brooklyn",
    hours: "Demo hours · 6 PM – 2 AM",
  },
  {
    id: "attaboy",
    name: "Attaboy",
    area: "Manhattan, NY",
    tags: ["Speakeasies", "Cocktails"],
    mood: "green",
    description:
      "Something personal, something unexpected. Settle in for a conversation over cocktails.",
    address: "134 Eldridge Street, Manhattan",
    hours: "Demo hours · 6 PM – 4 AM",
  },
  {
    id: "skinny",
    name: "Skinny Dennis",
    area: "Brooklyn, NY",
    tags: ["Dive Bars", "Bars", "Live Music"],
    mood: "amber",
    description:
      "Honky-tonk energy, a familiar face, and a cold one waiting. Keep it easy tonight.",
    address: "152 Metropolitan Avenue, Brooklyn",
    hours: "Demo hours · 12 PM – 4 AM",
  },
];
export type Drink = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  color: string;
};
export const drinks: Drink[] = [
  {
    id: "paloma",
    name: "Disco Paloma",
    description: "Tequila, grapefruit, lime, soda",
    price: 1600,
    category: "Cocktails",
    color: "peach",
  },
  {
    id: "martini",
    name: "Yes Martini",
    description: "Vodka, dry vermouth, olive",
    price: 1500,
    category: "Cocktails",
    color: "lilac",
  },
  {
    id: "margarita",
    name: "Rave-A-Rita",
    description: "Tequila, citrus, passionfruit",
    price: 1500,
    category: "Cocktails",
    color: "mint",
  },
  {
    id: "mule",
    name: "Brooklyn Mule",
    description: "Vodka, ginger beer, lime",
    price: 1300,
    category: "Cocktails",
    color: "blue",
  },
  {
    id: "espresso",
    name: "Espresso Martini",
    description: "Vodka, espresso, coffee liqueur, vanilla",
    price: 1700,
    category: "Cocktails",
    color: "peach",
  },
  {
    id: "lager",
    name: "Brooklyn Lager",
    description: "Amber lager · 12 oz",
    price: 800,
    category: "Beer",
    color: "mint",
  },
  {
    id: "ipa",
    name: "Hazy IPA",
    description: "Citrus-forward IPA · 12 oz",
    price: 900,
    category: "Beer",
    color: "peach",
  },
  {
    id: "white",
    name: "Sauvignon Blanc",
    description: "Crisp, bright, citrus · 5 oz",
    price: 1200,
    category: "Wine",
    color: "blue",
  },
  {
    id: "red",
    name: "Pinot Noir",
    description: "Soft red fruit · 5 oz",
    price: 1300,
    category: "Wine",
    color: "lilac",
  },
  {
    id: "soda",
    name: "Grapefruit Fizz",
    description: "Grapefruit, lime, soda · zero-proof",
    price: 700,
    category: "Non-Alc",
    color: "mint",
  },
  {
    id: "water",
    name: "Sparkling Water",
    description: "Chilled sparkling water · 330 ml",
    price: 400,
    category: "Non-Alc",
    color: "blue",
  },
  {
    id: "fries",
    name: "Disco Fries",
    description: "Crispy fries, parmesan, house seasoning",
    price: 900,
    category: "Small Bites",
    color: "peach",
  },
  {
    id: "olives",
    name: "Marinated Olives",
    description: "Citrus, rosemary, extra virgin olive oil",
    price: 600,
    category: "Small Bites",
    color: "mint",
  },
];
export type Friend = {
  id: string;
  name: string;
  color: string;
  status: string;
  venue?: string;
  handle: string;
};
export const initialFriends: Friend[] = [
  {
    id: "maya",
    name: "Maya",
    color: "lilac",
    status: "Going out",
    venue: "house-of-yes",
    handle: "mayatab",
  },
  {
    id: "alex",
    name: "Alex",
    color: "mint",
    status: "Open to suggestions",
    handle: "alexnight",
  },
  {
    id: "jordan",
    name: "Jordan",
    color: "peach",
    status: "Staying in",
    handle: "jordanw",
  },
  {
    id: "sam",
    name: "Sam",
    color: "blue",
    status: "Open to suggestions",
    handle: "samtogether",
  },
];
export type Item = {
  key: string;
  drinkId: string;
  name: string;
  price: number;
  quantity: number;
  rim: string;
  ice: string;
  style: string;
  note: string;
  owner: string;
};
export type Round = {
  id: number;
  createdAt: number;
  status: string;
  items: Item[];
};
export type Tab = {
  venueId: string;
  group: boolean;
  members: string[];
  method: string;
  rounds: Round[];
  split: string;
};
export type Receipt = {
  id: string;
  venueId: string;
  rounds: Round[];
  createdAt: number;
  tipPercent: number;
  method: string;
  rating: number;
  splitCount: number;
  covered?: string;
};
export type Plan = {
  id: string;
  venueId: string;
  date: string;
  time: string;
  friends: string[];
  note: string;
  rsvp: string;
};
export type Activity = {
  id: string;
  type: string;
  title: string;
  detail: string;
  friend?: string;
  amount?: number;
};
export type State = {
  version: 1;
  profile: { name: string; handle: string; bio: string; status: string };
  friends: Friend[];
  favorites: string[];
  plans: Plan[];
  activity: Activity[];
  tab: Tab | null;
  cart: Item[];
  cartVenue: string | null;
  receipts: Receipt[];
  nextOrder: number;
};
export const initialState: State = {
  version: 1,
  profile: {
    name: "Maya Chen",
    handle: "mayatab",
    bio: "Good drinks. Better company.",
    status: "Going out",
  },
  friends: initialFriends,
  favorites: [],
  plans: [
    {
      id: "p1",
      venueId: "house-of-yes",
      date: "2026-09-29",
      time: "22:30",
      friends: ["maya", "alex", "sam"],
      note: "Meet you by the bar",
      rsvp: "Going",
    },
    {
      id: "p2",
      venueId: "elsewhere",
      date: "2026-10-02",
      time: "21:00",
      friends: ["alex"],
      note: "Rooftop catch-up",
      rsvp: "Going",
    },
    {
      id: "p3",
      venueId: "babys",
      date: "2026-10-10",
      time: "20:00",
      friends: ["jordan"],
      note: "Live music · invited by Jordan",
      rsvp: "Invited",
    },
  ],
  activity: [
    {
      id: "a1",
      type: "Invites",
      title: "Maya invited you",
      detail: "House of Yes · 10:30 PM",
      friend: "maya",
    },
    {
      id: "a2",
      type: "Friends",
      title: "Sam added you",
      detail: "A familiar face for your next night out",
      friend: "sam",
    },
  ],
  tab: null,
  cart: [],
  cartVenue: null,
  receipts: [],
  nextOrder: 47,
};
