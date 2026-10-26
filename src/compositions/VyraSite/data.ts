// The demo night the films tell (fictional, as on the site): Lumen Club, its loge Le Phare (P1),
// and three requests made up for it. Names, numbers and references are invented.

export const NIGHT = {
  club: 'Lumen Club',
  name: 'Samedi soir',
  date: 'samedi 10 octobre',
  dateTitle: 'Samedi 10 octobre',
  doors: '23h30',
};

export const TABLE = {
  label: 'P1',
  zone: 'Le Phare',
  level: 'Mezzanine',
  tier: 'Prestige',
  capacity: '10–15 pers.',
  minimum: 2500,
};

export interface Request {
  first: string;
  last: string;
  people: number;
  reference: string;
  receivedAt: string;
  phone: string;
  email: string;
  message?: string;
  /** On a night that takes offers: the amount the group offered, or none (its subtotal). */
  offer: number | null;
}

export const REQUESTS: Request[] = [
  {
    first: 'Camille',
    last: 'Roux',
    people: 12,
    reference: 'LMN-7K2QF',
    receivedAt: '10/10 à 23:41',
    phone: '06 12 34 56 78',
    email: 'camille@exemple.fr',
    message: 'Un anniversaire, nous arrivons vers minuit.',
    offer: 3200,
  },
  {
    first: 'Hugo',
    last: 'Martin',
    people: 10,
    reference: 'LMN-4C8XD',
    receivedAt: '10/10 à 22:58',
    phone: '06 48 21 07 33',
    email: 'hugo.m@exemple.fr',
    offer: 2800,
  },
  {
    first: 'Inès',
    last: 'Benali',
    people: 14,
    reference: 'LMN-9P3TA',
    receivedAt: '09/10 à 19:12',
    phone: '07 61 90 25 14',
    email: 'ines.benali@exemple.fr',
    offer: null,
  },
];

/**
 * Each buyer's Instagram, as the dashboard reads it (app: InstagramReach, VYR-89): a pro account's
 * followers and interactions per post, or a private account. Handles end in « .demo »: made up.
 */
export type Reach = {handle: string; followers: number; interactions: number} | {handle: string; private: true};

export const REACH: Record<string, Reach> = {
  'LMN-7K2QF': {handle: 'camille.roux.demo', followers: 3240, interactions: 212},
  'LMN-4C8XD': {handle: 'hugo.martin.demo', followers: 48230, interactions: 2140},
  'LMN-9P3TA': {handle: 'ines.benali.demo', private: true},
};

/** Their requests to the club, this one included (the card's « 3 demandes au club »). */
export const VISITS: Record<string, number> = {'LMN-7K2QF': 1, 'LMN-4C8XD': 3, 'LMN-9P3TA': 2};

/**
 * The night's file once exported (app: src/lib/admin/export.ts, a few of its columns): the loge's
 * three requests and the other tables'. Phone numbers in the range kept for fiction (06 39 98).
 */
export const NIGHT_FILE = [
  {first: 'Camille', last: 'Roux', table: 'P1', people: 12, phone: '06 39 98 12 40', instagram: 'camille.roux.demo', followers: 3240, interactions: 212, visits: 1},
  {first: 'Hugo', last: 'Martin', table: 'P1', people: 10, phone: '06 39 98 48 23', instagram: 'hugo.martin.demo', followers: 48230, interactions: 2140, visits: 3},
  {first: 'Inès', last: 'Benali', table: 'P1', people: 14, phone: '06 39 98 25 14', instagram: 'ines.benali.demo', followers: null, interactions: null, visits: 2},
  {first: 'Léa', last: 'Fontaine', table: 'V4', people: 6, phone: '06 39 98 41 27', instagram: 'lea.fontaine.demo', followers: 12710, interactions: 640, visits: 2},
  {first: 'Yanis', last: 'Haddad', table: 'V6', people: 8, phone: '06 39 98 15 62', instagram: null, followers: null, interactions: null, visits: 1},
  {first: 'Sarah', last: 'Lemoine', table: 'V6', people: 7, phone: '06 39 98 73 08', instagram: 'sarah.lemoine.demo', followers: 1150, interactions: 96, visits: 4},
];

/** The tables the dashboard lists before the loge (same data as content.json). */
export const OTHER_TABLES = [
  {label: 'V4', status: 'Disponible', minimum: 850, capacity: '6–8 pers.', requests: 1},
  {label: 'V5', status: 'Disponible', minimum: 750, capacity: '6–8 pers.', requests: 0},
  {label: 'V6', status: 'Sur demande', minimum: 900, capacity: '6–8 pers.', requests: 2},
];
